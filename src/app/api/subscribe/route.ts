import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, Subscriber } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, company, phone } = body;

    // Validate required fields
    if (!name || !company || !phone) {
      return NextResponse.json(
        { error: "Name, company, and phone are required." },
        { status: 400 }
      );
    }

    // If MONGODB_URI is not set, still return success (development mode)
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { message: "Subscription submitted successfully." },
        { status: 201 }
      );
    }

    await connectToDatabase();

    await Subscriber.create({
      name,
      company,
      phone,
      smsConsent: true,
    });

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
