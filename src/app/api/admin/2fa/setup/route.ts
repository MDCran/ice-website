import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id, email, display_name, totp_enabled")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
