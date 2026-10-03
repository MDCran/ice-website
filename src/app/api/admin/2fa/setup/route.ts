import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildTotpQrDataUrl, generateTotpSecret } from "@/lib/admin/totp";

/** Start TOTP enrollment — returns QR + secret for the settings UI (not persisted until /enable). */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("id, email, display_name, totp_enabled")
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

  const admin = createAdminClient();
  const { error: secretStorageError } = await admin
    .from("admin_totp_secrets")
    .select("admin_id")
    .limit(0);
  if (secretStorageError) {
    return NextResponse.json(
      { error: "Two-factor storage is not ready. Apply supabase/migrations/20261007_admin_totp.sql, then refresh and try again." },
      { status: 503 },
    );
  }

  if (profile.totp_enabled) {
    return NextResponse.json({ error: "Two-factor authentication is already enabled." }, { status: 400 });
  }

  const secret = generateTotpSecret();
  const label = profile.email || profile.display_name || user.email || "admin";
  const { otpauthUrl, qrDataUrl } = await buildTotpQrDataUrl(secret, label);

  return NextResponse.json({
    secret,
    qrDataUrl,
    otpauthUrl,
  });
}
