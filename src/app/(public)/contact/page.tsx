import { getPageContent } from "@/lib/cms";
import { getSeoConfig } from "@/lib/seo/config";
import { JsonLd, breadcrumbs, localBusiness } from "@/lib/seo/jsonld";
import ContactClient from "./Client";
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
  const page = await getPageContent("contact");
  return {
    title: page?.meta_title ?? page?.title ?? "Contact Us | ICE",
    description: clampDescription(
      page?.meta_description ??
        "Contact International Computer Exchange in Boca Raton, FL. Call +1-800-786-9188 or email info@icesales.com to reach our enterprise IT team.",
    ),
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const [page, seo] = await Promise.all([getPageContent("contact"), getSeoConfig()]);
  return (
    <>
      <JsonLd data={localBusiness(seo)} />
      <JsonLd
        data={breadcrumbs(seo, [
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
        ])}
      />
      <ContactClient cmsData={page?.sections} orderedSections={page?.orderedSections} />
    </>
  );
}
