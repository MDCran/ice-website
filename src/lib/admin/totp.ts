import { Secret, TOTP } from "otpauth";
import QRCode from "qrcode";

const ISSUER = "ICE Admin";

export function generateTotpSecret(): string {
  return new Secret({ size: 20 }).base32;
}

export function createTotp(secretBase32: string, label: string): TOTP {
  return new TOTP({
    issuer: ISSUER,
    label: label || "admin",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32),
  });
}

export function verifyTotpCode(secretBase32: string, code: string, label = "admin"): boolean {
  const trimmed = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(trimmed)) return false;
  const totp = createTotp(secretBase32, label);
  // Allow ±1 step (30s) window for clock skew
  const delta = totp.validate({ token: trimmed, window: 1 });
  return delta !== null;
}

export async function buildTotpQrDataUrl(secretBase32: string, label: string): Promise<{
  otpauthUrl: string;
  qrDataUrl: string;
  secret: string;
}> {
  const totp = createTotp(secretBase32, label);
  const otpauthUrl = totp.toString();
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 220,
  });
  return { otpauthUrl, qrDataUrl, secret: secretBase32 };
}
