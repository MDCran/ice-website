import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_PATH = 500;
const MAX_TITLE = 300;
const MAX_REFERRER = 500;
const MAX_UA = 400;
const MAX_SESSION = 64;

function sanitize(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed || null;
}

/**
 * Public beacon for first-party pageviews + optional LCP.
 * Uses the service role so anon clients cannot read or spoof bulk inserts via RLS.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const path = sanitize(body.path, MAX_PATH);
  if (!path || !path.startsWith("/")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  // Skip admin/portal/api noise
  if (
    path.startsWith("/admin") ||
    path.startsWith("/portal") ||
    path.startsWith("/api") ||
    path.startsWith("/login")
  ) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let lcpMs: number | null = null;
  if (typeof body.lcp_ms === "number" && Number.isFinite(body.lcp_ms) && body.lcp_ms > 0 && body.lcp_ms < 120_000) {
    lcpMs = Math.round(body.lcp_ms * 100) / 100;
  }

  const row = {
    path,
    title: sanitize(body.title, MAX_TITLE),
    referrer: sanitize(body.referrer, MAX_REFERRER),
    lcp_ms: lcpMs,
    user_agent: sanitize(body.user_agent ?? request.headers.get("user-agent"), MAX_UA),
    session_id: sanitize(body.session_id, MAX_SESSION),
  };

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("page_views").insert(row);
    if (error) {
      // Table may not exist yet before migration — fail soft so public site stays healthy
      console.error("[pageview]", error.message);
      return NextResponse.json({ ok: false }, { status: 503 });
    }
  } catch (err) {
    console.error("[pageview]", err);
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
