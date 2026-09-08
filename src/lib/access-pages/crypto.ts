import "server-only";

import {
  createHash,
  createHmac,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import type {
  AccessChallengeClaims,
  AccessGrant,
  AccessSessionClaims,
} from "@/lib/access-pages/types";

const TOKEN_BYTES = 32;
const PASSWORD_KEY_BYTES = 64;
const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_MAXMEM = 64 * 1024 * 1024;
const SIGNED_VALUE_VERSION = "v1";

type SignedClaims = AccessSessionClaims | AccessChallengeClaims;

function constantTimeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function signingSecret(): string {
  const configured = process.env.ACCESS_PAGE_SIGNING_SECRET;
  if (configured && configured.length >= 32) return configured;

  // Existing deployments already require the service-role credential to load
  // unpublished access pages. Derive a domain-separated signing key so access
  // cookies work before a dedicated secret is added without reusing the raw key.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey || serviceRoleKey.length < 32) {
    throw new Error(
      "ACCESS_PAGE_SIGNING_SECRET (or the server service credential) must be configured",
    );
  }
  return createHmac("sha256", serviceRoleKey)
    .update("ice-access-page-cookie-signing-v1", "utf8")
    .digest("base64url");
}

function sign(value: string): string {
  return createHmac("sha256", signingSecret()).update(value).digest("base64url");
}

function derivePassword(
  password: string,
  salt: Buffer,
  options: { N: number; r: number; p: number },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      PASSWORD_KEY_BYTES,
      { ...options, maxmem: SCRYPT_MAXMEM },
      (error, derivedKey) => {
        if (error) reject(error);
        else resolve(derivedKey);
      },
    );
  });
}

/** Creates the one-time raw value an admin shares and its safe stored fields. */
export function createAccessToken(): {
  token: string;
  tokenHash: string;
  tokenPrefix: string;
} {
  const token = `ice_${randomBytes(TOKEN_BYTES).toString("base64url")}`;
  return {
    token,
    tokenHash: hashAccessToken(token),
    tokenPrefix: token.slice(0, 12),
  };
}

export function hashAccessToken(token: string): string {
  const digest = createHash("sha256").update(token, "utf8").digest("base64url");
  return `sha256$${digest}`;
}

export function verifyAccessToken(token: string, storedHash: string): boolean {
  if (!token || token.length > 512 || !storedHash.startsWith("sha256$")) {
    return false;
  }
  return constantTimeEqual(hashAccessToken(token), storedHash);
}

/** Hash format: scrypt$v1$N$r$p$salt(base64url)$key(base64url). */
export async function hashAccessPassword(password: string): Promise<string> {
  if (password.length < 8 || password.length > 512) {
    throw new Error("Access passwords must contain between 8 and 512 characters");
  }

  const salt = randomBytes(16);
  const key = await derivePassword(password, salt, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });

  return [
    "scrypt",
    "v1",
    String(SCRYPT_N),
    String(SCRYPT_R),
    String(SCRYPT_P),
    salt.toString("base64url"),
    key.toString("base64url"),
  ].join("$");
}

export async function verifyAccessPassword(
  password: string,
  envelope: string,
): Promise<boolean> {
  if (!password || password.length > 512) return false;

  const [algorithm, version, nRaw, rRaw, pRaw, saltRaw, keyRaw, extra] =
    envelope.split("$");
  if (
    algorithm !== "scrypt" ||
    version !== "v1" ||
    !saltRaw ||
    !keyRaw ||
    extra !== undefined
  ) {
    return false;
  }

  const N = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (N !== SCRYPT_N || r !== SCRYPT_R || p !== SCRYPT_P) return false;

  try {
    const salt = Buffer.from(saltRaw, "base64url");
    const expected = Buffer.from(keyRaw, "base64url");
    if (salt.length !== 16 || expected.length !== PASSWORD_KEY_BYTES) return false;
    const actual = await derivePassword(password, salt, { N, r, p });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function signAccessClaims(claims: SignedClaims): string {
  const payload = Buffer.from(JSON.stringify(claims), "utf8").toString("base64url");
  const unsigned = `${SIGNED_VALUE_VERSION}.${payload}`;
  return `${unsigned}.${sign(unsigned)}`;
}

/** Invalidates signed cookies whenever an admin rotates either grant credential. */
export function accessGrantFingerprint(grant: AccessGrant): string {
  return createHmac("sha256", signingSecret())
    .update("ice-access-grant-fingerprint\0", "utf8")
    .update(grant.id, "utf8")
    .update("\0", "utf8")
    .update(grant.token_hash, "utf8")
    .update("\0", "utf8")
    .update(grant.password_hash, "utf8")
    .digest("base64url");
}

export function verifyAccessClaims<T extends SignedClaims>(
  value: string | undefined,
  expectedKind: T["kind"],
): T | null {
  if (!value || value.length > 4096) return null;
  const [version, payload, signature, extra] = value.split(".");
  if (
    version !== SIGNED_VALUE_VERSION ||
    !payload ||
    !signature ||
    extra !== undefined
  ) {
    return null;
  }

  const unsigned = `${version}.${payload}`;
  if (!constantTimeEqual(signature, sign(unsigned))) return null;

  try {
    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<SignedClaims>;
    const now = Math.floor(Date.now() / 1000);
    if (
      claims.kind !== expectedKind ||
      typeof claims.page_id !== "string" ||
      typeof claims.grant_id !== "string" ||
      typeof claims.slug !== "string" ||
      typeof claims.issued_at !== "number" ||
      typeof claims.expires_at !== "number" ||
      typeof claims.grant_fingerprint !== "string" ||
      claims.grant_fingerprint.length < 32 ||
      claims.expires_at <= now ||
      claims.issued_at > now + 60
    ) {
      return null;
    }

    if (
      expectedKind === "access" &&
      (typeof (claims as Partial<AccessSessionClaims>).view_sequence !== "number" ||
        (claims as Partial<AccessSessionClaims>).view_sequence! < 1)
    ) {
      return null;
    }

    return claims as T;
  } catch {
    return null;
  }
}

function slugCookieSuffix(slug: string): string {
  return createHash("sha256").update(slug, "utf8").digest("hex").slice(0, 16);
}

export function accessSessionCookieName(slug: string): string {
  return `ice_access_${slugCookieSuffix(slug)}`;
}

export function accessChallengeCookieName(slug: string): string {
  return `ice_access_challenge_${slugCookieSuffix(slug)}`;
}
