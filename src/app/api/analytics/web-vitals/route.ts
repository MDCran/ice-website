import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Accepts anonymous RUM samples for the admin CWV dashboard (#33).
 * Persists when `web_vitals` table exists; always 204 otherwise.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? "");
    const value = Number(body?.value);
    const path = String(body?.path ?? "").slice(0, 500);
    if (!name || !Number.isFinite(value)) {
      return new NextResponse(null, { status: 204 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("web_vitals").insert({
      metric_name: name,
      metric_value: value,
      page_path: path || "/",
      metric_id: body?.id ? String(body.id).slice(0, 80) : null,
      user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
    });

    if (error && !/web_vitals|schema cache|does not exist/i.test(error.message)) {
      console.error("[web-vitals]", error.message);
    }
  } catch {
    /* ignore malformed payloads */
  }

  return new NextResponse(null, { status: 204 });
}
