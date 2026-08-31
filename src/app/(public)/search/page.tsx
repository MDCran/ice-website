import type { Metadata } from "next";
import { getPageContent, getSearchIndex, type PageWithSections } from "@/lib/cms";
import { isCmsSectionVisible } from "@/lib/cms/sectionManifest";
import { searchIndex as fallbackSearchIndex } from "@/lib/searchData";
import { buildPageMetadata } from "@/lib/seo/pageMetadata";
import SearchClient, {
  type SearchEmptyStateCopy,
  type SearchHeroCopy,
  type SearchResultsCopy,
} from "./Client";
import { notFound } from "next/navigation";

const PAGE_SLUG = "search";

const FALLBACK_METADATA = {
  title: "Search | ICE",
  description: "Search solutions, partners, and resources from International Computer Exchange.",
};

const DEFAULT_HERO: SearchHeroCopy = {
  eyebrow: "Search",
  headline: "What are you looking for?",
  subheadline: "Search solutions, partners, and resources from International Computer Exchange.",
  search_label: "Search the site",
  search_placeholder: "Search solutions, partners, and more...",
};

const DEFAULT_RESULTS: SearchResultsCopy = {
  query_status_singular: '{count} result for "{query}"',
  query_status_plural: '{count} results for "{query}"',
  browse_status_singular: "Browse {count} page",
  browse_status_plural: "Browse all {count} pages",
};

const DEFAULT_EMPTY_STATE: SearchEmptyStateCopy = {
  headline: "No results found",
  description:
    'Your search “{query}” did not match any pages. Try a different keyword, or browse our solutions.',
  clear_label: "Clear search",
  browse_label: "Browse solutions",
  browse_href: "/solutions",
};

function hasSection(page: PageWithSections | null, key: string): boolean {
  return page?.orderedSections.some((section) => section.section_key === key) ?? false;
}

function sectionContent<T>(page: PageWithSections | null, key: string, fallback: T): T {
  if (!hasSection(page, key)) return fallback;
  return (page?.sections[key] ?? {}) as T;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent(PAGE_SLUG);
  return buildPageMetadata(page, {
    fallbackTitle: FALLBACK_METADATA.title,
    fallbackDescription: FALLBACK_METADATA.description,
    defaultPath: "/search",
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [params, page] = await Promise.all([searchParams, getPageContent(PAGE_SLUG)]);
  if (!page) notFound();

  let items = fallbackSearchIndex;
  try {
    const cmsItems = await getSearchIndex();
    if (cmsItems.length > 0) items = cmsItems;
  } catch {
    // CMS unavailable — fall back to the static search index.
  }

  const hero = sectionContent(page, "hero", DEFAULT_HERO);
  const results = sectionContent(page, "results", DEFAULT_RESULTS);
  const emptyState = sectionContent(page, "empty_state", DEFAULT_EMPTY_STATE);

  return (
    <SearchClient
      items={items}
      initialQuery={params.q ?? ""}
      hero={isCmsSectionVisible(page?.orderedSections, "hero") ? hero : null}
      resultsCopy={isCmsSectionVisible(page?.orderedSections, "results") ? results : null}
      emptyState={isCmsSectionVisible(page?.orderedSections, "empty_state") ? emptyState : null}
    />
  );
}
