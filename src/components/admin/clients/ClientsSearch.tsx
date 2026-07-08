"use client";

import type { HTMLAttributes } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw01, SearchLg } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { cx } from "@/utils/cx";

const SpinnerIcon = (props: HTMLAttributes<HTMLOrSVGElement>) => (
  <RefreshCw01 {...props} className={cx("animate-spin", props.className)} />
);

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
    <Input
      aria-label="Search clients"
      size="sm"
      icon={isPending ? SpinnerIcon : SearchLg}
      value={query}
      onChange={handleSearch}
      placeholder="Search by company name..."
      className="max-w-md"
    />
  );
}
