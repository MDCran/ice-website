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

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("id, email, totp_enabled")
    .eq("id", user.id)
    .single();

  if (profileError && /totp_enabled/i.test(profileError.message) && /column|schema cache|does not exist|could not find/i.test(profileError.message)) {
    return NextResponse.json(
      { error: "Two-factor authentication is not configured yet. Apply the admin TOTP database migration, then try again." },
      { status: 503 },
    );
  }

  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!profile.totp_enabled) {
    return NextResponse.json({ error: "Two-factor authentication is not enabled." }, { status: 400 });
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
  const [{ data: profileWithEmail, error: profileEmailError }, { data: storedSecret, error: secretReadError }] = await Promise.all([
    admin
      .from("admin_profiles")
      .select("email")
      .eq("id", user.id)
      .single(),
    admin
      .from("admin_totp_secrets")
      .select("secret")
      .eq("admin_id", user.id)
      .maybeSingle(),
  ]);

  if (profileEmailError || secretReadError) {
    return NextResponse.json(
      { error: "Two-factor storage is unavailable. Apply the admin TOTP database migration and try again." },
      { status: 503 },
    );
  }

  if (!storedSecret?.secret || !verifyTotpCode(storedSecret.secret, code, profileWithEmail?.email || "admin")) {
    return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
  }

  const { error } = await admin
    .from("admin_profiles")
    .update({
      totp_enabled: false,
      totp_enabled_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error: secretDeleteError } = await admin
    .from("admin_totp_secrets")
    .delete()
    .eq("admin_id", user.id);
  if (secretDeleteError) {
    return NextResponse.json({ error: "Two-factor authentication was disabled, but its stored secret could not be removed. Contact an administrator." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_2FA_COOKIE, "", { ...admin2faCookieOptions(0), maxAge: 0 });
  return response;
}
