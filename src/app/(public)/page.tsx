import { getPageContent } from "@/lib/cms";
import HomeClient from "./HomeClient";
import type { HomePageData } from "./HomeClient";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent("home");
  const { buildPageMetadata } = await import("@/lib/seo/pageMetadata");
  return buildPageMetadata(page, {
    fallbackTitle:
      "International Computer Exchange — Enterprise Cloud, Security & IBM Managed Services",
    defaultPath: "/",
    absoluteTitle: true,
  });
}

export default async function HomePage() {
  const page = await getPageContent("home");
  const data: HomePageData | undefined = page?.sections;

  return <HomeClient data={data} orderedSections={page?.orderedSections} />;
}
