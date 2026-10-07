import { NextResponse } from "next/server";
import { requireMarketingAdmin } from "@/lib/admin/requireMarketingAdmin";
import { normalizeEmailBranding, renderMarketingEmail, removeReplyToEmailWording, type EmailBranding } from "@/lib/marketing/renderEmail";
import type { EmailBlock } from "@/lib/marketing/templates";
import { campaignPreferenceKey, MARKETING_PREFERENCE_KEYS, normalizeMarketingPreferences } from "@/lib/marketing/preferences";

const clean = (value: unknown, max = 500) => typeof value === "string" ? value.trim().slice(0, max) : "";
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validHttpsUrl = (value: string) => { try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; } };
const htmlEscape = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
const CAMPAIGN_TYPES = ["marketing", "billing", "transactional", "private_message", "special_message", "event", "service_update", "maintenance", "service_alert"] as const;

function isEligible(contact: Record<string, unknown>, campaignType: string) {
  if (contact.suppressed_at) return false;
  const preference = campaignPreferenceKey(campaignType);
  if (!preference) return contact.email_consent_status !== "unsubscribed";
  if (!["subscribed", "transactional_only"].includes(String(contact.email_consent_status))) return false;
  return normalizeMarketingPreferences(contact.marketing_preferences)[preference] !== false;
}

function includesPreferenceCenter(campaignType: string) {
  return campaignType !== "transactional";
}

function personalize(value: string, contact: Record<string, unknown>, html = false) {
  const customFields = contact.custom_fields && typeof contact.custom_fields === "object" ? contact.custom_fields as Record<string, unknown> : {};
  return value.replace(/{{\s*([a-z][a-z0-9_]*)\s*}}/gi, (token, key: string) => {
    if (key === "payment_url" || key === "unsubscribe_url") return token;
    if (key === "month") return new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date());
    if (key === "year") return String(new Date().getFullYear());
    const source = ["first_name", "last_name", "email", "company"].includes(key) ? contact[key] : customFields[key];
    const text = clean(source, key === "amount_due" ? 80 : 2000);
    return html ? htmlEscape(text) : text;
  });
}

function emailBrandingFromSettings(settings: Record<string, unknown> | null): EmailBranding {
  return normalizeEmailBranding({
    logoUrl: clean(settings?.email_logo_url, 2048), logoAlt: clean(settings?.email_logo_alt, 160), headerColor: clean(settings?.email_header_color, 7),
    companyName: clean(settings?.email_company_name, 160), location: clean(settings?.email_location, 160), phone: clean(settings?.email_phone, 48),
    websiteUrl: clean(settings?.email_website_url, 2048), footerNote: clean(settings?.email_footer_note, 300), accentColor: clean(settings?.email_accent_color, 7),
    heroColor: clean(settings?.email_hero_color, 7), footerColor: clean(settings?.email_footer_color, 7), pageColor: clean(settings?.email_page_color, 7),
    fontFamily: clean(settings?.email_font_family, 24) as EmailBranding["fontFamily"],
  });
}

function fillTestTokens(html: string) {
  const examples: Record<string, string> = {
    first_name: "Alex", last_name: "Morgan", email: "alex@example.com", company: "Example Company",
    amount_due: "$1,250.00", amount_paid: "$1,250.00", month: new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date()),
    year: String(new Date().getFullYear()), portal_url: "https://www.icesales.com/portal", maintenance_date: "October 30, 2026",
    maintenance_window: "10:00 PM–12:00 AM ET", service_name: "Managed Cloud Hosting", expected_impact: "Brief service interruption expected",
    maintenance_details: "ICE will validate services after maintenance.", advisory_title: "Important service update",
    affected_systems: "Your managed environment", recommended_action: "No action is required.",
  };
  return html.replace(/{{\s*([a-z][a-z0-9_]*)\s*}}/gi, (token, key: string) => {
    if (key === "payment_url" || key === "unsubscribe_url") return token;
    return examples[key] ?? `Example ${key.replace(/_/g, " ")}`;
  });
}

function withPaymentUrl(html: string, paymentUrl: string) {
  return html
    .replace(/{{\s*payment_url\s*}}/g, htmlEscape(paymentUrl))
    .replace(/https:\/\/quickbooks\.intuit\.com\/?/gi, htmlEscape(paymentUrl));
}

function hasPaymentLink(html: string) {
  return /{{\s*payment_url\s*}}|https:\/\/quickbooks\.intuit\.com\/?/i.test(html);
}

function missingTemplateFields(html: string, recipients: Array<Record<string, unknown>>) {
  const fixed = new Set(["first_name", "last_name", "email", "company", "month", "year", "payment_url", "unsubscribe_url"]);
  const required = [...html.matchAll(/{{\s*([a-z][a-z0-9_]*)\s*}}/gi)].map((match) => match[1]).filter((key) => !fixed.has(key));
  const missing = [...new Set(required)].filter((key) => recipients.some((contact) => {
    const fields = contact.custom_fields && typeof contact.custom_fields === "object" ? contact.custom_fields as Record<string, unknown> : {};
    return !clean(fields[key], 2000);
  }));
  return missing;
}

export async function GET() {
  const auth = await requireMarketingAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const [contacts, lists, members, campaigns, templates] = await Promise.all([
    auth.supabase.from("marketing_contacts").select("*").order("created_at", { ascending: false }).limit(2000),
    auth.supabase.from("marketing_lists").select("*").order("created_at", { ascending: false }),
    auth.supabase.from("marketing_list_members").select("list_id, contact_id"),
    auth.supabase.from("marketing_campaigns").select("*").order("created_at", { ascending: false }).limit(200),
    auth.supabase.from("marketing_templates").select("*").order("updated_at", { ascending: false }).limit(200),
  ]);
  const { data: settings, error: settingsError } = await auth.supabase.from("marketing_settings").select("lead_notification_email,payment_url,email_logo_url,email_logo_alt,email_header_color,email_company_name,email_location,email_phone,email_website_url,email_footer_note,email_accent_color,email_hero_color,email_footer_color,email_page_color,email_font_family").eq("id", true).maybeSingle();

  const firstError = [contacts.error, lists.error, members.error, campaigns.error, templates.error].find(Boolean);
  if (firstError) {
    return NextResponse.json({
      error: firstError.message,
      setupRequired: /marketing_|schema cache|relation/i.test(firstError.message),
    }, { status: 500 });
  }

  return NextResponse.json({
    contacts: contacts.data ?? [],
    lists: (lists.data ?? []).map((list) => ({
      ...list,
      member_count: (members.data ?? []).filter((member) => member.list_id === list.id).length,
    })),
    members: members.data ?? [],
    campaigns: campaigns.data ?? [],
    templates: templates.data ?? [],
    settings: { leadNotificationEmail: settings?.lead_notification_email ?? "", paymentUrl: settings?.payment_url ?? "", branding: emailBrandingFromSettings(settings as Record<string, unknown> | null) },
    paymentSettingsReady: !settingsError,
    resendConnected: Boolean(process.env.RESEND_API_KEY),
  });
}

export async function POST(request: Request) {
  const auth = await requireMarketingAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await request.json().catch(() => ({}));
  const action = clean(body.action, 80);

  if (action === "save_email_settings") {
    const email = clean(body.leadNotificationEmail, 320).toLowerCase();
    const paymentUrl = clean(body.paymentUrl, 2048);
    const rawBranding = body.branding && typeof body.branding === "object" && !Array.isArray(body.branding) ? body.branding as Record<string, unknown> : {};
    const branding = normalizeEmailBranding({
      logoUrl: clean(rawBranding.logoUrl, 2048), logoAlt: clean(rawBranding.logoAlt, 160), headerColor: clean(rawBranding.headerColor, 7),
      companyName: clean(rawBranding.companyName, 160), location: clean(rawBranding.location, 160), phone: clean(rawBranding.phone, 48),
      websiteUrl: clean(rawBranding.websiteUrl, 2048), footerNote: clean(rawBranding.footerNote, 300), accentColor: clean(rawBranding.accentColor, 7),
      heroColor: clean(rawBranding.heroColor, 7), footerColor: clean(rawBranding.footerColor, 7), pageColor: clean(rawBranding.pageColor, 7),
      fontFamily: clean(rawBranding.fontFamily, 24) as EmailBranding["fontFamily"],
    });
    if (email && !validEmail(email)) return NextResponse.json({ error: "Enter a valid notification email address." }, { status: 400 });
    if (paymentUrl && !validHttpsUrl(paymentUrl)) return NextResponse.json({ error: "Enter a valid HTTPS payment link." }, { status: 400 });
    if (rawBranding.logoUrl && !(String(rawBranding.logoUrl).startsWith("/") && !String(rawBranding.logoUrl).startsWith("//")) && !validHttpsUrl(clean(rawBranding.logoUrl, 2048))) return NextResponse.json({ error: "Logo URL must be a secure HTTPS link or a site-relative image path." }, { status: 400 });
    if (rawBranding.websiteUrl && !validHttpsUrl(clean(rawBranding.websiteUrl, 2048))) return NextResponse.json({ error: "Website URL must use HTTPS." }, { status: 400 });
    for (const key of ["accentColor", "heroColor", "headerColor", "footerColor", "pageColor"]) {
      if (rawBranding[key] && !/^#[\da-f]{6}$/i.test(String(rawBranding[key]))) return NextResponse.json({ error: `Enter a valid six-digit hex color for ${key}.` }, { status: 400 });
    }
    if (rawBranding.fontFamily && !["Inter", "Arial", "Georgia"].includes(String(rawBranding.fontFamily))) return NextResponse.json({ error: "Choose Inter, Arial, or Georgia for the email font." }, { status: 400 });
    const { error } = await auth.supabase.from("marketing_settings").upsert({
      id: true, lead_notification_email: email || null, payment_url: paymentUrl || null,
      email_logo_url: branding.logoUrl, email_logo_alt: branding.logoAlt, email_header_color: branding.headerColor,
      email_company_name: branding.companyName, email_location: branding.location, email_phone: branding.phone, email_website_url: branding.websiteUrl,
      email_footer_note: branding.footerNote, email_accent_color: branding.accentColor, email_hero_color: branding.heroColor,
      email_footer_color: branding.footerColor, email_page_color: branding.pageColor, email_font_family: branding.fontFamily,
      updated_at: new Date().toISOString(), updated_by: auth.user.id,
    }, { onConflict: "id" });
    return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
  }

  if (action === "create_list") {
    const name = clean(body.name, 120);
    if (!name) return NextResponse.json({ error: "List name is required." }, { status: 400 });
    const { data, error } = await auth.supabase.from("marketing_lists").insert({
      name,
      description: clean(body.description, 500) || null,
      created_by: auth.user.id,
    }).select("*").single();
    return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ list: data });
  }

  if (action === "import_contacts") {
    const rows = Array.isArray(body.rows) ? body.rows.slice(0, 5000) : [];
    const listId = clean(body.listId, 80) || null;
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const contactIds: string[] = [];

    for (const raw of rows) {
      const email = clean(raw.email, 320).toLowerCase();
      if (!validEmail(email)) { skipped += 1; continue; }
      const consent = raw.email_consent_status === "subscribed" ? "subscribed" : "unknown";
      const values = {
        first_name: clean(raw.first_name, 120) || null,
        last_name: clean(raw.last_name, 120) || null,
        email,
        phone: clean(raw.phone, 60) || null,
        company: clean(raw.company, 180) || null,
        source: clean(raw.source, 120) || "csv_import",
        tags: Array.isArray(raw.tags) ? raw.tags.map((tag: unknown) => clean(tag, 60)).filter(Boolean).slice(0, 30) : [],
        custom_fields: raw.custom_fields && typeof raw.custom_fields === "object" && !Array.isArray(raw.custom_fields)
          ? Object.fromEntries(Object.entries(raw.custom_fields as Record<string, unknown>).slice(0, 50).flatMap(([key, value]) => {
              const normalizedKey = key.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
              const normalizedValue = clean(value, 2000);
              return normalizedKey && normalizedValue ? [[normalizedKey, normalizedValue]] : [];
            }))
          : undefined,
        email_consent_status: consent,
        email_consent_at: consent === "subscribed" ? new Date().toISOString() : null,
        email_consent_source: consent === "subscribed" ? "admin_csv_import_attestation" : null,
        marketing_preferences: consent === "subscribed" ? undefined : {},
        updated_at: new Date().toISOString(),
      };
      const { data: existing } = await auth.supabase.from("marketing_contacts").select("id").ilike("email", email).maybeSingle();
      if (existing) {
        const { error } = await auth.supabase.from("marketing_contacts").update(values).eq("id", existing.id);
        if (error) { skipped += 1; continue; }
        contactIds.push(existing.id); updated += 1;
      } else {
        const { data, error } = await auth.supabase.from("marketing_contacts").insert(values).select("id").single();
        if (error || !data) { skipped += 1; continue; }
        contactIds.push(data.id); imported += 1;
      }
    }

    if (listId && contactIds.length) {
      await auth.supabase.from("marketing_list_members").upsert(
        contactIds.map((contactId) => ({ list_id: listId, contact_id: contactId })),
        { onConflict: "list_id,contact_id", ignoreDuplicates: true },
      );
    }
    return NextResponse.json({ imported, updated, skipped });
  }

  if (action === "add_to_list") {
    const listId = clean(body.listId, 80);
    const contactIds = Array.isArray(body.contactIds) ? body.contactIds.map((id: unknown) => clean(id, 80)).filter(Boolean).slice(0, 5000) : [];
    if (!listId || !contactIds.length) return NextResponse.json({ error: "Choose a list and at least one contact." }, { status: 400 });
    const { error } = await auth.supabase.from("marketing_list_members").upsert(
      contactIds.map((contactId: string) => ({ list_id: listId, contact_id: contactId })),
      { onConflict: "list_id,contact_id", ignoreDuplicates: true },
    );
    return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ added: contactIds.length });
  }

  if (action === "set_consent") {
    const contactId = clean(body.contactId, 80);
    const status = ["subscribed", "unsubscribed", "unknown", "transactional_only"].includes(body.status) ? body.status : "unknown";
    const subscribed = status === "subscribed";
    const { error } = await auth.supabase.from("marketing_contacts").update({
      email_consent_status: status,
      email_consent_at: subscribed ? new Date().toISOString() : null,
      email_consent_source: subscribed ? "admin_verified" : "admin_update",
      suppressed_at: status === "unsubscribed" ? new Date().toISOString() : null,
      suppression_reason: status === "unsubscribed" ? "admin_unsubscribe" : null,
      marketing_preferences: status === "unsubscribed" ? Object.fromEntries(MARKETING_PREFERENCE_KEYS.map((key) => [key, false])) : undefined,
      updated_at: new Date().toISOString(),
    }).eq("id", contactId);
    return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
  }

  if (action === "save_template") {
    const name = clean(body.name, 160);
    if (!name) return NextResponse.json({ error: "Template name is required." }, { status: 400 });
    const blocks = Array.isArray(body.blocks) ? body.blocks.slice(0, 80) : [];
    const values = {
      name,
      category: clean(body.category, 80) || "general",
      description: clean(body.description, 500) || null,
      subject: removeReplyToEmailWording(clean(body.subject, 300)),
      preheader: clean(body.preheader, 500),
      blocks,
      html: renderMarketingEmail({ preheader: clean(body.preheader, 500), blocks, includeUnsubscribe: body.transactional !== true }),
      created_by: auth.user.id,
      updated_at: new Date().toISOString(),
    };
    const query = body.id
      ? auth.supabase.from("marketing_templates").update(values).eq("id", clean(body.id, 80)).select("*").single()
      : auth.supabase.from("marketing_templates").insert(values).select("*").single();
    const { data, error } = await query;
    return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ template: data });
  }

  if (action === "save_campaign") {
    const name = clean(body.name, 160);
    const blocks = Array.isArray(body.blocks) ? body.blocks.slice(0, 80) as EmailBlock[] : [];
    if (!name || !clean(body.subject, 300)) return NextResponse.json({ error: "Campaign name and subject are required." }, { status: 400 });
    const campaignType = CAMPAIGN_TYPES.includes(body.campaignType) ? body.campaignType : "marketing";
    const bodyOnly = body.bodyOnly === true;
    const bodyText = typeof body.bodyText === "string" ? body.bodyText.slice(0, 100000) : "";
    if (bodyOnly && campaignType !== "transactional") return NextResponse.json({ error: "Body-only email is available for transactional messages only. Promotional campaigns must retain the unsubscribe link." }, { status: 400 });
    if (bodyOnly && !bodyText.trim()) return NextResponse.json({ error: "Enter the plain-text email body." }, { status: 400 });
    const values = {
      name,
      campaign_type: campaignType,
      status: ["draft", "review", "approved", "scheduled"].includes(body.status) ? body.status : "draft",
      list_id: clean(body.listId, 80) || null,
      subject: clean(body.subject, 300),
      preheader: clean(body.preheader, 500),
      from_name: clean(body.fromName, 160) || "International Computer Exchange",
      from_email: "noreply@mail.icesales.com",
      reply_to: clean(body.replyTo, 320) || "info@icesales.com",
      blocks,
      body_only: bodyOnly,
      body_text: bodyOnly ? removeReplyToEmailWording(bodyText) : "",
      html: bodyOnly ? "" : renderMarketingEmail({ preheader: clean(body.preheader, 500), blocks, includeUnsubscribe: includesPreferenceCenter(campaignType) }),
      scheduled_at: body.scheduledAt || null,
      created_by: auth.user.id,
      updated_at: new Date().toISOString(),
    };
    const query = body.id
      ? auth.supabase.from("marketing_campaigns").update(values).eq("id", clean(body.id, 80)).select("*").single()
      : auth.supabase.from("marketing_campaigns").insert(values).select("*").single();
    const { data, error } = await query;
    return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ campaign: data });
  }

  if (action === "send_test") {
    if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "Resend is not connected yet. Add RESEND_API_KEY to enable test sends." }, { status: 503 });
    const to = clean(body.to, 320).toLowerCase();
    if (!validEmail(to)) return NextResponse.json({ error: "Enter a valid test email." }, { status: 400 });
    const blocks = Array.isArray(body.blocks) ? body.blocks.slice(0, 80) as EmailBlock[] : [];
    const bodyOnly = body.bodyOnly === true;
    const bodyText = typeof body.bodyText === "string" ? body.bodyText.slice(0, 100000) : "";
    if (bodyOnly && body.campaignType !== "transactional") return NextResponse.json({ error: "Body-only email is available for transactional messages only." }, { status: 400 });
    if (bodyOnly && !bodyText.trim()) return NextResponse.json({ error: "Enter the plain-text email body." }, { status: 400 });
    const { data: mailSettings } = await auth.supabase.from("marketing_settings").select("*").eq("id", true).maybeSingle();
    const paymentUrl = clean(mailSettings?.payment_url, 2048);
    const branding = emailBrandingFromSettings(mailSettings as Record<string, unknown> | null);
    const renderedTestHtml = bodyOnly ? "" : fillTestTokens(renderMarketingEmail({ preheader: clean(body.preheader, 500), blocks, includeUnsubscribe: true, branding }));
    if (!bodyOnly && hasPaymentLink(renderedTestHtml) && !validHttpsUrl(paymentUrl)) return NextResponse.json({ error: "Set a secure customer payment link in Email settings before testing this template." }, { status: 400 });
    const testHtml = bodyOnly ? "" : withPaymentUrl(renderedTestHtml, paymentUrl).replace(/{{unsubscribe_url}}/g, "https://www.icesales.com/subscribe");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "International Computer Exchange <noreply@mail.icesales.com>",
        to: [to],
        reply_to: clean(body.replyTo, 320) || "info@icesales.com",
        subject: `[TEST] ${removeReplyToEmailWording(fillTestTokens(clean(body.subject, 300) || "ICE email preview"))}`,
        ...(bodyOnly ? { text: removeReplyToEmailWording(bodyText) } : { html: testHtml }),
      }),
    });
    const result = await response.json().catch(() => ({}));
    return response.ok ? NextResponse.json({ ok: true, result }) : NextResponse.json({ error: result.message || "Resend rejected the test email." }, { status: response.status });
  }

  if (action === "send_campaign") {
    if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "Resend is not connected yet. Add RESEND_API_KEY before sending campaigns." }, { status: 503 });
    const campaignId = clean(body.campaignId, 80);
    const { data: campaign, error: campaignError } = await auth.supabase.from("marketing_campaigns").select("*").eq("id", campaignId).single();
    if (campaignError || !campaign) return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
    if (!campaign.list_id) return NextResponse.json({ error: "Choose an audience list before sending." }, { status: 400 });
    if (!['approved', 'scheduled'].includes(campaign.status)) return NextResponse.json({ error: "Campaign must be approved before it can be sent." }, { status: 400 });
    if (campaign.body_only && campaign.campaign_type !== "transactional") return NextResponse.json({ error: "Body-only email is restricted to transactional messages." }, { status: 400 });
    if (campaign.body_only && !String(campaign.body_text ?? "").trim()) return NextResponse.json({ error: "The plain-text email body is empty." }, { status: 400 });

    const { data: memberships } = await auth.supabase.from("marketing_list_members").select("contact_id").eq("list_id", campaign.list_id);
    const ids = (memberships ?? []).map((item) => item.contact_id);
    if (!ids.length) return NextResponse.json({ error: "The selected list has no contacts." }, { status: 400 });
    const { data: contacts, error: recipientError } = await auth.supabase.from("marketing_contacts").select("*").in("id", ids);
    if (recipientError) return NextResponse.json({ error: recipientError.message }, { status: 400 });
    const recipients = (contacts ?? []).filter((contact) => isEligible(contact, campaign.campaign_type));
    if (!recipients?.length) return NextResponse.json({ error: "No eligible recipients remain after consent and suppression checks." }, { status: 400 });
    const { data: mailSettings } = await auth.supabase.from("marketing_settings").select("*").eq("id", true).maybeSingle();
    const paymentUrl = clean(mailSettings?.payment_url, 2048);
    const branding = emailBrandingFromSettings(mailSettings as Record<string, unknown> | null);
    const campaignHtml = campaign.body_only ? "" : renderMarketingEmail({ preheader: campaign.preheader, blocks: (campaign.blocks ?? []) as EmailBlock[], includeUnsubscribe: includesPreferenceCenter(campaign.campaign_type), branding });
    if (!campaign.body_only && hasPaymentLink(campaignHtml) && !validHttpsUrl(paymentUrl)) return NextResponse.json({ error: "Set a secure customer payment link in Email settings before sending this campaign." }, { status: 400 });
    const missingFields = campaign.body_only ? [] : missingTemplateFields(`${campaignHtml}\n${campaign.subject}\n${campaign.preheader}`, recipients);
    if (missingFields.length) return NextResponse.json({ error: `Add values for ${missingFields.map((field) => `“${field}”`).join(", ")} to each recipient’s CSV custom fields before sending.` }, { status: 400 });
    if (campaign.body_only && recipients.length !== 1) return NextResponse.json({ error: "Body-only transactional email must have exactly one eligible recipient. Choose a list containing just that person." }, { status: 400 });

    await auth.supabase.from("marketing_campaigns").update({ status: "sending", recipient_count: recipients.length, updated_at: new Date().toISOString() }).eq("id", campaign.id);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.icesales.com";
    let sent = 0;
    for (let index = 0; index < recipients.length; index += 100) {
      const batch = recipients.slice(index, index + 100).map((contact) => ({
        from: `${campaign.from_name} <noreply@mail.icesales.com>`,
        to: [contact.email],
        reply_to: campaign.reply_to,
        subject: removeReplyToEmailWording(personalize(campaign.subject, contact)),
        ...(campaign.body_only
          ? { text: removeReplyToEmailWording(String(campaign.body_text ?? "")) }
          : {
              html: withPaymentUrl(personalize(campaignHtml, contact, true), paymentUrl).replace(/{{unsubscribe_url}}/g, `${siteUrl}/unsubscribe/${contact.id}`),
              headers: {
                "List-Unsubscribe": `<${siteUrl}/api/marketing/unsubscribe?id=${contact.id}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              },
            }),
        tags: [{ name: "campaign_id", value: campaign.id }],
      }));
      const response = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(batch),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        await auth.supabase.from("marketing_campaigns").update({ status: "approved", delivered_count: sent, updated_at: new Date().toISOString() }).eq("id", campaign.id);
        return NextResponse.json({ error: result.message || `Resend stopped after ${sent} recipients.` }, { status: response.status });
      }
      sent += batch.length;
    }
    const now = new Date().toISOString();
    await Promise.all([
      auth.supabase.from("marketing_campaigns").update({ status: "sent", sent_at: now, delivered_count: sent, updated_at: now }).eq("id", campaign.id),
      auth.supabase.from("marketing_contacts").update({ last_emailed_at: now, updated_at: now }).in("id", recipients.map((contact) => contact.id)),
    ]);
    return NextResponse.json({ sent });
  }

  return NextResponse.json({ error: "Unknown marketing action." }, { status: 400 });
}
