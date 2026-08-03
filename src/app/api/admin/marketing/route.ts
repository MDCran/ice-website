import { NextResponse } from "next/server";
import { requireMarketingAdmin } from "@/lib/admin/requireMarketingAdmin";
import { renderMarketingEmail } from "@/lib/marketing/renderEmail";
import type { EmailBlock } from "@/lib/marketing/templates";
import { campaignPreferenceKey, MARKETING_PREFERENCE_KEYS, normalizeMarketingPreferences } from "@/lib/marketing/preferences";

const clean = (value: unknown, max = 500) => typeof value === "string" ? value.trim().slice(0, max) : "";
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

function personalize(value: string, contact: Record<string, unknown>) {
  return value.replace(/{{\s*(first_name|last_name|email|company)\s*}}/g, (_, key: string) => clean(contact[key], 500));
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
    resendConnected: Boolean(process.env.RESEND_API_KEY),
  });
}

export async function POST(request: Request) {
  const auth = await requireMarketingAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await request.json().catch(() => ({}));
  const action = clean(body.action, 80);

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
      subject: clean(body.subject, 300),
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
    const values = {
      name,
      campaign_type: campaignType,
      status: ["draft", "review", "approved", "scheduled"].includes(body.status) ? body.status : "draft",
      list_id: clean(body.listId, 80) || null,
      subject: clean(body.subject, 300),
      preheader: clean(body.preheader, 500),
      from_name: clean(body.fromName, 160) || "International Computer Exchange",
      from_email: clean(body.fromEmail, 320) || process.env.MARKETING_FROM_EMAIL || "info@icesales.com",
      reply_to: clean(body.replyTo, 320) || "info@icesales.com",
      blocks,
      html: renderMarketingEmail({ preheader: clean(body.preheader, 500), blocks, includeUnsubscribe: includesPreferenceCenter(campaignType) }),
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
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.MARKETING_FROM_EMAIL || "International Computer Exchange <onboarding@resend.dev>",
        to: [to],
        reply_to: clean(body.replyTo, 320) || "info@icesales.com",
        subject: `[TEST] ${clean(body.subject, 300) || "ICE email preview"}`,
        html: renderMarketingEmail({ preheader: clean(body.preheader, 500), blocks, includeUnsubscribe: false }),
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

    const { data: memberships } = await auth.supabase.from("marketing_list_members").select("contact_id").eq("list_id", campaign.list_id);
    const ids = (memberships ?? []).map((item) => item.contact_id);
    if (!ids.length) return NextResponse.json({ error: "The selected list has no contacts." }, { status: 400 });
    const { data: contacts, error: recipientError } = await auth.supabase.from("marketing_contacts").select("*").in("id", ids);
    if (recipientError) return NextResponse.json({ error: recipientError.message }, { status: 400 });
    const recipients = (contacts ?? []).filter((contact) => isEligible(contact, campaign.campaign_type));
    if (!recipients?.length) return NextResponse.json({ error: "No eligible recipients remain after consent and suppression checks." }, { status: 400 });

    await auth.supabase.from("marketing_campaigns").update({ status: "sending", recipient_count: recipients.length, updated_at: new Date().toISOString() }).eq("id", campaign.id);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.icesales.com";
    let sent = 0;
    for (let index = 0; index < recipients.length; index += 100) {
      const batch = recipients.slice(index, index + 100).map((contact) => ({
        from: `${campaign.from_name} <${process.env.MARKETING_FROM_EMAIL || campaign.from_email}>`,
        to: [contact.email],
        reply_to: campaign.reply_to,
        subject: personalize(campaign.subject, contact),
        html: personalize(campaign.html, contact).replace(/{{unsubscribe_url}}/g, `${siteUrl}/unsubscribe/${contact.id}`),
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
