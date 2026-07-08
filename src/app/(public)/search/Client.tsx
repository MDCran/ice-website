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

export default function SearchClient({ items, initialQuery = "" }: { items: SearchItem[]; initialQuery?: string }) {
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
            const haystack = [item.title, item.description, item.category, ...(item.keywords ?? [])].join(" ").toLowerCase();
            return tokens.every((token) => haystack.includes(token));
        });
    }, [items, query]);

    return (
        <main className="bg-primary">
            {/* Page header */}
            <section className="pt-16 pb-8 md:pt-24 md:pb-12">
                <div className="mx-auto max-w-container px-4 md:px-8">
                    <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
                        <span className="text-sm font-semibold text-brand-secondary md:text-md">Search</span>
                        <h1 className="mt-3 text-display-md font-semibold text-primary md:text-display-lg">What are you looking for?</h1>
                        <p className="mt-4 text-lg text-tertiary md:mt-6 md:text-xl">
                            Search solutions, partners, and resources from International Computer Exchange.
                        </p>
                        <div className="mt-8 w-full max-w-xl">
                            <Input
                                size="md"
                                type="search"
                                icon={SearchLg}
                                aria-label="Search the site"
                                placeholder="Search solutions, partners, and more..."
                                value={query}
                                onChange={handleQueryChange}
                                autoFocus
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Results */}
            <section className="pb-16 md:pb-24">
                <div className="mx-auto max-w-container px-4 md:px-8">
                    <div className="mx-auto w-full max-w-3xl">
                        {results.length > 0 ? (
                            <>
                                <p className="text-sm text-tertiary" role="status">
                                    {query.trim()
                                        ? `${results.length} result${results.length === 1 ? "" : "s"} for "${query.trim()}"`
                                        : `Browse all ${results.length} pages`}
                                </p>
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
                                                        <h2 className="text-md font-semibold text-primary group-hover:text-brand-secondary">{item.title}</h2>
                                                        {item.description && <p className="mt-1 text-sm text-tertiary">{item.description}</p>}
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
                        ) : (
                            <div className="py-8">
                                <EmptyState size="md">
                                    <EmptyState.Header>
                                        <EmptyState.FeaturedIcon color="gray" />
                                    </EmptyState.Header>
                                    <EmptyState.Content>
                                        <EmptyState.Title>No results found</EmptyState.Title>
                                        <EmptyState.Description>
                                            Your search &ldquo;{query.trim()}&rdquo; did not match any pages. Try a different keyword, or browse our solutions.
                                        </EmptyState.Description>
                                    </EmptyState.Content>
                                    <EmptyState.Footer>
                                        <Button color="secondary" size="lg" onClick={() => handleQueryChange("")}>
                                            Clear search
                                        </Button>
                                        <Button size="lg" href="/solutions">
                                            Browse solutions
                                        </Button>
                                    </EmptyState.Footer>
                                </EmptyState>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
