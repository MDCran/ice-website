import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { notifyNewLead } from "@/lib/notifyLead";

/** Max lengths to keep submissions sane (DB columns are unbounded text). */
const MAX_LENGTHS = {
  name: 200,
  email: 320,
  company: 200,
  phone: 50,
  service: 200,
  message: 5000,
  formKey: 120,
  source: 160,
  pagePath: 500,
  referrer: 1000,
} as const;

/** Trim a value if it's a non-empty string; otherwise return null. */
function cleanString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function cleanRecord(value: unknown, maxEntries = 20): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .slice(0, maxEntries)
      .flatMap(([key, entry]) => {
        const cleanKey = cleanString(key, 80);
        const cleanValue = cleanString(entry, 500);
        return cleanKey && cleanValue ? [[cleanKey, cleanValue]] : [];
      }),
  );
}

function calculateLeadScore(input: {
  company: string | null;
  phone: string | null;
  service: string | null;
  source: string | null;
  qualification: Record<string, string>;
}): number | null {
  if (!input.source && Object.keys(input.qualification).length === 0) return null;

  let score = 15;
  if (input.company) score += 15;
  if (input.phone) score += 10;
  if (input.service) score += 10;
  if (/enterprise|executive|rfp|architecture|compliance/i.test(input.source ?? "")) score += 15;

  const timeline = input.qualification.timeline?.toLowerCase() ?? "";
  if (/immediate|incident/.test(timeline)) score += 30;
  else if (/0-3|0 to 3/.test(timeline)) score += 25;
  else if (/3-6|3 to 6/.test(timeline)) score += 18;
  else if (/6-12|6 to 12/.test(timeline)) score += 10;
  else if (timeline) score += 5;

  if (input.qualification.priority) score += 5;
  return Math.min(100, Math.max(0, score));
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > 64_000) {
      return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    // Honeypot: real users never see or populate this field.
    if (cleanString((body as Record<string, unknown>).website, 200)) {
      return NextResponse.json(
        { message: "Contact form submitted successfully." },
        { status: 201 },
      );
    }

    const {
      name,
      email,
      company,
      phone,
      service,
      message,
      smsConsent,
      marketingConsent,
      formKey,
      source,
      pagePath,
      referrer,
      utm,
      qualification,
    } = body as Record<string, unknown>;

    const cleanName = cleanString(name, MAX_LENGTHS.name);
    const cleanEmail = cleanString(email, MAX_LENGTHS.email);
    const cleanMessage = cleanString(message, MAX_LENGTHS.message);

    if (!cleanName || !cleanEmail || !cleanMessage) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const cleanCompany = cleanString(company, MAX_LENGTHS.company);
    const cleanPhone = cleanString(phone, MAX_LENGTHS.phone);
    const cleanService = cleanString(service, MAX_LENGTHS.service);
    const cleanFormKey = cleanString(formKey, MAX_LENGTHS.formKey);
    const cleanSource = cleanString(source, MAX_LENGTHS.source);
    const cleanPagePath = cleanString(pagePath, MAX_LENGTHS.pagePath);
    const cleanReferrer = cleanString(referrer, MAX_LENGTHS.referrer);
    const cleanUtm = cleanRecord(utm, 10);
    const cleanQualification = cleanRecord(qualification, 20);
    const leadScore = calculateLeadScore({
      company: cleanCompany,
      phone: cleanPhone,
      service: cleanService,
      source: cleanSource,
      qualification: cleanQualification,
    });

    // Anonymous inserts are allowed by RLS ("contacts: anon can insert").
    const supabase = await createClient();
    const row: Record<string, unknown> = {
      name: cleanName,
      email: cleanEmail,
      company: cleanCompany,
      phone: cleanPhone,
      service: cleanService,
      message: cleanMessage,
      sms_consent: smsConsent === true,
      email_marketing_consent: marketingConsent === true,
      email_consent_at: marketingConsent === true ? new Date().toISOString() : null,
      email_consent_source: marketingConsent === true ? cleanFormKey ?? "contact_form" : null,
      pipeline_stage: "new",
      form_key: cleanFormKey,
      source: cleanSource,
      page_path: cleanPagePath,
      referrer: cleanReferrer,
      utm: cleanUtm,
      qualification: cleanQualification,
      lead_score: leadScore,
    };

    let { error } = await supabase.from("contacts").insert(row);
    if (
      error &&
      /pipeline_stage|form_key|source|page_path|referrer|utm|qualification|lead_score|email_marketing_consent|email_consent_at|email_consent_source|schema cache|column/i.test(
        error.message,
      )
    ) {
      for (const key of [
        "pipeline_stage",
        "form_key",
        "source",
        "page_path",
        "referrer",
        "utm",
        "qualification",
        "lead_score",
        "email_marketing_consent",
        "email_consent_at",
        "email_consent_source",
      ]) {
        delete row[key];
      }
      ({ error } = await supabase.from("contacts").insert(row));
    }

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "An error occurred while submitting the contact form." },
        { status: 500 }
      );
    }

    if (marketingConsent === true && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const marketingAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
      );
      const nameParts = cleanName.split(/\s+/);
      await marketingAdmin.from("marketing_contacts").upsert({
        first_name: nameParts[0] || null,
        last_name: nameParts.slice(1).join(" ") || null,
        email: cleanEmail.toLowerCase(),
        phone: cleanPhone,
        company: cleanCompany,
        source: cleanFormKey ?? cleanSource ?? "contact_form",
        email_consent_status: "subscribed",
        email_consent_at: new Date().toISOString(),
        email_consent_source: cleanPagePath ?? "contact_form",
        updated_at: new Date().toISOString(),
      }, { onConflict: "email" });
    }

    // Fire-and-forget notifications (Slack / email when env configured).
    void notifyNewLead({
      name: cleanName,
      email: cleanEmail,
      company: cleanCompany,
      phone: cleanPhone,
      service: cleanService,
      message: cleanMessage,
      source: cleanSource ?? "contact_form",
    });

    return NextResponse.json(
      { message: "Contact form submitted successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form submission error:", error);
    return NextResponse.json(
      { error: "An error occurred while submitting the contact form." },
      { status: 500 }
    );
  }
}
