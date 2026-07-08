"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, SearchLg } from "@untitledui/icons";
import { CommandDialog } from "@/components/application/command-menus/command-menu";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { cx } from "@/utils/cx";
import { searchIndex, type SearchItem } from "@/lib/searchData";
import { pushEvent } from "@/lib/analytics";

/* ─── Highlight matching text ──────────────────────────────────────────── */

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="rounded-sm bg-transparent font-semibold text-brand-secondary">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ─── Shared kbd styling ───────────────────────────────────────────────── */

const kbdClass =
  "rounded-[4px] bg-secondary_alt px-1 py-0.5 text-center text-xs font-medium text-tertiary ring-1 ring-secondary ring-inset";

/* ─── Search Modal ─────────────────────────────────────────────────────── */

export default function SearchModal({ items }: { items?: SearchItem[] } = {}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(-1);
    }
  }, [open]);

  // Filter results
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();
    return (items ?? searchIndex).filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower) ||
        (item.keywords && item.keywords.some((k) => k.toLowerCase().includes(lower)))
    );
  }, [query, items]);

  // Group results by category
  const grouped = useMemo(() => {
    const map = new Map<string, SearchItem[]>();
    results.forEach((item) => {
      const existing = map.get(item.category) || [];
      existing.push(item);
      map.set(item.category, existing);
    });
    return map;
  }, [results]);

  // Navigate to result
  const navigateToResult = useCallback(
    (url: string) => {
      pushEvent("search_performed", { query, result_url: url });
      setOpen(false);
      router.push(url);
    },
    [router, query]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
        e.preventDefault();
        navigateToResult(results[selectedIndex].url);
      }
    },
    [results, selectedIndex, navigateToResult]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const items = resultsRef.current.querySelectorAll("[data-result-item]");
      items[selectedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  return (
    <CommandDialog
      isOpen={open}
      onOpenChange={setOpen}
      className="z-[70] bg-black/40 backdrop-blur-sm"
      dialogClassName={(state) =>
        cx(
          "max-w-full rounded-2xl bg-primary/85 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl backdrop-saturate-150 dark:ring-white/10",
          state.isEntering && "duration-200 ease-out animate-in fade-in slide-in-from-top-2",
          state.isExiting && "duration-150 ease-in animate-out fade-out"
        )
      }
    >
      {/* Brand gradient hairline */}
      <div aria-hidden="true" className="h-px shrink-0 bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

      {/* Search input */}
      <div className="relative flex items-center gap-2 border-b border-secondary p-4">
        <div className="pointer-events-none absolute">
          <SearchLg className="size-5 text-fg-quaternary" />
        </div>
        <input
          autoFocus
          type="text"
          aria-label="Search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search solutions, services, resources..."
          className="m-0 w-full bg-transparent pl-7 text-md text-primary outline-hidden placeholder:text-placeholder"
        />
        <kbd className={cx(kbdClass, "max-sm:hidden")}>Esc</kbd>
      </div>

      {/* Results */}
      <div ref={resultsRef} className="max-h-[min(60vh,26rem)] overflow-y-auto overscroll-contain">
        {query.trim() && results.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <FeaturedIcon icon={SearchLg} color="gray" theme="modern" size="lg" />
            <p className="text-sm text-tertiary">No results for &ldquo;{query}&rdquo;</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="pb-2">
            {Array.from(grouped.entries()).map(([category, categoryItems]) => (
              <div key={category} className="border-b border-secondary pb-2 last:border-transparent">
                <div className="flex px-4.5 pt-3 pb-1 font-mono text-[11px] font-semibold tracking-wider text-tertiary uppercase">{category}</div>
                {categoryItems.map((item) => {
                  const globalIdx = results.indexOf(item);
                  const isActive = globalIdx === selectedIndex;
                  return (
                    <Link
                      key={item.url}
                      href={item.url}
                      onClick={() => {
                        pushEvent("search_performed", { query, result_url: item.url });
                        setOpen(false);
                      }}
                      data-result-item
                      className="group block cursor-pointer px-2 py-0.5 outline-hidden"
                    >
                      <div
                        className={cx(
                          "relative flex min-h-10 items-center justify-between gap-3 rounded-lg px-2.5 py-2 transition duration-100 ease-linear group-hover:bg-primary_hover/60",
                          isActive && "bg-primary_hover/60"
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-primary">
                            <HighlightText text={item.title} query={query} />
                          </p>
                          <p className="truncate text-sm text-tertiary">
                            <HighlightText text={item.description} query={query} />
                          </p>
                        </div>
                        <ArrowUpRight
                          className={cx(
                            "size-4 shrink-0 text-fg-quaternary opacity-0 transition duration-100 ease-linear group-hover:opacity-100",
                            isActive && "opacity-100"
                          )}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {!query.trim() && (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <FeaturedIcon icon={SearchLg} color="gray" theme="modern" size="lg" />
            <p className="text-sm text-tertiary">Type to search across the site</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-secondary px-4 py-3">
        <div className="flex items-center gap-3 text-xs text-quaternary">
          <span className="flex items-center gap-1">
            <kbd className={kbdClass}>↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className={kbdClass}>↵</kbd> select
          </span>
          <span className="flex items-center gap-1">
            <kbd className={kbdClass}>Esc</kbd> close
          </span>
        </div>
        <p className="text-xs text-quaternary">{results.length} results</p>
      </div>
    </CommandDialog>
  );
}

/* ─── Search Trigger Button (for Navbar) ───────────────────────────────── */

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Search (Ctrl+K)"
      className="ml-3 inline-flex cursor-pointer items-center gap-2 rounded-lg p-2 text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <SearchLg className="size-5" />
      <kbd className={cx(kbdClass, "hidden xl:inline-flex")}>⌘K</kbd>
    </button>
  );
}
