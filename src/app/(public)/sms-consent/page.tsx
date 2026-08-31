import { getPageContent } from "@/lib/cms";
import { getSeoConfig } from "@/lib/seo/config";
import { JsonLd, breadcrumbs } from "@/lib/seo/jsonld";
import SmsConsentClient from "./Client";
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
  const page = await getPageContent("sms-consent");
  return {
    title: page?.meta_title ?? page?.title ?? "SMS Consent | ICE",
    description: clampDescription(
      page?.meta_description ??
        "SMS opt-in and opt-out policy for International Computer Exchange text-message communications.",
    ),
    alternates: { canonical: "/sms-consent" },
  };
}

export default async function SmsConsentPage() {
  const [page, seo] = await Promise.all([getPageContent("sms-consent"), getSeoConfig()]);
  if (!page) notFound();
  return (
    <>
      <JsonLd
        data={breadcrumbs(seo, [
          { name: "Home", url: "/" },
          { name: "SMS Consent", url: "/sms-consent" },
        ])}
      />
      <SmsConsentClient cmsData={page.sections} orderedSections={page.orderedSections} />
    </>
  );
}
