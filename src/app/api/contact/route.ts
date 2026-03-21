import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, phone, service, message, smsConsent } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.from("contacts").insert({
      name,
      email,
      company: company || null,
      phone: phone || null,
      service: service || null,
      message,
      sms_consent: smsConsent || false,
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
