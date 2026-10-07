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
const EMAIL_LOGO_URL = "https://www.icesales.com/images/logo/ice-logo.jpg";

function leadEmailHtml(lead: LeadPayload, confirmation = false) {
  const rows = [
    ["Name", lead.name], ["Email", lead.email], ["Company", lead.company],
    ["Phone", lead.phone], ["Service", lead.service], ["Request", lead.message],
  ].filter(([, value]) => Boolean(value)).map(([label, value]) => `<tr><th align="left" style="padding:12px 14px;border-bottom:1px solid #e4e7ec;color:#667085;font-size:13px;font-weight:600">${escapeHtml(String(label))}</th><td style="padding:12px 14px;border-bottom:1px solid #e4e7ec;color:#344054;font-size:14px;line-height:1.6">${escapeHtml(String(value)).replace(/\n/g, "<br>")}</td></tr>`).join("");
  const title = confirmation ? "We received your request" : "New website request";
  const intro = confirmation
    ? "Thank you for contacting International Computer Exchange. A member of our team will review your note and follow up using the contact details you provided."
    : `A new ${escapeHtml(lead.source || "website")} request has arrived.`;
  const help = confirmation
    ? `For assistance, call <a href="tel:18007869188" style="color:#027aab;font-weight:600">1-800-786-9188</a>.`
    : `<a href="mailto:${encodeURIComponent(lead.email)}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#027aab;color:#fff;text-decoration:none;font-size:14px;font-weight:700">Email ${escapeHtml(lead.name)}</a>`;

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#eef2f6;font-family:Arial,Helvetica,sans-serif;color:#101828">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${confirmation ? "We received your message and our team will follow up." : "A new request has been received by ICE."}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef2f6">
    <tr><td align="center" style="padding:28px 12px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;overflow:hidden;border:1px solid #d0d5dd;border-radius:16px;background:#fff">
        <tr><td style="padding:18px 28px;border-bottom:1px solid #e4e7ec;background:#fff">
          <a href="https://www.icesales.com" style="display:inline-block;text-decoration:none"><img src="${EMAIL_LOGO_URL}" width="150" height="73" alt="International Computer Exchange" style="display:block;width:150px;height:73px;border:0;object-fit:contain"></a>
        </td></tr>
        <tr><td bgcolor="#0b1628" style="padding:26px 28px 28px;background-color:#0b1628;background-image:linear-gradient(rgba(145,217,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(145,217,255,.07) 1px,transparent 1px);background-size:32px 32px;color:#fff">
          <p style="margin:0 0 9px;color:#91d9ff;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:1.8px;text-transform:uppercase">${confirmation ? "Contact request" : "Website notification"}</p>
          <h1 style="margin:0;font-size:26px;line-height:1.25;font-weight:700;color:#fff">${title}</h1>
          <p style="margin:10px 0 0;color:#d4e2ef;font-size:15px;line-height:1.65">${intro}</p>
        </td></tr>
        <tr><td style="padding:24px 28px 28px">
          ${confirmation ? `<p style="margin:0 0 12px;color:#344054;font-size:14px;line-height:1.5;font-weight:700">A copy of your request</p>` : `<p style="margin:0 0 16px;color:#475467;font-size:14px;line-height:1.6">Review the submitted contact details and request below.</p>`}
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #dce3eb;border-radius:10px;border-collapse:separate">${rows}</table>
          <p style="margin:20px 0 0;color:#475467;font-size:14px;line-height:1.6">${help}</p>
        </td></tr>
        <tr><td bgcolor="#0b1628" style="padding:20px 28px;background:#0b1628;color:#c7d5e2;font-size:12px;line-height:1.7">
          <strong style="color:#fff">International Computer Exchange</strong><br>Boca Raton, Florida · <a href="tel:18007869188" style="color:#91d9ff;text-decoration:underline">1-800-786-9188</a><br>
          <a href="https://www.icesales.com" style="color:#91d9ff;text-decoration:underline">www.icesales.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
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
