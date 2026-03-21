"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, X, ArrowUpRight, FileText, Command } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { motion, AnimatePresence } from "motion/react";
import { searchIndex, type SearchItem } from "@/lib/searchData";

/* ─── Highlight matching text ──────────────────────────────────────────── */

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="search-highlight rounded px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ─── Search Modal ─────────────────────────────────────────────────────── */

export default function SearchModal({ items }: { items?: SearchItem[] } = {}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
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
      setTimeout(() => inputRef.current?.focus(), 50);
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
  }, [query]);

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
      setOpen(false);
      router.push(url);
    },
    [router]
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
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -20 }}
                  transition={{ duration: 0.2, ease: "easeOut" as const }}
                  className="fixed left-1/2 top-[15%] z-[101] w-full max-w-2xl -translate-x-1/2"
                >
                  <div className="search-modal mx-4 rounded-2xl border border-sky-500/15 bg-[#020617]/95 backdrop-blur-2xl shadow-2xl shadow-sky-500/10 overflow-hidden">
                    <VisuallyHidden.Root>
                      <Dialog.Title>Search</Dialog.Title>
                    </VisuallyHidden.Root>
                    {/* Top gradient line */}
                    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />

                    {/* Search input */}
                    <div className="search-modal-input flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
                      <SearchIcon className="h-5 w-5 text-slate-400 shrink-0" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setSelectedIndex(-1); }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search solutions, services, resources..."
                        className="search-modal-field flex-1 bg-transparent text-white text-base placeholder:text-slate-500 focus:outline-none"
                      />
                      <kbd className="search-modal-kbd hidden sm:inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400 font-mono">
                        ESC
                      </kbd>
                      <Dialog.Close asChild>
                        <button className="search-modal-close p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer" aria-label="Close">
                          <X className="h-4 w-4" />
                        </button>
                      </Dialog.Close>
                    </div>

                    {/* Results */}
                    <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto overscroll-contain p-3">
                      {query.trim() && results.length === 0 && (
                        <div className="py-12 text-center">
                          <SearchIcon className="h-10 w-10 text-slate-600 mx-auto mb-3 search-modal-empty-icon" />
                          <p className="text-sm text-slate-400 search-modal-empty-text">No results for &ldquo;{query}&rdquo;</p>
                        </div>
                      )}

                      {results.length > 0 && (
                        <div className="space-y-4">
                          {Array.from(grouped.entries()).map(([category, items]) => (
                            <div key={category}>
                              <div className="flex items-center gap-2 px-2 mb-2">
                                <FileText className="h-3.5 w-3.5 text-sky-400" />
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-sky-400">
                                  {category}
                                </span>
                              </div>
                              <div className="space-y-1">
                                {items.map((item) => {
                                  const globalIdx = results.indexOf(item);
                                  return (
                                    <Link
                                      key={item.url}
                                      href={item.url}
                                      onClick={() => setOpen(false)}
                                      data-result-item
                                      className={`search-modal-result flex items-start justify-between gap-3 rounded-xl px-4 py-3 transition-all duration-150 group ${
                                        globalIdx === selectedIndex
                                          ? "bg-sky-500/10 border border-sky-500/20"
                                          : "border border-transparent hover:bg-white/[0.04]"
                                      }`}
                                    >
                                      <div className="min-w-0">
                                        <p className="search-modal-title text-sm font-semibold text-white group-hover:text-sky-400 transition-colors">
                                          <HighlightText text={item.title} query={query} />
                                        </p>
                                        <p className="search-modal-desc text-xs text-slate-400 mt-0.5 line-clamp-1">
                                          <HighlightText text={item.description} query={query} />
                                        </p>
                                      </div>
                                      <ArrowUpRight className="h-4 w-4 text-slate-500 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {!query.trim() && (
                        <div className="py-12 text-center">
                          <SearchIcon className="h-10 w-10 text-slate-700 mx-auto mb-3 search-modal-empty-icon" />
                          <p className="text-sm text-slate-500 search-modal-empty-text">Type to search across the site</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="search-modal-footer flex items-center justify-between border-t border-white/[0.06] px-5 py-2.5">
                      <div className="flex items-center gap-4 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <kbd className="search-modal-kbd rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono">↑↓</kbd> navigate
                        </span>
                        <span className="flex items-center gap-1">
                          <kbd className="search-modal-kbd rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono">↵</kbd> select
                        </span>
                        <span className="flex items-center gap-1">
                          <kbd className="search-modal-kbd rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono">esc</kbd> close
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600">{results.length} results</p>
                    </div>
                  </div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ─── Search Trigger Button (for Navbar) ───────────────────────────────── */

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="ml-3 inline-flex items-center gap-2 p-2.5 rounded-xl text-slate-400 transition-all duration-300 hover:text-sky-400 hover:bg-sky-400/5 hover:shadow-[0_0_15px_rgba(168,85,247,0.1)] cursor-pointer"
      aria-label="Search (Ctrl+K)"
    >
      <SearchIcon className="h-5 w-5" />
      <kbd className="hidden xl:inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500 font-mono">
        <Command className="h-2.5 w-2.5" />K
      </kbd>
    </button>
  );
}
