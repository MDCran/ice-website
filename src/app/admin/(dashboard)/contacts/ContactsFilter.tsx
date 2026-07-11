"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDate, parseDate } from "@internationalized/date";
import type { DateValue } from "react-aria-components";
import { SearchLg, XClose } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { NativeSelect } from "@/components/base/select/select-native";
import { DateRangePicker } from "@/components/application/date-picker/date-range-picker";
import { Label } from "@/components/base/input/label";

function toYmd(value: DateValue | null | undefined): string {
  if (!value) return "";
  const y = value.year;
  const m = String(value.month).padStart(2, "0");
  const d = String(value.day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fromYmd(value: string): CalendarDate | null {
  if (!value) return null;
  try {
    return parseDate(value);
  } catch {
    return null;
  }
}

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
  const [rangeDraft, setRangeDraft] = useState<{ start: DateValue; end: DateValue } | null>(() => {
    const start = fromYmd(initialFrom);
    const end = fromYmd(initialTo);
    if (start && end) return { start, end };
    return null;
  });
  const router = useRouter();

  const rangeValue = useMemo(() => {
    const start = fromYmd(fromDate);
    const end = fromYmd(toDate);
    if (start && end) return { start, end };
    return rangeDraft;
  }, [fromDate, toDate, rangeDraft]);

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
    setRangeDraft(null);
    setSort("newest");
    router.push("/admin/contacts");
  };

  return (
    <form onSubmit={handleSearch} className="mb-6 flex flex-wrap items-end gap-3">
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

      <div className="flex flex-col gap-1.5">
        <Label>Date range</Label>
        <DateRangePicker
          size="sm"
          aria-label="Filter submissions by date range"
          value={rangeValue}
          onChange={(next) => {
            setRangeDraft(next);
            if (next?.start && next?.end) {
              const from = toYmd(next.start);
              const to = toYmd(next.end);
              setFromDate(from);
              setToDate(to);
            }
          }}
          onApply={() => {
            if (rangeDraft?.start && rangeDraft?.end) {
              const from = toYmd(rangeDraft.start);
              const to = toYmd(rangeDraft.end);
              setFromDate(from);
              setToDate(to);
              applyFilters({ from, to });
            } else if (fromDate && toDate) {
              applyFilters({ from: fromDate, to: toDate });
            }
          }}
          onCancel={() => {
            const start = fromYmd(fromDate);
            const end = fromYmd(toDate);
            setRangeDraft(start && end ? { start, end } : null);
          }}
        />
      </div>

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

      {(query || fromDate || toDate || sort !== "newest") && (
        <Button type="button" size="sm" color="secondary" onClick={handleClear}>
          Clear
        </Button>
      )}
    </form>
  );
}
