import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicPathForCmsPage } from "@/lib/cms/pageRegistry";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { error: "CMS scheduling is not configured." },
      { status: 503 },
    );
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { data: duePages, error: selectError } = await supabase
    .from("pages")
    .select("id, slug, page_type")
    .eq("publish_status", "scheduled")
    .lte("scheduled_publish_at", now)
    .limit(100);

  if (selectError) {
    if (selectError.code === "42703") {
      return NextResponse.json({
        published: 0,
        pages: [],
        scheduling: "disabled-until-schema-migration",
      });
    }
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }

  const ids = (duePages ?? []).map((page) => page.id);
  if (ids.length === 0) {
    return NextResponse.json({ published: 0, pages: [] });
  }

  // Access pages deliberately remain unpublished: their hidden settings row
  // contains credential hashes and the /access runtime authorizes every read.
  // Fail closed if we cannot prove which scheduled rows are ordinary CMS pages.
  const { data: accessMarkers, error: markerError } = await supabase
    .from("page_sections")
    .select("page_id")
    .in("page_id", ids)
    .eq("section_key", "access_settings");
  if (markerError) {
    return NextResponse.json({ error: markerError.message }, { status: 500 });
  }

  const protectedIds = new Set((accessMarkers ?? []).map((row) => row.page_id));
  const protectedPages = (duePages ?? []).filter((page) => protectedIds.has(page.id));
  const publishablePages = (duePages ?? []).filter((page) => !protectedIds.has(page.id));

  if (protectedPages.length) {
    const { error: hardeningError } = await supabase
      .from("pages")
      .update({
        is_published: false,
        publish_status: "draft",
        scheduled_publish_at: null,
        published_at: null,
        updated_at: now,
      })
      .in("id", protectedPages.map((page) => page.id));
    if (hardeningError) {
      return NextResponse.json({ error: hardeningError.message }, { status: 500 });
    }
  }

  const publishableIds = publishablePages.map((page) => page.id);
  if (publishableIds.length === 0) {
    return NextResponse.json({
      published: 0,
      pages: [],
      skippedProtected: protectedPages.map((page) => page.slug),
    });
  }

  const { error: updateError } = await supabase
    .from("pages")
    .update({
      is_published: true,
      publish_status: "published",
      scheduled_publish_at: null,
      published_at: now,
      updated_at: now,
    })
    .in("id", publishableIds)
    .eq("publish_status", "scheduled");

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  try {
    revalidateTag("cms-pages", "max");
  } catch {
    // Dynamic reads remain correct even on runtimes without tag invalidation.
  }

  for (const page of publishablePages) {
    try {
      revalidateTag(`cms-page:${page.slug}`, "max");
    } catch {
      // See note above.
    }
    revalidatePath(publicPathForCmsPage(page.slug, page.page_type));
  }

  return NextResponse.json({
    published: publishableIds.length,
    pages: publishablePages.map((page) => page.slug),
    skippedProtected: protectedPages.map((page) => page.slug),
  });
}
