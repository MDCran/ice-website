import { getPageContent } from "@/lib/cms";
import TermsClient from "./Client";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent("terms-of-service");
  return {
    title: page?.meta_title ?? page?.title ?? "Terms of Service | ICE",
    description: page?.meta_description ?? "Website terms and conditions.",
  };
}

export default async function TermsOfServicePage() {
  const page = await getPageContent("terms-of-service");
  return <TermsClient cmsData={page?.sections} />;
}
