import { NextRequest, NextResponse } from "next/server";
import {
  accessChallengeCookieName,
  accessSessionCookieName,
  verifyAccessPassword,
} from "@/lib/access-pages/crypto";
import {
  accessCookieOptions,
  createSessionValue,
  getAccessPageBySlug,
  isValidAccessSlug,
  recordAccessGrantView,
  validateChallenge,
} from "@/lib/access-pages/server";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "frame-ancestors 'none'",
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
};

function json(body: { ok?: boolean; error?: string }, status: number) {
  return NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
}

function clearChallenge(response: NextResponse, slug: string) {
  response.cookies.set(
    accessChallengeCookieName(slug),
    "",
    accessCookieOptions(slug, 0),
  );
}

async function genericDenial() {
  // Scrypt itself dominates valid-grant failures; add a small delay for invalid
  // challenges so obvious timing differences are less useful to an attacker.
  await new Promise((resolve) => setTimeout(resolve, 250));
  return json({ error: "That access code was not accepted." }, 401);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const cleanSlug = slug.trim();
  if (!isValidAccessSlug(cleanSlug)) return genericDenial();

  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return json({ error: "Invalid request." }, 403);
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "Invalid request." }, 415);
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password.trim() : "";
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
  if (!password || password.length > 512) return genericDenial();

  try {
    const page = await getAccessPageBySlug(cleanSlug);
    if (!page) return genericDenial();

    const challengeCookie = request.cookies.get(
      accessChallengeCookieName(cleanSlug),
    )?.value;
    const challenge = validateChallenge(page, challengeCookie);
    if (!challenge) {
      const response = await genericDenial();
      clearChallenge(response, cleanSlug);
      return response;
    }

    const validPassword = await verifyAccessPassword(
      password,
      challenge.grant.password_hash,
    );
    if (!validPassword) return genericDenial();

    const recorded = await recordAccessGrantView(page.id, challenge.grant.id);
    if (!recorded) {
      const response = json(
        { error: "This access link is no longer available." },
        409,
      );
      clearChallenge(response, cleanSlug);
      return response;
    }

    const session = createSessionValue(page, recorded.grant, recorded.viewSequence);
    const response = json({ ok: true }, 200);
    response.cookies.set(
      accessSessionCookieName(cleanSlug),
      session.value,
      accessCookieOptions(cleanSlug, session.maxAge),
    );
    clearChallenge(response, cleanSlug);
    return response;
  } catch {
    return genericDenial();
  }
}
