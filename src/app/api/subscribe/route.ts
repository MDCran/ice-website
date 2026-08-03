import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { DEFAULT_MARKETING_PREFERENCES, normalizeMarketingPreferences } from "@/lib/marketing/preferences";

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = clean(body.name, 200);
    const email = clean(body.email, 320).toLowerCase();
    const phone = clean(body.phone, 50);
    const company = clean(body.company, 200);
    const preferences = normalizeMarketingPreferences(body.preferences, DEFAULT_MARKETING_PREFERENCES);
    const hasConsent = Object.values(preferences).some(Boolean);
    const now = new Date().toISOString();

    if (!name || !email || !phone) return NextResponse.json({ error: "Name, email, and phone number are required." }, { status: 400 });
    if (!emailPattern.test(email)) return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ error: "Subscription service is not configured." }, { status: 503 });
    }

    const supabase = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const consentIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");
    const nameParts = name.split(/\s+/);
    const { data: contact, error } = await supabase.from("marketing_contacts").upsert({
      first_name: nameParts[0] || null,
      last_name: nameParts.slice(1).join(" ") || null,
      email,
      phone,
      company: company || null,
      source: clean(body.source, 120) || "subscription_page",
      email_consent_status: hasConsent ? "subscribed" : "unsubscribed",
      email_consent_at: now,
      email_consent_source: "subscription_page",
      consent_ip: consentIp,
      consent_user_agent: userAgent,
      marketing_preferences: preferences,
      suppressed_at: hasConsent ? null : now,
      suppression_reason: hasConsent ? null : "recipient_preference_center",
      updated_at: now,
    }, { onConflict: "email" }).select("id, email").single();

    if (error || !contact) {
      console.error("Marketing contact upsert error:", error);
      return NextResponse.json({ error: "We could not save your subscription preferences." }, { status: 500 });
    }

    // Keep the legacy subscriber view in sync for the existing admin subscriber page.
    const subscriberValues = {
      name,
      email,
      company: company || null,
      phone,
      sms_consent: false,
      email_marketing_consent: hasConsent,
      email_consent_at: now,
      email_consent_source: "subscription_page",
      marketing_preferences: preferences,
      consent_ip: consentIp,
      consent_user_agent: userAgent,
    };
    const { data: legacySubscriber } = await supabase.from("subscribers").select("id").eq("email", email).maybeSingle();
    if (legacySubscriber) await supabase.from("subscribers").update(subscriberValues).eq("id", legacySubscriber.id);
    else await supabase.from("subscribers").insert(subscriberValues);

    return NextResponse.json({ ok: true, id: contact.id, email: contact.email, preferenceUrl: `/unsubscribe/${contact.id}` }, { status: 201 });
  } catch (error) {
    console.error("Subscription submission error:", error);
    return NextResponse.json({ error: "An error occurred while saving your preferences." }, { status: 500 });
  }
}
