import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GenericCMSSections from "@/components/cms/GenericCMSSections";
import { getPageContent } from "@/lib/cms";
import { getSeoConfig } from "@/lib/seo/config";
import { JsonLd, breadcrumbs } from "@/lib/seo/jsonld";
import { buildPageMetadata } from "@/lib/seo/pageMetadata";

interface GenericPageProps {
  params: Promise<{ slug: string }>;
}
function isGenericPageType(pageType: string): boolean {
  return pageType === "static" || pageType === "legal";
}

export async function generateMetadata({ params }: GenericPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageContent(slug);
  if (!page || !isGenericPageType(page.page_type)) return {};

  return buildPageMetadata(page, {
    fallbackTitle: page.title,
    fallbackDescription: page.meta_description ?? undefined,
    defaultPath: `/${slug}`,
  });
}

/**
 * Public renderer for CMS-created top-level pages. Concrete application routes
 * continue to win Next.js route precedence; this catches only otherwise
 * unmatched published static/legal slugs. Solution and settings records are
 * deliberately rejected because they have dedicated renderers or no public UI.
 */
export default async function GenericCmsPage({ params }: GenericPageProps) {
  const { slug } = await params;
  const [page, seo] = await Promise.all([
    getPageContent(slug),
    getSeoConfig(),
  ]);

  if (!page || !isGenericPageType(page.page_type)) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbs(seo, [
          { name: "Home", url: "/" },
          { name: page.title, url: `/${slug}` },
        ])}
      />
      <main className="bg-primary">
        <GenericCMSSections sections={page.orderedSections} />
      </main>
    </>
  );
}
