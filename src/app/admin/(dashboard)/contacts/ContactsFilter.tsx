"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export default function ContactsFilter({
  initialQuery,
  initialFrom,
  initialTo,
  initialSort,
}: {
  initialQuery: string;
  initialFrom: string;
  initialTo: string;
  initialSort: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [fromDate, setFromDate] = useState(initialFrom);
  const [toDate, setToDate] = useState(initialTo);
  const [sort, setSort] = useState(initialSort || "newest");
  const router = useRouter();

  const applyFilters = (overrides?: { q?: string; from?: string; to?: string; sort?: string }) => {
    const params = new URLSearchParams();
    const q = overrides?.q ?? query;
    const f = overrides?.from ?? fromDate;
    const t = overrides?.to ?? toDate;
    const s = overrides?.sort ?? sort;
    if (q.trim()) params.set("q", q.trim());
    if (f) params.set("from", f);
    if (t) params.set("to", t);
    if (s && s !== "newest") params.set("sort", s);
    router.push(`/admin/contacts${params.toString() ? `?${params}` : ""}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleClear = () => {
    setQuery("");
    setFromDate("");
    setToDate("");
    setSort("newest");
    router.push("/admin/contacts");
  };

  return (
    <form onSubmit={handleSearch} className="mb-6 flex flex-wrap items-end gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[220px]">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-11 pr-10 py-2.5 admin-text text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              applyFilters({ q: "" });
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Date from */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500">From</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            applyFilters({ from: e.target.value });
          }}
          className="bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 admin-text text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
        />
      </div>

      {/* Date to */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500">To</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            applyFilters({ to: e.target.value });
          }}
          className="bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 admin-text text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
        />
      </div>

      {/* Sort */}
      <select
        value={sort}
        onChange={(e) => {
          setSort(e.target.value);
          applyFilters({ sort: e.target.value });
        }}
        className="bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 admin-text text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer"
      >
        <option value="newest" className="bg-slate-900">Newest</option>
        <option value="oldest" className="bg-slate-900">Oldest</option>
      </select>

      {/* Clear all */}
      {(query || fromDate || toDate || sort !== "newest") && (
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-slate-400 hover:text-white text-sm transition-colors cursor-pointer"
        >
          Clear
        </button>
      )}
    </form>
  );
}
