import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { can } from "@/lib/admin/permissions";
import { publicPathForCmsPage } from "@/lib/cms/pageRegistry";

/**
 * Admin-triggered cache invalidation for CMS pages (#31).
 * Body: { slug?: string, tags?: string[], paths?: string[] }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !can(profile.role, "cms.edit")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const tags: string[] = Array.isArray(body.tags) ? body.tags.map(String) : [];
  const paths: string[] = Array.isArray(body.paths) ? body.paths.map(String) : [];

  const applied: string[] = [];

  try {
    revalidateTag("cms-pages", "max");
    applied.push("cms-pages");
  } catch {
    /* older runtimes */
  }

  if (slug) {
    try {
      revalidateTag(`cms-page:${slug}`, "max");
      applied.push(`cms-page:${slug}`);
    } catch {
      /* ignore */
    }
    const { data: cmsPage } = await supabase
      .from("pages")
      .select("page_type")
      .eq("slug", slug)
      .maybeSingle();
    const path = publicPathForCmsPage(slug, cmsPage?.page_type);
    const derivedPaths = slug === "for-ai" ? [path, "/llms.txt", ...paths] : [path, ...paths];
    for (const p of Array.from(new Set(derivedPaths))) {
      try {
        revalidatePath(p);
        applied.push(`path:${p}`);
      } catch {
        /* ignore */
      }
    }
    if (slug === "site-settings") {
      try {
        revalidatePath("/", "layout");
        applied.push("layout:/");
      } catch {
        /* ignore */
      }
    }
  }

  for (const tag of tags) {
    try {
      revalidateTag(tag, "max");
      applied.push(tag);
    } catch {
      /* ignore */
    }
  }

  return NextResponse.json({ ok: true, applied });
}
