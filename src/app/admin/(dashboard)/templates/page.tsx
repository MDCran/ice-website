/* CMS section payloads are schemaless JSON; previews inspect each known shape at runtime. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactElement } from "react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Clock,
  LayersThree01,
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

export const metadata = { title: "Section Library | ICE Admin" };

type TemplateEntry = {
  section_key: string;
  section_type: string;
  contentKeys: string[];
  contentSample: Record<string, any>;
  usedOn: { title: string; slug: string }[];
};

async function getTemplates() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_sections")
    .select("section_key, section_type, content, pages(title, slug)")
    .eq("is_visible", true)
    .order("section_type")
    .order("section_key");

  const grouped = new Map<string, TemplateEntry[]>();
  if (error) return { grouped, error: "Could not load the section library. Please try again shortly." };
  if (!data) return { grouped, error: null };

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

  return { grouped, error: null };
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
      <div className="mx-auto mb-3 line-clamp-2 max-w-62 text-xs text-tertiary">{sub}</div>
      <div className="flex justify-center gap-2">
        <div className="rounded-md bg-brand-solid px-2.5 py-1 text-xs font-medium text-white">{cta}</div>
        <div className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-secondary ring-1 ring-primary ring-inset">Learn More</div>
      </div>
    </div>
  );
}

function ContentPreview({ data }: { data?: Record<string, any> }) {
  const heading = data?.heading ?? data?.title ?? "Content Block";
  const body = data?.description ?? data?.content ?? "Supporting copy and useful details for this page section.";
  return (
    <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary">
      <div className="flex items-center gap-4">
        <div className="h-14 w-20 shrink-0 rounded-lg bg-brand-secondary" />
        <div className="flex-1 space-y-1.5">
          <div className="text-xs font-bold text-primary">{heading}</div>
          <div className="line-clamp-3 text-xs leading-relaxed text-tertiary">{String(body).slice(0, 150)}</div>
        </div>
      </div>
    </div>
  );
}

function FeaturesPreview({ data }: { data?: Record<string, any> }) {
  const items = data?.items ?? data?.features ?? [
    { title: "Plan", description: "Set a clear direction." },
    { title: "Protect", description: "Reduce operational risk." },
    { title: "Operate", description: "Keep critical work moving." },
  ];
  const heading = data?.heading ?? data?.title ?? "";
  return (
    <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary">
      {heading && <div className="mb-3 text-center text-xs font-bold text-primary">{heading}</div>}
      <div className="grid grid-cols-3 gap-2">
        {items.slice(0, 3).map((item: any, i: number) => (
          <div key={i} className="rounded-lg bg-primary p-2.5 text-center ring-1 ring-secondary">
            <div className="mx-auto mb-1.5 flex size-6 items-center justify-center rounded-md bg-brand-secondary">
              <Star01 className="size-2.5 text-fg-brand-primary" />
            </div>
            {typeof item === "object" && item?.title ? (
              <>
                <div className="truncate text-xs font-semibold text-primary">{item.title}</div>
                {item.description && <div className="mt-0.5 line-clamp-2 text-xs text-tertiary">{item.description}</div>}
              </>
            ) : <div className="text-xs font-medium text-primary">{String(item)}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsPreview({ data }: { data?: Record<string, any> }) {
  const items = data?.items ?? data?.stats ?? [];
  const defaults = [{ value: "30+", label: "Years in business" }, { value: "IBM i", label: "Platform focus" }, { value: "Since 1990", label: "IBM Business Partner" }, { value: "Scoped", label: "Service commitments" }];
  const display = items.length > 0 ? items.slice(0, 4) : defaults;
  return (
    <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary">
      <div className="grid grid-cols-4 gap-2">
        {display.map((item: any, i: number) => (
          <div key={i} className="rounded-lg bg-primary p-2 text-center ring-1 ring-secondary">
            <div className="text-sm font-bold text-brand-secondary">{item.value ?? item.suffix ? `${item.value}${item.suffix ?? ""}` : item.value}</div>
            <div className="mt-0.5 truncate text-xs text-tertiary">{item.label ?? ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqPreview({ data }: { data?: Record<string, any> }) {
  const items = data?.items ?? data?.faqs ?? [
    { question: "What should I prepare before contacting ICE?" },
    { question: "Which platforms and services do you support?" },
    { question: "How do we get started?" },
  ];
  return (
    <div className="space-y-1.5 rounded-lg bg-secondary p-4 ring-1 ring-secondary">
      <div className="mb-2 text-center text-xs font-bold text-primary">
        Frequently Asked <span className="text-brand-secondary">Questions</span>
      </div>
      {items.slice(0, 3).map((item: any, i: number) => (
        <div key={i} className="flex items-center justify-between rounded-lg bg-primary px-3 py-2 ring-1 ring-secondary">
          {typeof item === "object" && item?.question ? (
            <span className="truncate pr-2 text-xs text-secondary">{item.question}</span>
          ) : <span className="truncate pr-2 text-xs text-secondary">Question {i + 1}</span>}
          <ChevronDown className="size-2.5 shrink-0 text-fg-brand-primary" />
        </div>
      ))}
    </div>
  );
}

function CtaPreview({ data }: { data?: Record<string, any> }) {
  const heading = data?.heading ?? data?.title ?? "Ready to Get Started?";
  const desc = data?.description ?? "Tell us about your environment and an ICE specialist will help identify a practical next step.";
  const cta = data?.cta_text ?? "Contact Us";
  return (
    <div className="rounded-lg bg-brand-section p-5 text-center">
      <div className="mb-1 text-xs font-bold text-white">{heading}</div>
      <div className="mx-auto mb-3 line-clamp-2 max-w-50 text-xs text-white/70">{desc}</div>
      <div className="flex justify-center gap-2">
        <div className="flex items-center gap-1 rounded-md bg-white px-3 py-1 text-xs font-medium text-secondary">
          {cta} <ArrowRight className="size-2" />
        </div>
      </div>
    </div>
  );
}

function ProcessPreview({ data }: { data?: Record<string, any> }) {
  const items = data?.items ?? data?.steps ?? [
    { title: "Assess", description: "Understand priorities." },
    { title: "Plan", description: "Agree on a practical path." },
    { title: "Deliver", description: "Move forward with clear steps." },
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-3">
        {items.slice(0, 3).map((item: any, index: number) => (
          <div key={index} className="rounded-lg bg-primary p-3 ring-1 ring-secondary">
            <span className="text-xs font-semibold text-brand-secondary">Step {index + 1}</span>
            <p className="mt-1 text-sm font-semibold text-primary">{item?.title ?? item?.heading ?? "Next step"}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-tertiary">{item?.description ?? "A defined milestone with a clear outcome."}</p>
          </div>
        ))}
    </div>
  );
}

function BenefitsPreview({ data }: { data?: Record<string, any> }) {
  const items = data?.items ?? data?.benefits ?? [];
  const samples = [
    { title: "Clear service ownership", text: "Defined responsibilities for your environment." },
    { title: "Practical risk reduction", text: "Support aligned to business priorities." },
    { title: "Room to scale", text: "A service plan that can evolve with you." },
  ];
  const display = items.length > 0 ? items.slice(0, 3) : samples;
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {display.map((item: any, index: number) => (
        <div key={index} className="rounded-lg bg-primary p-3 ring-1 ring-secondary">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <CheckCircle className="size-4 shrink-0 text-fg-brand-primary" />
            <span className="line-clamp-2">{item?.title ?? item?.heading ?? `Benefit ${index + 1}`}</span>
          </div>
          {(item?.text || item?.description) && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-tertiary">{item.text ?? item.description}</p>}
        </div>
      ))}
    </div>
  );
}

function MetricsPreview({ data }: { data?: Record<string, any> }) {
  const items = data?.items ?? data?.metrics ?? [];
  const display = items.length ? items.slice(0, 3) : [
    { value: "30+", label: "Years in business" },
    { value: "IBM i", label: "Platform expertise" },
    { value: "24/7", label: "Coverage options" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {display.map((item: any, index: number) => (
        <div key={index} className="rounded-lg bg-primary p-3 text-center ring-1 ring-secondary">
          <p className="text-lg font-semibold text-brand-secondary">{item.value ?? item.number ?? "—"}{item.suffix ?? ""}</p>
          <p className="mt-1 text-xs leading-relaxed text-tertiary">{item.label ?? item.title ?? "Metric"}</p>
        </div>
      ))}
    </div>
  );
}

function GalleryPreview({ data }: { data?: Record<string, any> }) {
  const items = data?.partners ?? data?.items ?? [{ name: "IBM" }, { name: "Cloud" }, { name: "Security" }];
  return (
    <div className="flex flex-wrap gap-2">
      {items.slice(0, 6).map((item: any, index: number) => (
        <span key={index} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary ring-1 ring-secondary"><span className="flex size-6 items-center justify-center rounded-md bg-brand-primary text-[10px] text-brand-secondary">{String(item?.name ?? item?.title ?? "ICE").slice(0, 2)}</span>{item?.name ?? item?.title ?? `Partner ${index + 1}`}</span>
      ))}
    </div>
  );
}

function TimelinePreview({ data }: { data?: Record<string, any> }) {
  const items = data?.items ?? data?.milestones ?? [];
  const display = items.length ? items.slice(0, 3) : [
    { year: "01", title: "Assess", description: "Understand current priorities." },
    { year: "02", title: "Plan", description: "Agree on a practical path." },
    { year: "03", title: "Deliver", description: "Move forward with clear steps." },
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {display.map((item: any, index: number) => (
        <div key={index} className="rounded-lg bg-primary p-3 ring-1 ring-secondary">
          <p className="text-xs font-semibold text-brand-secondary">{item.year ?? item.step ?? `Step ${index + 1}`}</p>
          <p className="mt-1 text-sm font-semibold text-primary">{item.title ?? item.heading ?? "Milestone"}</p>
          {item.description && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-tertiary">{item.description}</p>}
        </div>
      ))}
    </div>
  );
}

function PartnersPreview({ data }: { data?: Record<string, any> }) {
  const items = data?.partners ?? data?.items ?? [
    { name: "IBM", capability: "Power & IBM i" },
    { name: "Technology partner", capability: "Enterprise solutions" },
  ];
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {items.slice(0, 4).map((item: any, index: number) => (
          <div key={index} className="flex items-center gap-3 rounded-lg bg-primary p-3 ring-1 ring-secondary">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary text-xs font-bold text-brand-secondary">{String(item?.name ?? "ICE").slice(0, 2)}</span>
            <div className="min-w-0"><p className="truncate text-sm font-semibold text-primary">{item?.name ?? `Partner ${index + 1}`}</p><p className="mt-0.5 truncate text-xs text-tertiary">{item?.capability ?? item?.description ?? "Technology partner"}</p></div>
          </div>
      ))}
    </div>
  );
}

function IndustriesPreview({ data }: { data?: Record<string, any> }) {
  const items = data?.items ?? data?.industries ?? [
    { name: "Manufacturing" },
    { name: "Financial services" },
    { name: "Healthcare" },
  ];
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {items.slice(0, 3).map((item: any, index: number) => (
          <div key={index} className="rounded-lg bg-primary p-3 text-center ring-1 ring-secondary">
            <span className="mx-auto flex size-8 items-center justify-center rounded-lg bg-brand-primary text-xs font-semibold text-brand-secondary">{String(item?.name ?? "ICE").slice(0, 1)}</span>
            <p className="mt-2 text-xs font-semibold text-primary">{item?.name ?? `Industry ${index + 1}`}</p>
          </div>
        ))}
    </div>
  );
}

function ContactPreview({ data }: { data?: Record<string, any> }) {
  const values = [
    { icon: MarkerPin02, label: "Address", value: data?.address || data?.location || "Business address" },
    { icon: Phone01, label: "Phone", value: data?.phone || data?.telephone || "Phone number" },
    { icon: Mail01, label: "Email", value: data?.email || data?.email_address || "Contact email" },
    { icon: Clock, label: "Hours", value: data?.hours || data?.business_hours || "Business hours" },
  ];
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {values.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex min-w-0 items-center gap-3 rounded-lg bg-primary p-3 ring-1 ring-secondary">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary text-fg-brand-primary"><Icon className="size-4" /></span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-quaternary">{label}</p>
            <p className="mt-0.5 truncate text-sm font-medium text-primary">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function FormPreview({ data }: { data?: Record<string, any> }) {
  const fieldNames = Array.isArray(data?.fields)
    ? data.fields.slice(0, 3).map((field: any) => field?.label ?? field?.name).filter(Boolean)
    : ["Name", "Work email", "Company"];
  return (
    <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary">
      <div className="grid grid-cols-2 gap-2">
        {fieldNames.slice(0, 2).map((name: string) => <div key={name} className="rounded-md bg-primary px-3 py-2 text-xs text-tertiary ring-1 ring-secondary">{name}</div>)}
      </div>
      {fieldNames[2] && <div className="mt-2 rounded-md bg-primary px-3 py-2 text-xs text-tertiary ring-1 ring-secondary">{fieldNames[2]}</div>}
      <div className="mt-3 inline-flex rounded-md bg-brand-solid px-3 py-2 text-xs font-semibold text-white">{data?.submit_label ?? data?.button_label ?? "Send message"}</div>
    </div>
  );
}

const PREVIEW_COMPONENTS: Record<string, (props: { data?: Record<string, any> }) => ReactElement> = {
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
  const { grouped, error } = await getTemplates();
  const totalSections = Array.from(grouped.values()).reduce((sum, entries) => sum + entries.length, 0);
  const usedPageCount = new Set(Array.from(grouped.values()).flatMap((entries) => entries.flatMap((entry) => entry.usedOn.map((page) => page.slug).filter(Boolean)))).size;

  return (
    <div className="mx-auto max-w-[1500px] space-y-8">
      <section className="rounded-2xl bg-primary p-6 shadow-xs ring-1 ring-secondary sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.16em] text-brand-secondary uppercase">Build · CMS</p>
            <h1 className="mt-2 text-display-xs font-semibold text-primary">Page section library</h1>
            <p className="mt-3 text-sm leading-6 text-tertiary">
              Browse the reusable layouts currently used across the public site. This is a reference library—not a separate editor. Open a page to change its copy, or use the page editor to add a section.
            </p>
          </div>
          <Link href="/admin/cms" className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-solid px-4 text-sm font-semibold text-white shadow-xs transition hover:brightness-105">
            Open CMS pages <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-3 border-t border-secondary pt-5 sm:grid-cols-3">
          {[
            { label: "Sections in use", value: totalSections, note: "Current page building blocks" },
            { label: "Layout types", value: grouped.size, note: "Different section patterns" },
            { label: "Pages covered", value: usedPageCount, note: "Pages with a linked section" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-secondary p-4">
              <p className="text-xs font-medium text-tertiary">{stat.label}</p>
              <p className="mt-1 text-xl font-semibold text-primary">{stat.value}</p>
              <p className="mt-1 text-xs text-quaternary">{stat.note}</p>
            </div>
          ))}
        </div>
      </section>

      {error && <div role="alert" className="rounded-xl bg-error-primary p-4 text-sm text-error-primary ring-1 ring-error_subtle">{error}</div>}

      {error ? null : grouped.size === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-primary px-6 py-16 text-center shadow-xs ring-1 ring-secondary">
          <FeaturedIcon color="gray" theme="modern" size="lg" icon={LayersThree01} />
          <p className="mt-4 text-md font-semibold text-primary">No visible page sections yet</p>
          <p className="mt-1 max-w-md text-sm text-tertiary">Create or edit a page in the CMS. Once it has visible sections, they’ll appear here as reusable layout references.</p>
          <Link href="/admin/cms" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-brand-solid px-4 text-sm font-semibold text-white hover:brightness-105">Go to CMS pages <ArrowRight className="size-4" /></Link>
        </div>
      ) : (
        Array.from(grouped.entries()).map(([sectionType, entries]) => {
          const PreviewComponent = PREVIEW_COMPONENTS[sectionType];
          const color = TYPE_COLORS[sectionType] ?? "gray";

          return (
            <section key={sectionType} id={`type-${sectionType}`} className="scroll-mt-24">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-brand-primary text-fg-brand-primary"><LayersThree01 className="size-5" /></span>
                <div>
                  <h2 className="text-lg font-semibold text-primary">{prettify(sectionType)} layouts</h2>
                  <p className="text-xs text-tertiary">{entries.length} visible {entries.length === 1 ? "section" : "sections"} on the site</p>
                </div>
              </div>

              {/* Section instances */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {entries.map((entry) => (
                  <div key={entry.section_key} className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
                    {/* Mini preview */}
                    {PreviewComponent && (
                      <div className="border-b border-secondary bg-secondary/50 p-4">
                        <PreviewComponent data={entry.contentSample} />
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-secondary px-5 py-3.5">
                      <div>
                        <h3 className="text-sm font-semibold text-primary">{prettify(entry.section_key)}</h3>
                        <p className="mt-0.5 text-xs text-quaternary">Key: {entry.section_key}</p>
                      </div>
                      <Badge size="sm" color={color} className="whitespace-nowrap">
                        {prettify(entry.section_type)}
                      </Badge>
                    </div>

                    {/* Fields */}
                    {/* Used on */}
                    <div className="space-y-4 px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {entry.usedOn.filter((page) => page.slug).map((page) => (
                          <Link
                            key={page.slug}
                            href={`/admin/cms/${page.slug}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-2 text-xs font-semibold text-brand-secondary ring-1 ring-brand/15 transition-colors hover:bg-brand-primary_hover"
                          >
                            Edit {page.title}
                            <LinkExternal01 className="size-3" />
                          </Link>
                        ))}
                      </div>
                      <details className="group border-t border-secondary pt-3">
                        <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold text-tertiary hover:text-primary">
                          <Settings01 className="size-3.5" />
                          Show content structure ({entry.contentKeys.length} fields)
                          <ChevronDown className="ml-auto size-3.5 transition-transform group-open:rotate-180" />
                        </summary>
                        {entry.contentKeys.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">
                          {entry.contentKeys.map((key) => {
                            const value = entry.contentSample[key];
                            return <span key={key} className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary ring-1 ring-secondary">{prettify(key)}{Array.isArray(value) ? ` · ${value.length} items` : ""}</span>;
                          })}
                        </div>}
                        {entry.contentKeys.filter((key) => Array.isArray(entry.contentSample[key]) && entry.contentSample[key].length > 0).slice(0, 1).map((key) => {
                          const firstItem = entry.contentSample[key][0];
                          const itemKeys = firstItem && typeof firstItem === "object" ? Object.keys(firstItem) : [];
                          return itemKeys.length > 0 ? <div key={key} className="mt-3 flex flex-wrap gap-1.5">{itemKeys.map((itemKey) => <span key={itemKey} className="rounded-md bg-primary px-2 py-1 text-xs text-tertiary ring-1 ring-secondary">Item · {prettify(itemKey)}</span>)}</div> : null;
                        })}
                      </details>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
