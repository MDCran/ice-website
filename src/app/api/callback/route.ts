import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyNewLead } from "@/lib/notifyLead";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 60) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 320).toLowerCase() : "";
  const preferredTime = typeof body.preferredTime === "string" ? body.preferredTime.trim().slice(0, 120) : "";
  const context = typeof body.context === "string" ? body.context.trim().slice(0, 200) : "";
  const pagePath = typeof body.pagePath === "string" ? body.pagePath.trim().slice(0, 500) : "";
  if (phone.replace(/\D/g, "").length < 7) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.from("callback_requests").insert({ email, phone, preferred_time: preferredTime || null, context: context || null, page_path: pagePath || null });
  if (error) return NextResponse.json({ error: "We could not save the callback request." }, { status: 500 });
  void notifyNewLead({ name: "Callback request", email, phone, service: context || "Callback", message: preferredTime ? `Preferred time: ${preferredTime}` : "A callback was requested.", source: pagePath || "callback_widget" });
  return NextResponse.json({ ok: true }, { status: 201 });
}

