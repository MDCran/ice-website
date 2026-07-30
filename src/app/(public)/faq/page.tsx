import type { Metadata } from "next";
import FaqHub from "@/components/marketing/FaqHub";
import { BUYER_FAQS } from "@/lib/buyerFaqs";
import { JsonLd, breadcrumbs, faqPage } from "@/lib/seo/jsonld";
import { getSeoConfig } from "@/lib/seo/config";

export const metadata: Metadata = {
  title: "Enterprise IT Frequently Asked Questions | ICE",
  description: "Answers about ICE managed cloud, IBM i, disaster recovery, RPO/RTO, security monitoring, and response times.",
  alternates: { canonical: "/faq" },
};

export default async function Page() {
  const seo = await getSeoConfig();
  return (
    <>
      <JsonLd data={breadcrumbs(seo, [{ name: "Home", url: "/" }, { name: "FAQ", url: "/faq" }])} />
      <JsonLd data={faqPage(BUYER_FAQS)} />
      <FaqHub />
    </>
  );
}
