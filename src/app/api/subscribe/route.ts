import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, company, phone } = body;

    if (!name || !company || !phone) {
      return NextResponse.json(
        { error: "Name, company, and phone are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.from("subscribers").insert({
      name,
      company,
      phone,
      sms_consent: true,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "An error occurred while submitting the subscription." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Subscription submitted successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Subscription submission error:", error);
    return NextResponse.json(
      { error: "An error occurred while submitting the subscription." },
      { status: 500 }
    );
  }
}
