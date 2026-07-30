"use client";

import { useState } from "react";
import { Check, Copy01, SearchLg } from "@untitledui/icons";
import { IllustrationRenderer } from "@/components/illustrations/IllustrationRenderer";
import type { IllustrationMeta } from "@/lib/illustrations";
import { ILLUSTRATION_SIZE_PRESETS } from "@/lib/illustrations";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";

export default function IllustrationsClient({
  illustrations,
  categories,
}: {
  illustrations: IllustrationMeta[];
  categories: readonly string[];
}) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = illustrations.filter((ill) => {
    const matchCat = category === "All" || ill.category === category;
    const q = query.toLowerCase();
    const matchQ =
      !q ||
      ill.name.toLowerCase().includes(q) ||
      ill.description.toLowerCase().includes(q) ||
      ill.tags.some((t) => t.includes(q));
    return matchCat && matchQ;
  });

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Input
            size="md"
            icon={SearchLg}
            placeholder="Search by name, description, or tag…"
            value={query}
            onChange={setQuery}
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            size="sm"
            color={category === cat ? "primary" : "secondary"}
            onClick={() => setCategory(cat)}
          >
            {cat}
            {cat === "All" ? ` (${illustrations.length})` : ""}
          </Button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-primary p-12 text-center ring-1 ring-secondary">
          <p className="text-sm text-tertiary">No illustrations match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((ill) => (
            <div
              key={ill.id}
              className="group flex flex-col gap-3 rounded-xl bg-primary p-4 ring-1 ring-secondary transition-shadow hover:shadow-md"
            >
              {/* Preview */}
              <div className="flex aspect-square items-center justify-center rounded-lg bg-secondary p-2">
                <IllustrationRenderer id={ill.id} className="h-full w-full" />
              </div>
              {/* Info */}
              <div>
                <p className="text-sm font-medium text-primary">{ill.name}</p>
                <p className="mt-0.5 text-xs text-tertiary">{ill.category}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-tertiary">{ill.description}</p>
              </div>
              {/* Tags + size preset */}
              <div className="flex flex-wrap gap-1">
                {ill.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} size="sm" color="gray">
                    {tag}
                  </Badge>
                ))}
                <Badge size="sm" color="brand">
                  {ILLUSTRATION_SIZE_PRESETS[ill.defaultSize ?? "card"].label}
                </Badge>
              </div>
              {/* Copy ID button */}
              <Button
                size="sm"
                color="secondary"
                className="w-full"
                iconLeading={
                  copied === ill.id ? (
                    <Check className="size-4 text-fg-success-primary" data-icon />
                  ) : (
                    Copy01
                  )
                }
                onClick={() => copyId(ill.id)}
              >
                <span className="font-mono text-xs">
                  {copied === ill.id ? "Copied!" : ill.id}
                </span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Usage tip */}
      <div className="rounded-xl bg-brand-primary_alt p-5 ring-1 ring-secondary ring-inset">
        <p className="mb-1 text-sm font-semibold text-brand-secondary">How to use illustrations</p>
        <p className="text-sm text-tertiary">
          In any CMS page section, add a field named <code className="rounded bg-tertiary px-1.5 py-0.5 font-mono text-xs text-secondary">illustration</code> and
          set its value to the illustration ID (e.g. <code className="rounded bg-tertiary px-1.5 py-0.5 font-mono text-xs text-secondary">cloud-server</code>).
          The illustration will render alongside your section content automatically. You can also click
          the <strong className="font-semibold text-primary">Pick Illustration</strong> button in any illustration field while editing a section.
        </p>
      </div>
    </div>
  );
}
