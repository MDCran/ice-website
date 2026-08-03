import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { campaignPreferenceKey, normalizeMarketingPreferences } from "@/lib/marketing/preferences";

const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";
const personalize = (value: string, contact: Record<string, unknown>) => value.replace(/{{\s*(first_name|last_name|email|company)\s*}}/g, (_, key: string) => clean(contact[key]));

function isEligible(contact: Record<string, unknown>, campaignType: string) {
  if (contact.suppressed_at) return false;
  const preference = campaignPreferenceKey(campaignType);
  if (!preference) return contact.email_consent_status !== "unsubscribed";
  if (!["subscribed", "transactional_only"].includes(String(contact.email_consent_status))) return false;
  return normalizeMarketingPreferences(contact.marketing_preferences)[preference] !== false;
}

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authorization !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.RESEND_API_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: "Marketing delivery is not configured." }, { status: 503 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: campaigns, error } = await supabase.from("marketing_campaigns").select("*").eq("status", "scheduled").lte("scheduled_at", new Date().toISOString()).limit(10);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const results: Array<{ id: string; sent: number; error?: string }> = [];

  for (const campaign of campaigns ?? []) {
    if (!campaign.list_id) { results.push({ id: campaign.id, sent: 0, error: "No audience list" }); continue; }
    const { data: memberships } = await supabase.from("marketing_list_members").select("contact_id").eq("list_id", campaign.list_id);
    const ids = (memberships ?? []).map((item) => item.contact_id);
    if (!ids.length) { results.push({ id: campaign.id, sent: 0, error: "Empty audience" }); continue; }
    const { data: contacts } = await supabase.from("marketing_contacts").select("*").in("id", ids);
    const recipients = (contacts ?? []).filter((contact) => isEligible(contact, campaign.campaign_type));
    if (!recipients?.length) { results.push({ id: campaign.id, sent: 0, error: "No eligible recipients" }); continue; }

    await supabase.from("marketing_campaigns").update({ status: "sending", recipient_count: recipients.length }).eq("id", campaign.id);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.icesales.com";
    let sent = 0;
    let sendError = "";
    for (let index = 0; index < recipients.length; index += 100) {
      const batch = recipients.slice(index, index + 100).map((contact) => ({
        from: `${campaign.from_name} <${process.env.MARKETING_FROM_EMAIL || campaign.from_email}>`,
        to: [contact.email],
        reply_to: campaign.reply_to,
        subject: personalize(campaign.subject, contact),
        html: personalize(campaign.html, contact).replace(/{{unsubscribe_url}}/g, `${siteUrl}/unsubscribe/${contact.id}`),
        tags: [{ name: "campaign_id", value: campaign.id }],
      }));
      const response = await fetch("https://api.resend.com/emails/batch", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(batch) });
      if (!response.ok) { const detail = await response.json().catch(() => ({})); sendError = detail.message || "Resend rejected the batch."; break; }
      sent += batch.length;
    }
    const now = new Date().toISOString();
    await supabase.from("marketing_campaigns").update(sendError ? { status: "approved", delivered_count: sent, updated_at: now } : { status: "sent", sent_at: now, delivered_count: sent, updated_at: now }).eq("id", campaign.id);
    if (sent > 0) await supabase.from("marketing_contacts").update({ last_emailed_at: now, updated_at: now }).in("id", recipients.slice(0, sent).map((contact) => contact.id));
    results.push({ id: campaign.id, sent, ...(sendError ? { error: sendError } : {}) });
  }
  return NextResponse.json({ processed: results.length, results });
}
