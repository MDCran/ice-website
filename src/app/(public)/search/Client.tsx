"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, SearchLg } from "@untitledui/icons";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import type { SearchItem } from "@/lib/searchData";
import { cx } from "@/utils/cx";

export interface SearchHeroCopy {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  description?: string;
  search_label?: string;
  search_placeholder?: string;
}

export interface SearchResultsCopy {
  query_status_singular?: string;
  query_status_plural?: string;
  browse_status_singular?: string;
  browse_status_plural?: string;
}

export interface SearchEmptyStateCopy {
  headline?: string;
  description?: string;
  clear_label?: string;
  browse_label?: string;
  browse_href?: string;
}

function fillTemplate(template: string | undefined, values: Record<string, string | number>): string {
  if (!template) return "";
  return template.replace(/\{([a-z_]+)\}/gi, (token, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : token,
  );
}

export default function SearchClient({
  items,
  initialQuery = "",
  hero,
  resultsCopy,
  emptyState,
}: {
  items: SearchItem[];
  initialQuery?: string;
  hero: SearchHeroCopy | null;
  resultsCopy: SearchResultsCopy | null;
  emptyState: SearchEmptyStateCopy | null;
}) {
  const [query, setQuery] = useState(initialQuery);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    // Keep the URL shareable without triggering a navigation.
    const url = value ? `/search?q=${encodeURIComponent(value)}` : "/search";
    window.history.replaceState(window.history.state, "", url);
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    const tokens = q.split(/\s+/);
    return items.filter((item) => {
      const haystack = [item.title, item.description, item.category, ...(item.keywords ?? [])]
        .join(" ")
        .toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  }, [items, query]);

  const trimmedQuery = query.trim();
  const heroSubheadline = hero?.subheadline ?? hero?.description;
  const status = trimmedQuery
    ? fillTemplate(
        results.length === 1
          ? resultsCopy?.query_status_singular
          : resultsCopy?.query_status_plural,
        { count: results.length, query: trimmedQuery },
      )
    : fillTemplate(
        results.length === 1
          ? resultsCopy?.browse_status_singular
          : resultsCopy?.browse_status_plural,
        { count: results.length },
      );

  return (
    <main className="bg-primary">
      {hero && (
        <section className="pt-16 pb-8 md:pt-24 md:pb-12">
          <div className="mx-auto max-w-container px-4 md:px-8">
            <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
              {hero.eyebrow && (
                <span className="text-sm font-semibold text-brand-secondary md:text-md">
                  {hero.eyebrow}
                </span>
              )}
              {hero.headline && (
                <h1 className="mt-3 text-display-md font-semibold text-primary md:text-display-lg">
                  {hero.headline}
                </h1>
              )}
              {heroSubheadline && (
                <p className="mt-4 text-lg text-tertiary md:mt-6 md:text-xl">{heroSubheadline}</p>
              )}
              <div className="mt-8 w-full max-w-xl">
                <Input
                  size="md"
                  type="search"
                  icon={SearchLg}
                  aria-label={hero.search_label || undefined}
                  placeholder={hero.search_placeholder}
                  value={query}
                  onChange={handleQueryChange}
                  autoFocus
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {resultsCopy && (
        <section className="pb-16 md:pb-24">
          <div className="mx-auto max-w-container px-4 md:px-8">
            <div className="mx-auto w-full max-w-3xl">
              {results.length > 0 ? (
                <>
                  {status && (
                    <p className="text-sm text-tertiary" role="status">
                      {status}
                    </p>
                  )}
                  <ul className="mt-4 flex flex-col gap-4">
                    {results.map((item) => (
                      <li key={`${item.url}-${item.title}`}>
                        <Link
                          href={item.url}
                          className={cx(
                            "group flex items-start justify-between gap-4 rounded-xl bg-primary p-5 ring-1 ring-secondary transition duration-100 ease-linear ring-inset",
                            "outline-brand hover:bg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2",
                          )}
                        >
                          <div className="flex min-w-0 flex-col items-start gap-2">
                            <Badge size="sm" color="brand">
                              {item.category}
                            </Badge>
                            <div>
                              <h2 className="text-md font-semibold text-primary group-hover:text-brand-secondary">
                                {item.title}
                              </h2>
                              {item.description && (
                                <p className="mt-1 text-sm text-tertiary">{item.description}</p>
                              )}
                            </div>
                          </div>
                          <ArrowUpRight
                            aria-hidden="true"
                            className="mt-0.5 size-5 shrink-0 text-fg-quaternary transition duration-100 ease-linear group-hover:text-fg-brand-primary"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : emptyState ? (
                <div className="py-8">
                  <EmptyState size="md">
                    <EmptyState.Header>
                      <EmptyState.FeaturedIcon color="gray" />
                    </EmptyState.Header>
                    <EmptyState.Content>
                      {emptyState.headline && <EmptyState.Title>{emptyState.headline}</EmptyState.Title>}
                      {emptyState.description && (
                        <EmptyState.Description>
                          {fillTemplate(emptyState.description, { query: trimmedQuery })}
                        </EmptyState.Description>
                      )}
                    </EmptyState.Content>
                    {(emptyState.clear_label || (emptyState.browse_label && emptyState.browse_href)) && (
                      <EmptyState.Footer>
                        {emptyState.clear_label && (
                          <Button color="secondary" size="lg" onClick={() => handleQueryChange("")}>
                            {emptyState.clear_label}
                          </Button>
                        )}
                        {emptyState.browse_label && emptyState.browse_href && (
                          <Button size="lg" href={emptyState.browse_href}>
                            {emptyState.browse_label}
                          </Button>
                        )}
                      </EmptyState.Footer>
                    )}
                  </EmptyState>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
