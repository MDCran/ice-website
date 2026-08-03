import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function verifyWebhook(payload: string, headers: Headers, secret: string) {
  const id = headers.get("svix-id") ?? "";
  const timestamp = headers.get("svix-timestamp") ?? "";
  const signatures = (headers.get("svix-signature") ?? "").split(" ").map((item) => item.replace(/^v1,/, ""));
  if (!id || !timestamp || !signatures.length) return false;
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${payload}`).digest("base64");
  return signatures.some((signature) => {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret || !process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  const payload = await request.text();
  if (!verifyWebhook(payload, request.headers, secret)) return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  const event = JSON.parse(payload) as { type?: string; data?: { email_id?: string; to?: string[]; tags?: Record<string, string> } };
  const campaignId = event.data?.tags?.campaign_id;
  const email = event.data?.to?.[0]?.toLowerCase();
  const type = event.type ?? "unknown";
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: contact } = email ? await supabase.from("marketing_contacts").select("id").eq("email", email).maybeSingle() : { data: null };
  await supabase.from("marketing_events").insert({
    campaign_id: campaignId || null,
    contact_id: contact?.id || null,
    provider_message_id: event.data?.email_id || null,
    event_type: type,
    metadata: event,
  });

  if (contact?.id && ["email.bounced", "email.complained"].includes(type)) {
    await supabase.from("marketing_contacts").update({
      suppressed_at: new Date().toISOString(),
      suppression_reason: type === "email.complained" ? "complaint" : "bounce",
      updated_at: new Date().toISOString(),
    }).eq("id", contact.id);
  }
  if (campaignId) {
    const column = type === "email.opened" ? "opened_count" : type === "email.clicked" ? "clicked_count" : type === "email.bounced" ? "bounced_count" : type === "email.complained" ? "complained_count" : null;
    if (column) {
      const { data: campaign } = await supabase.from("marketing_campaigns").select(column).eq("id", campaignId).single();
      const current = Number((campaign as Record<string, unknown> | null)?.[column] ?? 0);
      await supabase.from("marketing_campaigns").update({ [column]: current + 1 }).eq("id", campaignId);
    }
  }
  return NextResponse.json({ received: true });
}

