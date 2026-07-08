import { getPageContent } from "@/lib/cms";
import HomeClient from "./HomeClient";
import type { HomePageData } from "./HomeClient";
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
  const page = await getPageContent("home");
  const metadata: Metadata = {
    alternates: { canonical: "/" },
  };
  // Keep the root layout's default title on the home page; only override when
  // the CMS supplies an explicit one. Use `absolute` so the layout's
  // "%s | International Computer Exchange" template doesn't double the brand
  // (the CMS home title already carries it).
  if (page?.meta_title) metadata.title = { absolute: page.meta_title };
  if (page?.meta_description) {
    metadata.description = clampDescription(page.meta_description);
  }
  return metadata;
}

export default async function HomePage() {
  const page = await getPageContent("home");
  const data: HomePageData | undefined = page?.sections;

  return <HomeClient data={data} orderedSections={page?.orderedSections} />;
}
