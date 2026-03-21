"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, Loader2 } from "lucide-react";

export default function ClientsSearch({
  defaultValue,
}: {
  defaultValue: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    setQuery(value);
    startTransition(() => {
      const params = new URLSearchParams();
      if (value) params.set("q", value);
      router.push(`/admin/clients${params.toString() ? `?${params}` : ""}`);
    });
  };

  return (
    <div className="relative">
      {isPending ? (
        <Loader2
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 animate-spin"
        />
      ) : (
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
      )}
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search by company name..."
        className="w-full max-w-md pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all text-sm"
      />
    </div>
  );
}
