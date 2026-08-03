import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 60) : "";
  const preferredTime = typeof body.preferredTime === "string" ? body.preferredTime.trim().slice(0, 120) : "";
  const context = typeof body.context === "string" ? body.context.trim().slice(0, 200) : "";
  const pagePath = typeof body.pagePath === "string" ? body.pagePath.trim().slice(0, 500) : "";
  if (phone.replace(/\D/g, "").length < 7) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.from("callback_requests").insert({ phone, preferred_time: preferredTime || null, context: context || null, page_path: pagePath || null });
  return error ? NextResponse.json({ error: "We could not save the callback request." }, { status: 500 }) : NextResponse.json({ ok: true }, { status: 201 });
}

