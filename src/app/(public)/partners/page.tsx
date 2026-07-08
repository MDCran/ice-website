import { getPageContent } from "@/lib/cms";
import { getSeoConfig } from "@/lib/seo/config";
import { JsonLd, breadcrumbs } from "@/lib/seo/jsonld";
import PartnersClient from "./Client";
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
  const page = await getPageContent("partners");
  return {
    title: page?.meta_title ?? page?.title ?? "Technology Partners | ICE",
    description: clampDescription(
      page?.meta_description ??
        "ICE partners with IBM and leading technology vendors to deliver enterprise cloud, security, and managed services.",
    ),
    alternates: { canonical: "/partners" },
  };
}

export default async function PartnersPage() {
  const [page, seo] = await Promise.all([getPageContent("partners"), getSeoConfig()]);
  return (
    <>
      <JsonLd
        data={breadcrumbs(seo, [
          { name: "Home", url: "/" },
          { name: "Partners", url: "/partners" },
        ])}
      />
      <PartnersClient cmsData={page?.sections} orderedSections={page?.orderedSections} />
    </>
  );
}
