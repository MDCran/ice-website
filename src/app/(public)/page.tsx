import { getPageContent } from "@/lib/cms";
import HomeClient from "./HomeClient";
import type { HomePageData } from "./HomeClient";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent("home");
  return {
    title: page?.meta_title ?? page?.title ?? "ICE | Enterprise Technology Solutions",
    description: page?.meta_description ?? "IBM Business Partner since 1990.",
  };
}

export default async function HomePage() {
  const page = await getPageContent("home");
  const data: HomePageData | undefined = page?.sections;

  return <HomeClient data={data} />;
}
