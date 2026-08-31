import { getPageContent } from "@/lib/cms";
import { getSeoConfig } from "@/lib/seo/config";
import { JsonLd, breadcrumbs } from "@/lib/seo/jsonld";
import TermsClient from "./Client";
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
  const page = await getPageContent("terms-of-service");
  return {
    title: page?.meta_title ?? page?.title ?? "Terms of Service | ICE",
    description: clampDescription(
      page?.meta_description ??
        "Terms and conditions governing use of the International Computer Exchange website and services.",
    ),
    alternates: { canonical: "/terms-of-service" },
  };
}

export default async function TermsOfServicePage() {
  const [page, seo] = await Promise.all([
    getPageContent("terms-of-service"),
    getSeoConfig(),
  ]);
  if (!page) notFound();
  return (
    <>
      <JsonLd
        data={breadcrumbs(seo, [
          { name: "Home", url: "/" },
          { name: "Terms of Service", url: "/terms-of-service" },
        ])}
      />
      <TermsClient cmsData={page.sections} orderedSections={page.orderedSections} />
    </>
  );
}
