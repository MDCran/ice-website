import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Clock,
  File02,
  LayersThree01,
  LayoutGrid01,
  LinkExternal01,
  Mail01,
  MarkerPin02,
  Phone01,
  Settings01,
  Star01,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import type { BadgeColor } from "@/components/base/badges/badges";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

export const metadata = { title: "Section Templates | ICE Admin" };

type TemplateEntry = {
  section_key: string;
  section_type: string;
  contentKeys: string[];
  contentSample: Record<string, any>;
  usedOn: { title: string; slug: string }[];
};

async function getTemplates() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("page_sections")
    .select("section_key, section_type, content, pages(title, slug)")
    .order("section_type")
    .order("section_key");

  const grouped = new Map<string, TemplateEntry[]>();
  if (!data) return grouped;

  const seen = new Set<string>();

  for (const row of data) {
    const key = `${row.section_type}::${row.section_key}`;
    if (seen.has(key)) {
      const group = grouped.get(row.section_type);
      const entry = group?.find((e) => e.section_key === row.section_key);
      if (entry && row.pages) {
        const page = row.pages as any;
        const pageTitle = page.title ?? page.slug;
        if (!entry.usedOn.some((p: any) => p.title === pageTitle)) {
          entry.usedOn.push({ title: pageTitle, slug: page.slug ?? "" });
        }
      }
      continue;
    }
    seen.add(key);

    const contentKeys = row.content ? Object.keys(row.content) : [];
    const page = row.pages as any;
    const pageInfo = page ? { title: page.title ?? page.slug, slug: page.slug ?? "" } : { title: "Unknown", slug: "" };

    if (!grouped.has(row.section_type)) grouped.set(row.section_type, []);
    grouped.get(row.section_type)!.push({
      section_key: row.section_key,
      section_type: row.section_type,
      contentKeys,
      contentSample: row.content ?? {},
      usedOn: [pageInfo],
    });
  }

  return grouped;
}

function prettify(str: string) {
  return str.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const TYPE_COLORS: Record<string, BadgeColor<"pill-color">> = {
  hero: "brand",
  content: "success",
  features: "purple",
  process: "blue",
  benefits: "sky",
  stats: "sky",
  metrics: "sky",
  cta: "warning",
  faq: "indigo",
  gallery: "orange",
  timeline: "purple",
  partners: "pink",
  industries: "pink",
  contact: "brand",
  form: "success",
};

/* ═══════════════════════════════════════════════════════════════════════════
   VISUAL PREVIEW MOCKUPS — miniature token-based renderings of each type
   ═══════════════════════════════════════════════════════════════════════════ */

function HeroPreview({ data }: { data?: Record<string, any> }) {
  const heading = data?.heading ?? data?.title ?? "Page Heading";
  const sub = data?.subheading ?? data?.description ?? "Subheading text goes here";
  const cta = data?.cta_text ?? "Get Started";
  return (
    <div className="rounded-lg bg-secondary p-6 text-center ring-1 ring-secondary">
      <div className="mb-1 text-sm font-bold text-primary">{heading}</div>
      <div className="mx-auto mb-3 line-clamp-2 max-w-62 text-[9px] text-tertiary">{sub}</div>
      <div className="flex justify-center gap-2">
        <div className="rounded-md bg-brand-solid px-2.5 py-1 text-[8px] font-medium text-white">{cta}</div>
        <div className="rounded-md bg-primary px-2.5 py-1 text-[8px] font-medium text-secondary ring-1 ring-primary ring-inset">Learn More</div>
      </div>
    </div>
  );
}

function ContentPreview({ data }: { data?: Record<string, any> }) {
  const heading = data?.heading ?? data?.title ?? "Content Block";
  const body = data?.description ?? data?.content ?? "";
  return (
    <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary">
      <div className="flex items-center gap-4">
        <div className="h-14 w-20 shrink-0 rounded-lg bg-brand-secondary" />
        <div className="flex-1 space-y-1.5">
          <div className="text-xs font-bold text-primary">{heading}</div>
          {body ? (
            <div className="line-clamp-3 text-[9px] leading-relaxed text-tertiary">{String(body).slice(0, 150)}</div>
          ) : (
            <>
              <div className="h-1.5 w-full rounded bg-tertiary" />
              <div className="h-1.5 w-4/5 rounded bg-tertiary" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FeaturesPreview({ data }: { data?: Record<string, any> }) {
  const items = data?.items ?? data?.features ?? [];
  const heading = data?.heading ?? data?.title ?? "";
  return (
    <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary">
      {heading && <div className="mb-3 text-center text-xs font-bold text-primary">{heading}</div>}
      <div className="grid grid-cols-3 gap-2">
        {(items.length > 0 ? items.slice(0, 3) : [1, 2, 3]).map((item: any, i: number) => (
          <div key={i} className="rounded-lg bg-primary p-2.5 text-center ring-1 ring-secondary">
            <div className="mx-auto mb-1.5 flex size-6 items-center justify-center rounded-md bg-brand-secondary">
              <Star01 className="size-2.5 text-fg-brand-primary" />
            </div>
            {typeof item === "object" && item?.title ? (
              <>
                <div className="truncate text-[9px] font-semibold text-primary">{item.title}</div>
                {item.description && <div className="mt-0.5 line-clamp-2 text-[7px] text-tertiary">{item.description}</div>}
              </>
            ) : (
              <>
                <div className="mx-auto mb-1 h-1.5 w-4/5 rounded bg-tertiary" />
                <div className="h-1 w-full rounded bg-secondary_alt" />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsPreview({ data }: { data?: Record<string, any> }) {
  const items = data?.items ?? data?.stats ?? [];
  const defaults = [{ value: "35+", label: "Years" }, { value: "1,200+", label: "Projects" }, { value: "500+", label: "Clients" }, { value: "100%", label: "Uptime" }];
  const display = items.length > 0 ? items.slice(0, 4) : defaults;
  return (
    <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary">
      <div className="grid grid-cols-4 gap-2">
        {display.map((item: any, i: number) => (
          <div key={i} className="rounded-lg bg-primary p-2 text-center ring-1 ring-secondary">
            <div className="text-sm font-bold text-brand-secondary">{item.value ?? item.suffix ? `${item.value}${item.suffix ?? ""}` : item.value}</div>
            <div className="mt-0.5 truncate text-[8px] text-tertiary">{item.label ?? ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqPreview({ data }: { data?: Record<string, any> }) {
  const items = data?.items ?? data?.faqs ?? [];
  return (
    <div className="space-y-1.5 rounded-lg bg-secondary p-4 ring-1 ring-secondary">
      <div className="mb-2 text-center text-xs font-bold text-primary">
        Frequently Asked <span className="text-brand-secondary">Questions</span>
      </div>
      {(items.length > 0 ? items.slice(0, 3) : [1, 2, 3]).map((item: any, i: number) => (
        <div key={i} className="flex items-center justify-between rounded-lg bg-primary px-3 py-2 ring-1 ring-secondary">
          {typeof item === "object" && item?.question ? (
            <span className="truncate pr-2 text-[9px] text-secondary">{item.question}</span>
          ) : (
            <div className="h-1.5 w-3/5 rounded bg-tertiary" />
          )}
          <ChevronDown className="size-2.5 shrink-0 text-fg-brand-primary" />
        </div>
      ))}
    </div>
  );
}

function CtaPreview({ data }: { data?: Record<string, any> }) {
  const heading = data?.heading ?? data?.title ?? "Ready to Get Started?";
  const desc = data?.description ?? "";
  const cta = data?.cta_text ?? "Contact Us";
  return (
    <div className="rounded-lg bg-brand-section p-5 text-center">
      <div className="mb-1 text-xs font-bold text-white">{heading}</div>
      {desc ? (
        <div className="mx-auto mb-3 line-clamp-2 max-w-50 text-[8px] text-white/70">{desc}</div>
      ) : (
        <div className="mx-auto mb-3 h-1.5 w-3/5 rounded bg-white/20" />
      )}
      <div className="flex justify-center gap-2">
        <div className="flex items-center gap-1 rounded-md bg-white px-3 py-1 text-[8px] font-medium text-secondary">
          {cta} <ArrowRight className="size-2" />
        </div>
      </div>
    </div>
  );
}

function ProcessPreview({ data }: { data?: Record<string, any> }) {
  return (
    <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary">
      <div className="flex items-start gap-3">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex-1 text-center">
            <div className="mx-auto mb-1.5 flex size-6 items-center justify-center rounded-full bg-brand-secondary text-[8px] font-bold text-fg-brand-primary ring-1 ring-utility-brand-200">{step}</div>
            <div className="mx-auto mb-0.5 h-1.5 w-4/5 rounded bg-tertiary" />
            <div className="h-1 w-full rounded bg-secondary_alt" />
          </div>
        ))}
      </div>
    </div>
  );
}

function BenefitsPreview({ data }: { data?: Record<string, any> }) {
  return (
    <div className="space-y-1.5 rounded-lg bg-secondary p-4 ring-1 ring-secondary">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <CheckCircle className="size-2.5 shrink-0 text-fg-brand-primary" />
          <div className="h-1.5 flex-1 rounded bg-tertiary" />
        </div>
      ))}
    </div>
  );
}

function MetricsPreview({ data }: { data?: Record<string, any> }) {
  return (
    <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary">
      <div className="grid grid-cols-3 gap-3">
        {["99.9%", "< 4hr", "24/7"].map((val) => (
          <div key={val} className="text-center">
            <div className="mx-auto mb-1.5 flex size-12 items-center justify-center rounded-full border-2 border-utility-brand-200">
              <span className="text-[9px] font-bold text-brand-secondary">{val}</span>
            </div>
            <div className="mx-auto h-1 w-4/5 rounded bg-tertiary" />
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryPreview({ data }: { data?: Record<string, any> }) {
  return (
    <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary">
      <div className="flex gap-3 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex h-8 w-16 shrink-0 items-center justify-center rounded-lg bg-primary ring-1 ring-secondary">
            <div className="h-4 w-10 rounded bg-tertiary" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelinePreview({ data }: { data?: Record<string, any> }) {
  return (
    <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary">
      <div className="relative space-y-2 pl-5">
        <div className="absolute top-1 bottom-1 left-[7px] w-px bg-border-secondary" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative flex items-start gap-2">
            <div className="absolute top-1 -left-3.5 size-2 rounded-full bg-brand-solid ring-2 ring-bg-secondary" />
            <div className="flex-1">
              <div className="mb-1 h-1.5 w-1/3 rounded bg-tertiary" />
              <div className="h-1 w-full rounded bg-secondary_alt" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PartnersPreview({ data }: { data?: Record<string, any> }) {
  return (
    <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary">
      <div className="grid grid-cols-2 gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-start gap-2 rounded-lg bg-primary p-2.5 ring-1 ring-secondary">
            <div className="size-8 shrink-0 rounded-md bg-tertiary" />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 w-2/3 rounded bg-tertiary" />
              <div className="h-1 w-full rounded bg-secondary_alt" />
              <div className="mt-1 flex gap-1">
                <div className="h-2.5 rounded-full bg-secondary px-1.5 ring-1 ring-secondary" />
                <div className="h-2.5 rounded-full bg-secondary px-1.5 ring-1 ring-secondary" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IndustriesPreview({ data }: { data?: Record<string, any> }) {
  return (
    <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary">
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-primary p-2.5 text-center ring-1 ring-secondary">
            <div className="mx-auto mb-1.5 size-6 rounded-md bg-brand-secondary" />
            <div className="mx-auto mb-1 h-1.5 w-4/5 rounded bg-tertiary" />
            <div className="h-1 w-full rounded bg-secondary_alt" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactPreview({ data }: { data?: Record<string, any> }) {
  return (
    <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary">
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: MarkerPin02, label: "Address" },
          { icon: Phone01, label: "Phone" },
          { icon: Mail01, label: "Email" },
          { icon: Clock, label: "Hours" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 rounded-lg bg-primary p-2 ring-1 ring-secondary">
            <div className="flex size-5 shrink-0 items-center justify-center rounded bg-brand-secondary">
              <Icon className="size-2 text-fg-brand-primary" />
            </div>
            <div className="flex-1">
              <div className="text-[7px] text-quaternary uppercase">{label}</div>
              <div className="mt-0.5 h-1.5 w-4/5 rounded bg-tertiary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormPreview({ data }: { data?: Record<string, any> }) {
  return (
    <div className="space-y-2 rounded-lg bg-secondary p-4 ring-1 ring-secondary">
      <div className="grid grid-cols-2 gap-2">
        <div className="h-6 rounded-md bg-primary ring-1 ring-secondary" />
        <div className="h-6 rounded-md bg-primary ring-1 ring-secondary" />
      </div>
      <div className="h-6 rounded-md bg-primary ring-1 ring-secondary" />
      <div className="h-12 rounded-md bg-primary ring-1 ring-secondary" />
      <div className="flex h-6 items-center justify-center rounded-md bg-brand-solid">
        <div className="text-[8px] font-medium text-white">Send Message</div>
      </div>
    </div>
  );
}

const PREVIEW_COMPONENTS: Record<string, (props: { data?: Record<string, any> }) => React.ReactElement> = {
  hero: HeroPreview,
  content: ContentPreview,
  features: FeaturesPreview,
  process: ProcessPreview,
  benefits: BenefitsPreview,
  stats: StatsPreview,
  metrics: MetricsPreview,
  cta: CtaPreview,
  faq: FaqPreview,
  gallery: GalleryPreview,
  timeline: TimelinePreview,
  partners: PartnersPreview,
  industries: IndustriesPreview,
  contact: ContactPreview,
  form: FormPreview,
};

/* ═══════════════════════════════════════════════════════════════════════════ */

export default async function TemplatesPage() {
  const grouped = await getTemplates();

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-display-xs font-semibold text-primary">Section Templates</h1>
          <p className="mt-1 text-sm text-tertiary">
            Visual previews of every section type. See how each renders on the site.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-quaternary">
          <LayoutGrid01 className="size-3.5" />
          {Array.from(grouped.values()).reduce((sum, entries) => sum + entries.length, 0)} sections across {grouped.size} types
        </div>
      </div>

      {grouped.size === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-primary px-6 py-16 text-center shadow-xs ring-1 ring-secondary">
          <FeaturedIcon color="gray" theme="modern" size="lg" icon={LayersThree01} />
          <p className="mt-4 text-md font-semibold text-primary">No sections found</p>
          <p className="mt-1 text-sm text-tertiary">Create pages with sections in the CMS editor to see templates here.</p>
        </div>
      ) : (
        Array.from(grouped.entries()).map(([sectionType, entries]) => {
          const PreviewComponent = PREVIEW_COMPONENTS[sectionType];
          const color = TYPE_COLORS[sectionType] ?? "gray";

          return (
            <div key={sectionType} id={`type-${sectionType}`} className="scroll-mt-24">
              {/* Type header */}
              <div className="mb-5 flex items-center gap-3">
                <LayersThree01 className="size-4.5 text-fg-brand-primary" />
                <h2 className="text-lg font-semibold text-primary">{prettify(sectionType)}</h2>
                <Badge size="sm" color={color}>{entries.length} in use</Badge>
              </div>

              {/* Visual preview mockup */}
              {PreviewComponent && (
                <div className="mb-5 overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
                  <div className="flex items-center gap-2 border-b border-secondary px-4 py-2.5">
                    <div className="flex gap-1">
                      <div className="size-2 rounded-full bg-utility-red-400" />
                      <div className="size-2 rounded-full bg-utility-yellow-400" />
                      <div className="size-2 rounded-full bg-utility-green-400" />
                    </div>
                    <span className="ml-2 font-mono text-[9px] text-quaternary">icesales.com — {prettify(sectionType)} Section</span>
                  </div>
                  <div className="p-4">
                    <PreviewComponent data={entries[0]?.contentSample} />
                  </div>
                </div>
              )}

              {/* Section instances */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {entries.map((entry) => (
                  <div key={entry.section_key} className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
                    {/* Mini preview */}
                    {PreviewComponent && (
                      <div className="border-b border-secondary bg-secondary px-4 py-3">
                        <div className="origin-top-left scale-[0.65] transform" style={{ width: "153.8%", marginBottom: "-35%" }}>
                          <PreviewComponent data={entry.contentSample} />
                        </div>
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-secondary px-5 py-3.5">
                      <div>
                        <h3 className="text-sm font-semibold text-primary">{prettify(entry.section_key)}</h3>
                        <p className="mt-0.5 font-mono text-[10px] text-quaternary">section_key: {entry.section_key}</p>
                      </div>
                      <Badge size="sm" color={color} className="whitespace-nowrap">
                        {prettify(entry.section_type)}
                      </Badge>
                    </div>

                    {/* Fields */}
                    {entry.contentKeys.length > 0 && (
                      <div className="border-b border-secondary px-5 py-3">
                        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-quaternary uppercase">
                          <Settings01 className="size-2.5" />
                          Fields ({entry.contentKeys.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {entry.contentKeys.map((k) => {
                            const value = entry.contentSample[k];
                            const isArray = Array.isArray(value);
                            return (
                              <span
                                key={k}
                                className={`rounded px-1.5 py-0.5 font-mono text-[10px] ring-1 ring-inset ${
                                  isArray
                                    ? "bg-utility-brand-50 text-utility-brand-700 ring-utility-brand-200"
                                    : "bg-secondary text-tertiary ring-secondary"
                                }`}
                              >
                                {k}{isArray ? `[${value.length}]` : ""}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Array item structure */}
                    {entry.contentKeys.some((k) => Array.isArray(entry.contentSample[k]) && entry.contentSample[k].length > 0) && (
                      <div className="border-b border-secondary px-5 py-3">
                        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-quaternary uppercase">
                          <File02 className="size-2.5" />
                          Item Structure
                        </p>
                        {entry.contentKeys
                          .filter((k) => Array.isArray(entry.contentSample[k]) && entry.contentSample[k].length > 0)
                          .slice(0, 1)
                          .map((k) => {
                            const firstItem = entry.contentSample[k][0];
                            const itemKeys = typeof firstItem === "object" && firstItem ? Object.keys(firstItem) : [];
                            return (
                              <div key={k} className="flex flex-wrap gap-1">
                                {itemKeys.map((ik) => (
                                  <span key={ik} className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-tertiary ring-1 ring-secondary ring-inset">
                                    {ik}
                                  </span>
                                ))}
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {/* Used on */}
                    <div className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {entry.usedOn.map((page) => (
                          <Link
                            key={page.slug}
                            href={`/admin/cms/${page.slug}`}
                            className="inline-flex items-center gap-1 rounded-full bg-utility-brand-50 px-2.5 py-0.5 text-[10px] font-medium text-utility-brand-700 ring-1 ring-utility-brand-200 transition-colors ring-inset hover:bg-utility-brand-100"
                          >
                            {page.title}
                            <LinkExternal01 className="size-2" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
