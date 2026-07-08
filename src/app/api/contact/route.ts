import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Max lengths to keep submissions sane (DB columns are unbounded text). */
const MAX_LENGTHS = {
  name: 200,
  email: 320,
  company: 200,
  phone: 50,
  service: 200,
  message: 5000,
} as const;

/** Trim a value if it's a non-empty string; otherwise return null. */
function cleanString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { name, email, company, phone, service, message, smsConsent } = body as Record<string, unknown>;

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

    // Anonymous inserts are allowed by RLS ("contacts: anon can insert").
    const supabase = await createClient();
    const { error } = await supabase.from("contacts").insert({
      name: cleanName,
      email: cleanEmail,
      company: cleanString(company, MAX_LENGTHS.company),
      phone: cleanString(phone, MAX_LENGTHS.phone),
      service: cleanString(service, MAX_LENGTHS.service),
      message: cleanMessage,
      sms_consent: smsConsent === true,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "An error occurred while submitting the contact form." },
        { status: 500 }
      );
    }

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
