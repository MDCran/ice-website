import { NextResponse } from "next/server";
import { ADMIN_2FA_COOKIE, admin2faCookieOptions } from "@/lib/admin/mfa-cookie";

/** Clear the httpOnly MFA cookie on admin sign-out. */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_2FA_COOKIE, "", { ...admin2faCookieOptions(0), maxAge: 0 });
  return response;
}
