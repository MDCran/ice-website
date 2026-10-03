import { createClient } from "@supabase/supabase-js";

/**
 * Lead notification helpers (#41).
 * Fires Slack webhook and/or email webhook when configured.
 * No-ops when env vars are unset so local/dev stays quiet.
 */

export interface LeadPayload {
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  service?: string | null;
  message?: string | null;
  source?: string;
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);

function leadEmailHtml(lead: LeadPayload, confirmation = false) {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.icesales.com";
  const rows = [
    ["Name", lead.name], ["Email", lead.email], ["Company", lead.company],
    ["Phone", lead.phone], ["Service", lead.service], ["Request", lead.message],
  ].filter(([, value]) => Boolean(value)).map(([label, value]) => `<tr><th align="left" style="padding:12px 14px;border-bottom:1px solid #e4e7ec;color:#667085;font-size:13px;font-weight:600">${escapeHtml(String(label))}</th><td style="padding:12px 14px;border-bottom:1px solid #e4e7ec;color:#344054;font-size:14px;line-height:1.6">${escapeHtml(String(value)).replace(/\n/g, "<br>")}</td></tr>`).join("");
  return `<!doctype html><html><body style="margin:0;background:#eef2f6;font-family:Arial,Helvetica,sans-serif;color:#101828"><div style="display:none;max-height:0;overflow:hidden">${confirmation ? "We received your message and our team will follow up." : "A new request has been received by ICE."}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2f6"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fff;border:1px solid #d0d5dd;border-radius:16px;overflow:hidden"><tr><td style="padding:20px 32px;border-bottom:1px solid #e4e7ec"><img src="${site}/images/logo/ice-logo.jpg" width="150" alt="International Computer Exchange" style="display:block;width:150px;height:auto"></td></tr><tr><td style="padding:32px"><div style="width:40px;height:40px;line-height:40px;text-align:center;border-radius:50%;background:#ecfdf3;color:#039855;font-size:24px;font-weight:700">✓</div><h1 style="margin:18px 0 8px;font-size:25px;line-height:1.25">${confirmation ? "We received your request" : "New website request"}</h1><p style="margin:0 0 22px;color:#475467;font-size:15px;line-height:1.65">${confirmation ? "Thank you for contacting International Computer Exchange. A member of our team will review your note and follow up using the contact details you provided." : `A new ${escapeHtml(lead.source || "website")} request has arrived.`}</p>${confirmation ? `<p style="margin:0 0 12px;color:#344054;font-size:14px;font-weight:700">A copy of your request</p>` : ""}<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e4e7ec;border-radius:10px;border-collapse:separate">${rows}</table>${confirmation ? `<p style="margin:22px 0 0;color:#475467;font-size:14px;line-height:1.6">If you need to add anything, reply to this email or call <a href="tel:18007869188" style="color:#027aab">1-800-786-9188</a>.</p>` : `<p style="margin:22px 0 0"><a href="mailto:${encodeURIComponent(lead.email)}" style="display:inline-block;padding:12px 18px;background:#027aab;color:#fff;border-radius:8px;text-decoration:none;font-weight:700">Reply to ${escapeHtml(lead.name)}</a></p>`}</td></tr><tr><td style="padding:22px 32px;background:#101828;color:#d0d5dd;font-size:12px;line-height:1.7"><strong style="color:#fff">International Computer Exchange</strong><br>Boca Raton, Florida · 1-800-786-9188</td></tr></table></td></tr></table></body></html>`;
}

async function sendLeadEmail(to: string, lead: LeadPayload, confirmation: boolean): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || !to) return false;
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to);
  if (!isValidEmail) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "International Computer Exchange <noreply@mail.icesales.com>",
        to: [to],
        reply_to: confirmation ? "info@icesales.com" : lead.email,
        subject: confirmation ? "ICE received your request" : `New request: ${lead.name}${lead.service ? ` — ${lead.service}` : ""}`,
        html: leadEmailHtml(lead, confirmation),
        tags: [{ name: "message_kind", value: confirmation ? "lead_confirmation" : "lead_notification" }],
      }),
    });
    if (!response.ok) {
      console.error("[notifyLeadEmail] Resend rejected a lead email.");
      return false;
    }
    return true;
  } catch (error) {
    console.error("[notifyLeadEmail] Could not send a lead email.", error);
    return false;
  }
}

async function getLeadNotificationEmail() {
  const fallback = process.env.LEAD_NOTIFY_EMAIL?.trim() || "";
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) return fallback;
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data } = await supabase.from("marketing_settings").select("lead_notification_email").eq("id", true).maybeSingle();
    return typeof data?.lead_notification_email === "string" && data.lead_notification_email.trim() ? data.lead_notification_email.trim() : fallback;
  } catch {
    return fallback;
  }
}

function truncate(value: string | null | undefined, max = 280): string {
  if (!value) return "—";
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

/** Post a Slack incoming-webhook message if SLACK_LEAD_WEBHOOK_URL is set. */
export async function notifyLeadSlack(lead: LeadPayload): Promise<void> {
  const url = process.env.SLACK_LEAD_WEBHOOK_URL?.trim();
  if (!url) return;

  const text = [
    `*New ICE lead* (${lead.source ?? "contact"})`,
    `• *Name:* ${lead.name}`,
    `• *Email:* ${lead.email}`,
    `• *Company:* ${lead.company ?? "—"}`,
    `• *Phone:* ${lead.phone ?? "—"}`,
    `• *Service:* ${lead.service ?? "—"}`,
    `• *Message:* ${truncate(lead.message)}`,
  ].join("\n");

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    console.error("[notifyLeadSlack]", err);
  }
}

/**
 * Optional transactional email via Resend-compatible API.
 * Requires RESEND_API_KEY + LEAD_NOTIFY_EMAIL.
 */
export async function notifyLeadEmail(lead: LeadPayload): Promise<boolean> {
  const customerConfirmation = sendLeadEmail(lead.email, lead, true);
  const staffNotification = getLeadNotificationEmail().then((to) => sendLeadEmail(to, lead, false));
  const [, confirmationSent] = await Promise.all([staffNotification, customerConfirmation]);
  return confirmationSent;
}

export async function notifyNewLead(lead: LeadPayload): Promise<{ confirmationEmailSent: boolean }> {
  void notifyLeadSlack(lead);
  const confirmationEmailSent = await notifyLeadEmail(lead);
  return {
    confirmationEmailSent,
  };
}
