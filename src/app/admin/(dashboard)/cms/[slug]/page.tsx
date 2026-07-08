import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "@untitledui/icons";
import CMSPageEditor from "./CMSPageEditor";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CMSSectionEditorPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .single();

  if (pageError || !page) {
    notFound();
  }

  const { data: sections } = await supabase
    .from("page_sections")
    .select("*")
    .eq("page_id", page.id)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/cms"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-tertiary transition-colors hover:text-tertiary_hover"
        >
          <ArrowLeft className="size-4" />
          Back to Pages
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
        }}
        initialSections={sections ?? []}
      />
    </div>
  );
}
