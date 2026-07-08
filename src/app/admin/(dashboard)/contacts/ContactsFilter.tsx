"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchLg, XClose } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { NativeSelect } from "@/components/base/select/select-native";

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
      <div className="relative min-w-55 flex-1">
        <Input
          size="sm"
          icon={SearchLg}
          aria-label="Search contacts"
          placeholder="Search by name or email..."
          value={query}
          onChange={(value) => setQuery(value)}
          inputClassName={query ? "pr-9" : undefined}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              applyFilters({ q: "" });
            }}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-md p-0.5 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover"
          >
            <XClose className="size-4" />
          </button>
        )}
      </div>

      {/* Date from */}
      <Input
        size="sm"
        type="date"
        label="From"
        value={fromDate}
        onChange={(value) => {
          setFromDate(value);
          applyFilters({ from: value });
        }}
        className="w-max min-w-36"
      />

      {/* Date to */}
      <Input
        size="sm"
        type="date"
        label="To"
        value={toDate}
        onChange={(value) => {
          setToDate(value);
          applyFilters({ to: value });
        }}
        className="w-max min-w-36"
      />

      {/* Sort */}
      <NativeSelect
        size="sm"
        aria-label="Sort order"
        value={sort}
        onChange={(e) => {
          setSort(e.target.value);
          applyFilters({ sort: e.target.value });
        }}
        options={[
          { label: "Newest", value: "newest" },
          { label: "Oldest", value: "oldest" },
        ]}
        className="w-max"
        selectClassName="pr-8"
      />

      {/* Clear all */}
      {(query || fromDate || toDate || sort !== "newest") && (
        <Button type="button" size="sm" color="secondary" onClick={handleClear}>
          Clear
        </Button>
      )}
    </form>
  );
}
