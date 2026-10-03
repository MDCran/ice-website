import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTotpCode } from "@/lib/admin/totp";
import { ADMIN_2FA_COOKIE, admin2faCookieOptions } from "@/lib/admin/mfa-cookie";

/** Verify TOTP during admin login and set the session MFA cookie. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!code) {
    return NextResponse.json({ error: "Verification code is required." }, { status: 400 });
  }

  const admin = createAdminClient();
  const [{ data: profile, error: profileError }, { data: totpSecret, error: secretError }] = await Promise.all([
    admin
      .from("admin_profiles")
      .select("id, email, totp_enabled")
      .eq("id", user.id)
      .single(),
    admin
      .from("admin_totp_secrets")
      .select("secret")
      .eq("admin_id", user.id)
      .maybeSingle(),
  ]);

  if (profileError || secretError) {
    return NextResponse.json(
      { error: "Two-factor storage is unavailable. Apply the admin TOTP database migration and try again." },
      { status: 503 },
    );
  }

  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!profile.totp_enabled || !totpSecret?.secret) {
    return NextResponse.json({ error: "Two-factor authentication is not enabled." }, { status: 400 });
  }

  if (!verifyTotpCode(totpSecret.secret, code, profile.email || "admin")) {
    return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_2FA_COOKIE, user.id, admin2faCookieOptions());
  return response;
}
