import { getPageContent } from "@/lib/cms";
import { getSeoConfig } from "@/lib/seo/config";
import { JsonLd, breadcrumbs } from "@/lib/seo/jsonld";
import PrivacyPolicyClient from "./Client";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent("privacy-policy");
  return {
    title: page?.meta_title ?? page?.title ?? "Privacy Policy | ICE",
    description: page?.meta_description ??
      "Learn how International Computer Exchange collects, uses, and protects personal information.",
    alternates: { canonical: "/privacy-policy" },
  };
}

export default async function PrivacyPolicyPage() {
  const [page, seo] = await Promise.all([getPageContent("privacy-policy"), getSeoConfig()]);
  return (
    <>
      <JsonLd
        data={breadcrumbs(seo, [
          { name: "Home", url: "/" },
          { name: "Privacy Policy", url: "/privacy-policy" },
        ])}
      />
      <PrivacyPolicyClient cmsData={page?.sections} orderedSections={page?.orderedSections} />
    </>
  );
}
