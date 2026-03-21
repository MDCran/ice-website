import { getPageContent } from "@/lib/cms";
import SolutionsClient from "./Client";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent("solutions");
  return {
    title: page?.meta_title ?? page?.title ?? "Solutions | ICE",
    description: page?.meta_description ?? "Enterprise technology solutions.",
  };
}

export default async function SolutionsPage() {
  const page = await getPageContent("solutions");
  return <SolutionsClient cmsData={page?.sections} />;
}
