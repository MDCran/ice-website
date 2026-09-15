import { getPageContent } from "@/lib/cms";
import { getSeoConfig } from "@/lib/seo/config";
import { JsonLd, breadcrumbs } from "@/lib/seo/jsonld";
import SolutionsClient from "./Client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedSolutionCatalog } from "@/lib/cms/solutionCatalog";
import { buildPageMetadata } from "@/lib/seo/pageMetadata";

/** Trim to <=155 chars at a word boundary, appending an ellipsis when cut. */
function clampDescription(value: string, max = 155): string {
  const v = value.trim();
  if (v.length <= max) return v;
  const slice = v.slice(0, max - 1);
  const cut = slice.slice(0, slice.lastIndexOf(" "));
  return `${(cut || slice).trimEnd()}…`;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent("solutions");
  return buildPageMetadata(page, {
    fallbackTitle: "AS400, IBM i & Managed IT Solutions",
    fallbackDescription: clampDescription("Explore AS400 and IBM i hosting, cloud, backup, recovery, and managed IT services from ICE, with 30+ years in business."),
    defaultPath: "/solutions",
  });
}

export default async function SolutionsPage() {
  const [page, seo, catalog] = await Promise.all([
    getPageContent("solutions"),
    getSeoConfig(),
    getPublishedSolutionCatalog(),
  ]);
  if (!page) notFound();
  return (
    <>
      <JsonLd
        data={breadcrumbs(seo, [
          { name: "Home", url: "/" },
          { name: "Solutions", url: "/solutions" },
        ])}
      />
      <SolutionsClient
        cmsData={page?.sections}
        orderedSections={page?.orderedSections}
        catalog={catalog}
      />
    </>
  );
}
