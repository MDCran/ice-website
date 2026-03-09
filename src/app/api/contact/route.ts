import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, Contact } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, phone, service, message, smsConsent } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // If MONGODB_URI is not set, still return success (development mode)
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { message: "Contact form submitted successfully." },
        { status: 201 }
      );
    }

    await connectToDatabase();

    await Contact.create({
      name,
      email,
      company,
      phone,
      service,
      message,
      smsConsent: smsConsent || false,
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
