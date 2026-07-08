import { getPageContent } from "@/lib/cms";
import { getSeoConfig } from "@/lib/seo/config";
import { JsonLd, breadcrumbs } from "@/lib/seo/jsonld";
import SolutionsClient from "./Client";
import type { Metadata } from "next";

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
  return {
    title: page?.meta_title ?? page?.title ?? "Solutions | ICE",
    description: clampDescription(
      page?.meta_description ??
        "Enterprise cloud, data protection, security, and IBM managed services from ICE — an IBM Business Partner since 1990.",
    ),
    alternates: { canonical: "/solutions" },
  };
}

export default async function SolutionsPage() {
  const [page, seo] = await Promise.all([getPageContent("solutions"), getSeoConfig()]);
  return (
    <>
      <JsonLd
        data={breadcrumbs(seo, [
          { name: "Home", url: "/" },
          { name: "Solutions", url: "/solutions" },
        ])}
      />
      <SolutionsClient cmsData={page?.sections} orderedSections={page?.orderedSections} />
    </>
  );
}
