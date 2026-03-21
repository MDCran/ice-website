import { getPageContent } from "@/lib/cms";
import PartnersClient from "./Client";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent("partners");
  return {
    title: page?.meta_title ?? page?.title ?? "Technology Partners | ICE",
    description: page?.meta_description ?? "Our trusted technology partners.",
  };
}

export default async function PartnersPage() {
  const page = await getPageContent("partners");
  return <PartnersClient cmsData={page?.sections} />;
}
