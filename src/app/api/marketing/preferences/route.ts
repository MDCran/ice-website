import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { DEFAULT_MARKETING_PREFERENCES, normalizeMarketingPreferences } from "@/lib/marketing/preferences";

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const validId = (value: string) => /^[0-9a-f-]{36}$/i.test(value);

function getAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET(request: Request) {
  const id = clean(new URL(request.url).searchParams.get("id"), 80);
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Preference service is not configured." }, { status: 503 });
  if (!validId(id)) return NextResponse.json({ error: "Invalid preference link." }, { status: 400 });
  const { data, error } = await supabase.from("marketing_contacts").select("id, first_name, last_name, email, phone, company, email_consent_status, marketing_preferences").eq("id", id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "This preference link is no longer available." }, { status: 404 });
  return NextResponse.json({ contact: { ...data, marketing_preferences: normalizeMarketingPreferences(data.marketing_preferences, data.email_consent_status === "unsubscribed" ? { ...DEFAULT_MARKETING_PREFERENCES, marketing_materials: false } : DEFAULT_MARKETING_PREFERENCES) } });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const id = clean(body.id, 80);
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Preference service is not configured." }, { status: 503 });
  if (!validId(id)) return NextResponse.json({ error: "Invalid preference link." }, { status: 400 });

  const { data: existing, error: lookupError } = await supabase.from("marketing_contacts").select("id, email").eq("id", id).maybeSingle();
  if (lookupError || !existing) return NextResponse.json({ error: "This preference link is no longer available." }, { status: 404 });

  const preferences = normalizeMarketingPreferences(body.preferences, DEFAULT_MARKETING_PREFERENCES);
  const hasConsent = Object.values(preferences).some(Boolean);
  const now = new Date().toISOString();
  const name = clean(body.name, 200);
  const phone = clean(body.phone, 50);
  const company = clean(body.company, 200);
  const nameParts = name.split(/\s+/).filter(Boolean);
  const { error } = await supabase.from("marketing_contacts").update({
    first_name: nameParts[0] || null,
    last_name: nameParts.slice(1).join(" ") || null,
    phone: phone || null,
    company: company || null,
    email_consent_status: hasConsent ? "subscribed" : "unsubscribed",
    email_consent_at: now,
    email_consent_source: "preference_center",
    marketing_preferences: preferences,
    suppressed_at: hasConsent ? null : now,
    suppression_reason: hasConsent ? null : "recipient_preference_center",
    updated_at: now,
  }).eq("id", id);
  if (error) return NextResponse.json({ error: "We could not update your preferences." }, { status: 500 });

  await supabase.from("subscribers").update({
    name: name || null,
    phone: phone || null,
    company: company || null,
    email_marketing_consent: hasConsent,
    email_consent_at: now,
    email_consent_source: "preference_center",
    marketing_preferences: preferences,
  }).eq("email", existing.email);

  return NextResponse.json({ ok: true, subscribed: hasConsent });
}
