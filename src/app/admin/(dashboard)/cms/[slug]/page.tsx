import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "@untitledui/icons";
import { can } from "@/lib/admin/permissions";
import CMSPageEditor from "./CMSPageEditor";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CMSSectionEditorPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || !can(profile.role, "cms.edit")) redirect("/admin");

  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .single();

  if (pageError || !page) {
    notFound();
  }

  const { data: sections, error: sectionsError } = await supabase
    .from("page_sections")
    .select("*")
    .eq("page_id", page.id)
    .order("sort_order", { ascending: true });

  if (sectionsError) {
    return (
      <div className="text-sm text-error-primary">
        Failed to load this page&apos;s sections: {sectionsError.message}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={page.page_type === "solution" ? "/admin/solutions" : "/admin/cms"}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-tertiary transition-colors hover:text-tertiary_hover"
        >
          <ArrowLeft className="size-4" />
          {page.page_type === "solution" ? "Back to Solutions" : "Back to Pages"}
        </Link>
      </div>

      <CMSPageEditor
        page={{
          id: page.id,
          title: page.title,
          slug: page.slug,
          meta_title: page.meta_title,
          meta_description: page.meta_description,
          page_type: page.page_type,
          is_published: page.is_published,
          publish_status: page.publish_status,
          scheduled_publish_at: page.scheduled_publish_at,
          published_at: page.published_at,
          updated_at: page.updated_at,
          canonical_url: page.canonical_url,
          og_image_url: page.og_image_url,
          twitter_image_url: page.twitter_image_url,
          favicon_url: page.favicon_url,
          sort_order: page.sort_order ?? 0,
        }}
        initialSections={sections ?? []}
        canPublish={can(profile.role, "cms.publish")}
        supportsPublishScheduling={
          Object.prototype.hasOwnProperty.call(page, "publish_status")
          && Object.prototype.hasOwnProperty.call(page, "scheduled_publish_at")
          && Object.prototype.hasOwnProperty.call(page, "published_at")
        }
      />
    </div>
  );
}
