import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTotpCode } from "@/lib/admin/totp";
import { ADMIN_2FA_COOKIE, admin2faCookieOptions } from "@/lib/admin/mfa-cookie";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id, email, totp_enabled")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (profile.totp_enabled) {
    return NextResponse.json({ error: "Two-factor authentication is already enabled." }, { status: 400 });
  }

  let body: { secret?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const secret = typeof body.secret === "string" ? body.secret.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";

  if (!secret || !code) {
    return NextResponse.json({ error: "Secret and verification code are required." }, { status: 400 });
  }

  if (!verifyTotpCode(secret, code, profile.email || "admin")) {
    return NextResponse.json({ error: "Invalid verification code. Try again." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("admin_profiles")
    .update({
      totp_secret: secret,
      totp_enabled: true,
      totp_enabled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_2FA_COOKIE, user.id, admin2faCookieOptions());
  return response;
}
