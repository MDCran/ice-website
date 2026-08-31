import { getPageContent } from "@/lib/cms";
import { getSeoConfig } from "@/lib/seo/config";
import { JsonLd, breadcrumbs } from "@/lib/seo/jsonld";
import WhyICEClient from "./Client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

/** Trim to <=155 chars at a word boundary, appending an ellipsis when cut. */
function clampDescription(value: string, max = 155): string {
  const v = value.trim();
  if (v.length <= max) return v;
  const slice = v.slice(0, max - 1);
  const cut = slice.slice(0, slice.lastIndexOf(" "));
  return `${(cut || slice).trimEnd()}…`;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent("why-ice");
  return {
    title: page?.meta_title ?? page?.title ?? "Why ICE | International Computer Exchange",
    description: clampDescription(
      page?.meta_description ??
        "Why enterprises choose ICE: an IBM Business Partner since 1990 delivering managed cloud, security, and disaster recovery from SOC 2 Type II certified data centers.",
    ),
    alternates: { canonical: "/why-ice" },
  };
}

export default async function WhyICEPage() {
  const [page, seo] = await Promise.all([getPageContent("why-ice"), getSeoConfig()]);
  if (!page) notFound();
  return (
    <>
      <JsonLd
        data={breadcrumbs(seo, [
          { name: "Home", url: "/" },
          { name: "Why ICE", url: "/why-ice" },
        ])}
      />
      <WhyICEClient cmsData={page?.sections} orderedSections={page?.orderedSections} />
    </>
  );
}
