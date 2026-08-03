import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MARKETING_PREFERENCE_KEYS } from "@/lib/marketing/preferences";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid unsubscribe link." }, { status: 400 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: "Unsubscribe service is not configured." }, { status: 503 });
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date().toISOString();
  const marketingPreferences = Object.fromEntries(MARKETING_PREFERENCE_KEYS.map((key) => [key, false]));
  const { error } = await supabase.from("marketing_contacts").update({
    email_consent_status: "unsubscribed",
    suppressed_at: now,
    suppression_reason: "recipient_unsubscribe",
    marketing_preferences: marketingPreferences,
    email_consent_at: now,
    email_consent_source: "unsubscribe_link",
    updated_at: now,
  }).eq("id", id);
  if (error) return NextResponse.json({ error: "We could not update your preference." }, { status: 500 });
  const { data: contact } = await supabase.from("marketing_contacts").select("email").eq("id", id).maybeSingle();
  if (contact?.email) await supabase.from("subscribers").update({ email_marketing_consent: false, marketing_preferences: marketingPreferences, email_consent_at: now, email_consent_source: "unsubscribe_link" }).eq("email", contact.email);
  return NextResponse.json({ ok: true });
}
