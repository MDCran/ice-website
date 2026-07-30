import { unstable_cache } from "next/cache";
import { fetchPublishedPage } from "@/lib/cms/fetchPage";
import type { PageWithSections } from "@/lib/cms";

/**
 * Tagged CMS cache (#31).
 * Uses `unstable_cache` (works without `cacheComponents` flag).
 * Invalidate via `revalidateTag('cms-page:<slug>', 'max')` or `cms-pages`.
 */
export async function getCachedPageContent(slug: string): Promise<PageWithSections | null> {
  const cached = unstable_cache(
    async () => fetchPublishedPage(slug),
    [`cms-page-${slug}`],
    {
      tags: ["cms-pages", `cms-page:${slug}`],
      revalidate: 300,
    },
  );
  return cached();
}
