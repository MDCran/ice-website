import type { Metadata } from "next";
import { getSearchIndex } from "@/lib/cms";
import { searchIndex as fallbackSearchIndex } from "@/lib/searchData";
import SearchClient from "./Client";

export const metadata: Metadata = {
  title: "Search | ICE",
  description:
    "Search solutions, partners, and resources from International Computer Exchange.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;

  let items = fallbackSearchIndex;
  try {
    const cmsItems = await getSearchIndex();
    if (cmsItems.length > 0) items = cmsItems;
  } catch {
    // CMS unavailable — fall back to the static search index
  }

  return <SearchClient items={items} initialQuery={params.q ?? ""} />;
}
