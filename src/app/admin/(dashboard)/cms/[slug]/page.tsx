import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/cms"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm cursor-pointer"
        >
          <ArrowLeft size={16} />
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
