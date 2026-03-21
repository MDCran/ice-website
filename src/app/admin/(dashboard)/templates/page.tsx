import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Layers, ExternalLink, Settings, FileText, LayoutGrid, CheckCircle, ArrowRight, ChevronDown, Star, MapPin, Phone, Mail, Clock } from "lucide-react";

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

const TYPE_COLORS: Record<string, string> = {
  hero: "bg-sky-500/10 text-sky-400",
  content: "bg-emerald-500/10 text-emerald-400",
  features: "bg-purple-500/10 text-purple-400",
  process: "bg-blue-500/10 text-blue-400",
  benefits: "bg-cyan-500/10 text-cyan-400",
  stats: "bg-teal-500/10 text-teal-400",
  metrics: "bg-teal-500/10 text-teal-400",
  cta: "bg-amber-500/10 text-amber-400",
  faq: "bg-indigo-500/10 text-indigo-400",
  gallery: "bg-orange-500/10 text-orange-400",
  timeline: "bg-violet-500/10 text-violet-400",
  partners: "bg-pink-500/10 text-pink-400",
  industries: "bg-rose-500/10 text-rose-400",
  contact: "bg-sky-500/10 text-sky-400",
  form: "bg-emerald-500/10 text-emerald-400",
};

/* ═══════════════════════════════════════════════════════════════════════════
   VISUAL PREVIEW MOCKUPS — miniature dark-themed renderings of each type
   ═══════════════════════════════════════════════════════════════════════════ */

function HeroPreview({ data }: { data?: Record<string, any> }) {
  const heading = data?.heading ?? data?.title ?? "Page Heading";
  const sub = data?.subheading ?? data?.description ?? "Subheading text goes here";
  const cta = data?.cta_text ?? "Get Started";
  return (
    <div className="rounded-xl overflow-hidden bg-gradient-to-b from-[#0a1628] to-[#020617] p-6 text-center relative">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(4,155,251,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(4,155,251,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
      <div className="relative">
        <div className="text-sm font-bold text-white mb-1">{heading}</div>
        <div className="text-[9px] text-slate-500 mb-3 max-w-[250px] mx-auto line-clamp-2">{sub}</div>
        <div className="flex justify-center gap-2">
          <div className="px-2.5 py-1 rounded-md bg-gradient-to-r from-sky-500 to-blue-600 text-[8px] text-white font-medium">{cta}</div>
          <div className="px-2.5 py-1 rounded-md border border-sky-500/30 text-[8px] text-sky-400 font-medium">Learn More</div>
        </div>
      </div>
    </div>
  );
}

function ContentPreview({ data }: { data?: Record<string, any> }) {
  const heading = data?.heading ?? data?.title ?? "Content Block";
  const body = data?.description ?? data?.content ?? "";
  return (
    <div className="rounded-xl bg-[#020617] p-4">
      <div className="flex gap-4 items-center">
        <div className="w-20 h-14 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-500/20 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="text-xs font-bold text-white">{heading}</div>
          {body ? (
            <div className="text-[9px] text-slate-500 line-clamp-3 leading-relaxed">{String(body).slice(0, 150)}</div>
          ) : (
            <>
              <div className="h-1.5 bg-slate-700/50 rounded w-full" />
              <div className="h-1.5 bg-slate-700/50 rounded w-4/5" />
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
    <div className="rounded-xl bg-[#020617] p-4">
      {heading && <div className="text-xs font-bold text-white text-center mb-3">{heading}</div>}
      <div className="grid grid-cols-3 gap-2">
        {(items.length > 0 ? items.slice(0, 3) : [1, 2, 3]).map((item: any, i: number) => (
          <div key={i} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
            <div className="w-6 h-6 rounded-md bg-sky-400/10 mx-auto mb-1.5 flex items-center justify-center">
              <Star size={10} className="text-sky-400" />
            </div>
            {typeof item === "object" && item?.title ? (
              <>
                <div className="text-[9px] font-semibold text-white truncate">{item.title}</div>
                {item.description && <div className="text-[7px] text-slate-500 line-clamp-2 mt-0.5">{item.description}</div>}
              </>
            ) : (
              <>
                <div className="h-1.5 bg-slate-700/50 rounded w-4/5 mx-auto mb-1" />
                <div className="h-1 bg-slate-800/50 rounded w-full" />
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
    <div className="rounded-xl bg-[#020617] p-4">
      <div className={`grid grid-cols-${Math.min(display.length, 4)} gap-2`}>
        {display.map((item: any, i: number) => (
          <div key={i} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
            <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">{item.value ?? item.suffix ? `${item.value}${item.suffix ?? ""}` : item.value}</div>
            <div className="text-[8px] text-slate-500 mt-0.5 truncate">{item.label ?? ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqPreview({ data }: { data?: Record<string, any> }) {
  const items = data?.items ?? data?.faqs ?? [];
  return (
    <div className="rounded-xl bg-[#020617] p-4 space-y-1.5">
      <div className="text-xs font-bold text-white text-center mb-2">Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Questions</span></div>
      {(items.length > 0 ? items.slice(0, 3) : [1, 2, 3]).map((item: any, i: number) => (
        <div key={i} className="rounded-lg bg-white/[0.03] border-l-2 border-l-sky-500/50 border border-white/[0.06] px-3 py-2 flex items-center justify-between">
          {typeof item === "object" && item?.question ? (
            <span className="text-[9px] text-slate-300 truncate pr-2">{item.question}</span>
          ) : (
            <div className="h-1.5 bg-slate-600/50 rounded w-3/5" />
          )}
          <ChevronDown size={10} className="text-sky-400 shrink-0" />
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
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-blue-500/5" />
      <div className="relative">
        <div className="text-xs font-bold text-white mb-1">{heading}</div>
        {desc ? <div className="text-[8px] text-slate-500 mb-3 max-w-[200px] mx-auto line-clamp-2">{desc}</div> : <div className="h-1.5 bg-slate-700/50 rounded w-3/5 mx-auto mb-3" />}
        <div className="flex justify-center gap-2">
          <div className="px-3 py-1 rounded-md bg-gradient-to-r from-sky-500 to-blue-600 text-[8px] text-white font-medium flex items-center gap-1">{cta} <ArrowRight size={8} /></div>
        </div>
      </div>
    </div>
  );
}

function ProcessPreview({ data }: { data?: Record<string, any> }) {
  return (
    <div className="rounded-xl bg-[#020617] p-4">
      <div className="flex items-start gap-3">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex-1 text-center">
            <div className="w-6 h-6 rounded-full bg-sky-400/10 border border-sky-400/30 mx-auto mb-1.5 flex items-center justify-center text-[8px] text-sky-400 font-bold">{step}</div>
            <div className="h-1.5 bg-slate-700/50 rounded w-4/5 mx-auto mb-0.5" />
            <div className="h-1 bg-slate-800/50 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function BenefitsPreview({ data }: { data?: Record<string, any> }) {
  return (
    <div className="rounded-xl bg-[#020617] p-4 space-y-1.5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <CheckCircle size={10} className="text-sky-400 shrink-0" />
          <div className="h-1.5 bg-slate-700/50 rounded flex-1" />
        </div>
      ))}
    </div>
  );
}

function MetricsPreview({ data }: { data?: Record<string, any> }) {
  return (
    <div className="rounded-xl bg-[#020617] p-4">
      <div className="grid grid-cols-3 gap-3">
        {["99.9%", "< 4hr", "24/7"].map((val) => (
          <div key={val} className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-sky-400/40 mx-auto mb-1.5 flex items-center justify-center">
              <span className="text-[9px] font-bold text-sky-400">{val}</span>
            </div>
            <div className="h-1 bg-slate-700/50 rounded w-4/5 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryPreview({ data }: { data?: Record<string, any> }) {
  return (
    <div className="rounded-xl bg-[#020617] p-4">
      <div className="flex gap-3 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-16 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] shrink-0 flex items-center justify-center">
            <div className="w-10 h-4 rounded bg-slate-700/40" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelinePreview({ data }: { data?: Record<string, any> }) {
  return (
    <div className="rounded-xl bg-[#020617] p-4">
      <div className="space-y-2 relative pl-5">
        <div className="absolute left-[7px] top-1 bottom-1 w-px bg-sky-400/20" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-2 relative">
            <div className="absolute left-[-14px] top-1 w-2 h-2 rounded-full bg-sky-400 border-2 border-[#020617]" />
            <div className="flex-1">
              <div className="h-1.5 bg-slate-600/50 rounded w-1/3 mb-1" />
              <div className="h-1 bg-slate-800/50 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PartnersPreview({ data }: { data?: Record<string, any> }) {
  return (
    <div className="rounded-xl bg-[#020617] p-4">
      <div className="grid grid-cols-2 gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 flex items-start gap-2">
            <div className="w-8 h-8 rounded-md bg-white/[0.06] border border-white/[0.08] shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 bg-slate-600/50 rounded w-2/3" />
              <div className="h-1 bg-slate-800/50 rounded w-full" />
              <div className="flex gap-1 mt-1">
                <div className="h-2.5 rounded-full bg-white/[0.04] border border-white/[0.06] px-1.5" />
                <div className="h-2.5 rounded-full bg-white/[0.04] border border-white/[0.06] px-1.5" />
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
    <div className="rounded-xl bg-[#020617] p-4">
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
            <div className="w-6 h-6 rounded-md bg-sky-400/10 mx-auto mb-1.5" />
            <div className="h-1.5 bg-slate-600/50 rounded w-4/5 mx-auto mb-1" />
            <div className="h-1 bg-slate-800/50 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactPreview({ data }: { data?: Record<string, any> }) {
  return (
    <div className="rounded-xl bg-[#020617] p-4">
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: MapPin, label: "Address" },
          { icon: Phone, label: "Phone" },
          { icon: Mail, label: "Email" },
          { icon: Clock, label: "Hours" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-sky-400/10 flex items-center justify-center shrink-0">
              <Icon size={8} className="text-sky-400" />
            </div>
            <div className="flex-1">
              <div className="text-[7px] text-slate-500 uppercase">{label}</div>
              <div className="h-1.5 bg-slate-700/50 rounded w-4/5 mt-0.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormPreview({ data }: { data?: Record<string, any> }) {
  return (
    <div className="rounded-xl bg-[#020617] p-4 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="h-6 rounded-md bg-white/[0.04] border border-white/[0.08]" />
        <div className="h-6 rounded-md bg-white/[0.04] border border-white/[0.08]" />
      </div>
      <div className="h-6 rounded-md bg-white/[0.04] border border-white/[0.08]" />
      <div className="h-12 rounded-md bg-white/[0.04] border border-white/[0.08]" />
      <div className="h-6 rounded-md bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center">
        <div className="text-[8px] text-white font-medium">Send Message</div>
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
          <h1 className="text-2xl font-bold admin-text">Section Templates</h1>
          <p className="text-sm admin-text-muted mt-1">
            Visual previews of every section type. See how each renders on the site.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs admin-text-dimmed">
          <LayoutGrid size={14} />
          {Array.from(grouped.values()).reduce((sum, entries) => sum + entries.length, 0)} sections across {grouped.size} types
        </div>
      </div>

      {grouped.size === 0 ? (
        <div className="admin-card rounded-2xl p-12 text-center">
          <Layers size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 text-lg mb-2">No sections found</p>
          <p className="text-slate-500 text-sm">Create pages with sections in the CMS editor to see templates here.</p>
        </div>
      ) : (
        Array.from(grouped.entries()).map(([sectionType, entries]) => {
          const PreviewComponent = PREVIEW_COMPONENTS[sectionType];
          const color = TYPE_COLORS[sectionType] ?? "bg-slate-500/10 text-slate-400";

          return (
            <div key={sectionType} id={`type-${sectionType}`} className="scroll-mt-24">
              {/* Type header */}
              <div className="flex items-center gap-3 mb-5">
                <Layers size={18} className="text-sky-400" />
                <h2 className="text-lg font-semibold admin-text">{prettify(sectionType)}</h2>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${color}`}>{entries.length} in use</span>
              </div>

              {/* Visual preview mockup */}
              {PreviewComponent && (
                <div className="mb-5 admin-card rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500/60" />
                      <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
                    </div>
                    <span className="text-[9px] admin-text-dimmed font-mono ml-2">icesales.com — {prettify(sectionType)} Section</span>
                  </div>
                  <div className="p-4">
                    <PreviewComponent data={entries[0]?.contentSample} />
                  </div>
                </div>
              )}

              {/* Section instances */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {entries.map((entry) => (
                  <div key={entry.section_key} className="admin-card rounded-xl overflow-hidden">
                    {/* Mini preview */}
                    {PreviewComponent && (
                      <div className="px-4 py-3 border-b border-white/5 bg-[#020617]/50">
                        <div className="transform scale-[0.65] origin-top-left" style={{ width: "153.8%", marginBottom: "-35%" }}>
                          <PreviewComponent data={entry.contentSample} />
                        </div>
                      </div>
                    )}

                    {/* Header */}
                    <div className="px-5 py-3.5 border-b border-white/5 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold admin-text">{prettify(entry.section_key)}</h3>
                        <p className="text-[10px] admin-text-dimmed font-mono mt-0.5">section_key: {entry.section_key}</p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${color}`}>
                        {prettify(entry.section_type)}
                      </span>
                    </div>

                    {/* Fields */}
                    {entry.contentKeys.length > 0 && (
                      <div className="px-5 py-3 border-b border-white/5">
                        <p className="text-[10px] font-medium admin-text-dimmed uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Settings size={10} />
                          Fields ({entry.contentKeys.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {entry.contentKeys.map((k) => {
                            const value = entry.contentSample[k];
                            const isArray = Array.isArray(value);
                            return (
                              <span key={k} className={`text-[10px] font-mono rounded px-1.5 py-0.5 ${isArray ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" : "bg-white/[0.04] border border-white/[0.06] admin-text-muted"}`}>
                                {k}{isArray ? `[${value.length}]` : ""}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Array item structure */}
                    {entry.contentKeys.some((k) => Array.isArray(entry.contentSample[k]) && entry.contentSample[k].length > 0) && (
                      <div className="px-5 py-3 border-b border-white/5">
                        <p className="text-[10px] font-medium admin-text-dimmed uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FileText size={10} />
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
                                  <span key={ik} className="text-[10px] font-mono bg-white/[0.04] border border-white/[0.06] rounded px-1.5 py-0.5 admin-text-muted">
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
                            className="text-[10px] bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 rounded-full px-2.5 py-0.5 transition-colors inline-flex items-center gap-1"
                          >
                            {page.title}
                            <ExternalLink size={8} />
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
