/** HttpOnly cookie proving TOTP was verified for this admin session. */
export const ADMIN_2FA_COOKIE = "ice_admin_2fa";

export function admin2faCookieOptions(maxAgeSeconds = 60 * 60 * 12) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
