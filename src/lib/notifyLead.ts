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
export async function notifyLeadEmail(lead: LeadPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.LEAD_NOTIFY_EMAIL?.trim();
  if (!apiKey || !to) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.LEAD_NOTIFY_FROM?.trim() || "ICE Website <onboarding@resend.dev>",
        to: [to],
        subject: `New lead: ${lead.name}${lead.service ? ` — ${lead.service}` : ""}`,
        text: [
          `Name: ${lead.name}`,
          `Email: ${lead.email}`,
          `Company: ${lead.company ?? "—"}`,
          `Phone: ${lead.phone ?? "—"}`,
          `Service: ${lead.service ?? "—"}`,
          `Source: ${lead.source ?? "contact"}`,
          "",
          lead.message ?? "",
        ].join("\n"),
      }),
    });
  } catch (err) {
    console.error("[notifyLeadEmail]", err);
  }
}

export async function notifyNewLead(lead: LeadPayload): Promise<void> {
  await Promise.allSettled([notifyLeadSlack(lead), notifyLeadEmail(lead)]);
}
