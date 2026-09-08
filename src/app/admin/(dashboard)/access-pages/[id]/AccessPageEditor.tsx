"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Copy,
  Eye,
  FileImage,
  FileKey2,
  GripVertical,
  KeyRound,
  LayoutList,
  Link2,
  Loader2,
  MonitorPlay,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import MediaBrowserModal from "@/components/admin/MediaBrowserModal";

type Grant = {
  id: string;
  label: string;
  recipient_hint?: string;
  token_prefix?: string;
  has_password?: boolean;
  expires_at?: string | null;
  revoked_at?: string | null;
  max_views?: number | null;
  view_count?: number;
  last_viewed_at?: string | null;
  created_at?: string;
};

type Settings = {
  schema_version?: number;
  status?: "draft" | "active" | "archived";
  template_key?: string;
  client_name?: string;
  document_title?: string;
  prepared_for?: string;
  prepared_by?: string;
  prepared_date?: string;
  intro?: string;
  hero_image?: string;
  hero_video?: string;
  pdf_url?: string;
  allow_download?: boolean;
  grants?: Grant[];
};

type ProposalItem = { title: string; description: string; value: string };
type SectionContent = {
  eyebrow?: string;
  heading?: string;
  body?: string;
  bullets?: string[];
  items?: ProposalItem[];
  columns?: string[];
  rows?: string[][];
};

type ProposalSection = {
  id?: string;
  section_key: string;
  section_type: string;
  content: SectionContent;
  sort_order?: number;
  is_visible: boolean;
};

type PageData = {
  id: string;
  slug: string;
  title: string;
  updated_at?: string | null;
};

const SECTION_TYPES = [
  { value: "proposal_text", label: "Text & bullets" },
  { value: "proposal_cards", label: "Feature cards" },
  { value: "proposal_table", label: "Table / pricing" },
  { value: "proposal_timeline", label: "Timeline" },
  { value: "proposal_callout", label: "Callout / next steps" },
] as const;

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function newSection(type = "proposal_text"): ProposalSection {
  const suffix = crypto.randomUUID().slice(0, 8);
  const base: ProposalSection = {
    section_key: `section-${suffix}`,
    section_type: type,
    is_visible: true,
    content: { eyebrow: "", heading: "New section", body: "" },
  };
  if (type === "proposal_cards" || type === "proposal_timeline") base.content.items = [{ title: "Item title", description: "Add the supporting detail.", value: "" }];
  if (type === "proposal_table") {
    base.content.columns = ["Item", "Details", "Value"];
    base.content.rows = [["New item", "Add details", "—"]];
  }
  if (type === "proposal_text" || type === "proposal_callout") base.content.bullets = [];
  return base;
}

function statusLabel(grant: Grant) {
  if (grant.revoked_at) return { text: "Revoked", cls: "bg-utility-error-50 text-utility-error-700" };
  if (grant.expires_at && new Date(grant.expires_at) <= new Date()) return { text: "Expired", cls: "bg-utility-warning-50 text-utility-warning-700" };
  if (grant.max_views && Number(grant.view_count || 0) >= grant.max_views) return { text: "Limit reached", cls: "bg-utility-warning-50 text-utility-warning-700" };
  return { text: "Active", cls: "bg-utility-success-50 text-utility-success-700" };
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-secondary">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs leading-5 text-tertiary">{hint}</span>}
    </label>
  );
}

const inputClass = "h-10 w-full rounded-lg border-0 bg-primary px-3 text-sm text-primary outline-none ring-1 ring-secondary placeholder:text-placeholder focus:ring-2 focus:ring-brand";
const textareaClass = "min-h-24 w-full resize-y rounded-lg border-0 bg-primary px-3 py-2.5 text-sm leading-6 text-primary outline-none ring-1 ring-secondary placeholder:text-placeholder focus:ring-2 focus:ring-brand";

export default function AccessPageEditor({
  page,
  settings: initialSettings,
  sections: initialSections,
}: {
  page: PageData;
  settings: Settings;
  sections: ProposalSection[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"content" | "settings" | "sharing">("content");
  const [title, setTitle] = useState(initialSettings.document_title || page.title);
  const [slug, setSlug] = useState(page.slug);
  const [settings, setSettings] = useState<Settings>({ ...initialSettings, grants: initialSettings.grants ?? [] });
  const [sections, setSections] = useState<ProposalSection[]>(initialSections);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [mediaTarget, setMediaTarget] = useState<"hero" | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [newLinkOpen, setNewLinkOpen] = useState(false);
  const [linkLabel, setLinkLabel] = useState("Client access");
  const [recipientHint, setRecipientHint] = useState("");
  const [linkPassword, setLinkPassword] = useState("");
  const [linkExpiry, setLinkExpiry] = useState("");
  const [linkMaxViews, setLinkMaxViews] = useState("");
  const [generated, setGenerated] = useState<{ url: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [linkBusy, setLinkBusy] = useState<string | null>(null);

  const grants = settings.grants ?? [];
  const visibleCount = useMemo(() => sections.filter((section) => section.is_visible).length, [sections]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function patchSettings(patch: Partial<Settings>) {
    setSettings((current) => ({ ...current, ...patch }));
    setDirty(true);
  }

  function patchSection(index: number, patch: Partial<ProposalSection>) {
    setSections((current) => current.map((section, sectionIndex) => sectionIndex === index ? { ...section, ...patch } : section));
    setDirty(true);
  }

  function patchContent(index: number, patch: Partial<SectionContent>) {
    const section = sections[index];
    patchSection(index, { content: { ...section.content, ...patch } });
  }

  function moveSection(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= sections.length) return;
    setSections((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setDirty(true);
  }

  async function save(showConfirmation = true) {
    if (!title.trim() || !slug.trim()) {
      setError("Document title and URL slug are required.");
      return false;
    }
    setSaving(true);
    setError(null);
    setWarning(null);
    try {
      const response = await fetch("/api/admin/access-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          id: page.id,
          slug,
          ...settings,
          document_title: title,
          sections,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save this page.");
      setSlug(result.slug || slug);
      if (Array.isArray(result.sections)) setSections(result.sections);
      if (result.settings) setSettings(result.settings);
      setWarning(typeof result.warning === "string" ? result.warning : null);
      setDirty(false);
      setSavedAt(new Date());
      if (showConfirmation) router.refresh();
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save this page.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function createLink(event: React.FormEvent) {
    event.preventDefault();
    const normalizedPassword = linkPassword.trim();
    if ((settings.status || "draft") !== "active") {
      setError("Choose Active status and save before creating a private link.");
      return;
    }
    if (normalizedPassword && (normalizedPassword.length < 8 || normalizedPassword.length > 200)) {
      setError("Use 8–200 characters for an optional access password.");
      return;
    }
    setLinkBusy("create");
    setError(null);
    try {
      if (dirty && !(await save(false))) return;
      const response = await fetch("/api/admin/access-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_link",
          id: page.id,
          label: linkLabel,
          recipient_hint: recipientHint,
          password: normalizedPassword,
          expires_at: linkExpiry ? new Date(linkExpiry).toISOString() : null,
          max_views: linkMaxViews ? Number(linkMaxViews) : null,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create the private link.");
      setSettings((current) => ({ ...current, grants: [result.grant, ...(current.grants ?? [])] }));
      setGenerated({ url: result.share_url, password: normalizedPassword });
      setNewLinkOpen(false);
      setLinkPassword("");
      setLinkExpiry("");
      setLinkMaxViews("");
      setRecipientHint("");
      setCopied(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create the private link.");
    } finally {
      setLinkBusy(null);
    }
  }

  async function revokeLink(grant: Grant) {
    if (!window.confirm(`Revoke “${grant.label}”? Anyone using that link will immediately lose access.`)) return;
    setLinkBusy(grant.id);
    setError(null);
    try {
      const response = await fetch("/api/admin/access-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke_link", id: page.id, grant_id: grant.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not revoke the link.");
      setSettings((current) => ({ ...current, grants: result.grants }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not revoke the link.");
    } finally {
      setLinkBusy(null);
    }
  }

  async function copyGenerated() {
    if (!generated) return;
    await navigator.clipboard.writeText(generated.url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function uploadPrivatePdf(file: File | undefined) {
    if (!file) return;
    setUploadingPdf(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("page_id", page.id);
      form.set("file", file);
      const response = await fetch("/api/admin/access-pages/upload", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not upload the PDF.");
      patchSettings({ pdf_url: result.pdf_url });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not upload the PDF.");
    } finally {
      setUploadingPdf(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl pb-16">
      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-secondary bg-secondary/95 px-4 pb-4 backdrop-blur md:-mx-6 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 pt-1 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/admin/access-pages" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-tertiary ring-1 ring-secondary hover:text-primary" aria-label="Back to access pages"><ArrowLeft className="size-4" /></Link>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-semibold text-primary">{title || "Untitled access page"}</h1>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${(settings.status || "draft") === "active" ? "bg-utility-success-50 text-utility-success-700" : (settings.status === "archived" ? "bg-utility-gray-100 text-utility-gray-600" : "bg-utility-warning-50 text-utility-warning-700")}`}>{settings.status || "draft"}</span>
              </div>
              <p className="truncate text-xs text-tertiary">/access/{slug} · {visibleCount} visible sections {savedAt ? `· Saved ${savedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {dirty && <span className="hidden text-xs font-medium text-utility-warning-700 sm:inline">Unsaved changes</span>}
            <button type="button" onClick={() => setTab("sharing")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-secondary ring-1 ring-secondary hover:bg-secondary"><KeyRound className="size-4" /> Share</button>
            <button type="button" onClick={() => save()} disabled={saving || !dirty} className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-solid px-4 text-sm font-semibold text-white shadow-xs disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save changes
            </button>
          </div>
        </div>
      </div>

      {error && <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl bg-utility-error-50 px-4 py-3 text-sm text-utility-error-700 ring-1 ring-utility-error-200"><AlertTriangle className="mt-0.5 size-4 shrink-0" />{error}</div>}
      {warning && <div role="status" className="mb-5 flex items-start gap-2 rounded-xl bg-utility-warning-50 px-4 py-3 text-sm text-utility-warning-800 ring-1 ring-utility-warning-200"><AlertTriangle className="mt-0.5 size-4 shrink-0" />{warning}</div>}

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-primary p-1.5 shadow-xs ring-1 ring-secondary">
        {([
          ["content", LayoutList, "Content"],
          ["settings", Settings2, "Page settings"],
          ["sharing", ShieldCheck, `Access & sharing (${grants.length})`],
        ] as const).map(([value, Icon, label]) => (
          <button key={value} type="button" onClick={() => setTab(value)} className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${tab === value ? "bg-brand-primary text-white shadow-xs" : "text-tertiary hover:bg-secondary hover:text-primary"}`}>
            <Icon className="size-4" />{label}
          </button>
        ))}
      </div>

      {tab === "content" && (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary sm:flex-row sm:items-center">
            <div><h2 className="text-base font-semibold text-primary">Proposal sections</h2><p className="mt-0.5 text-sm text-tertiary">Everything below is editable and appears in this order.</p></div>
            <div className="flex flex-wrap gap-2">
              {SECTION_TYPES.map((option) => <button key={option.value} type="button" onClick={() => { setSections((current) => [...current, newSection(option.value)]); setDirty(true); }} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-secondary px-3 text-xs font-semibold text-secondary ring-1 ring-secondary hover:text-brand-secondary"><Plus className="size-3.5" />{option.label}</button>)}
            </div>
          </div>

          {sections.length === 0 && <div className="rounded-2xl border-2 border-dashed border-secondary bg-primary px-6 py-14 text-center"><LayoutList className="mx-auto size-8 text-quaternary" /><p className="mt-3 text-sm font-semibold text-primary">No content sections</p><p className="mt-1 text-sm text-tertiary">Add a text section to begin.</p></div>}

          {sections.map((section, index) => (
            <article key={section.id || section.section_key} className={`overflow-hidden rounded-2xl bg-primary shadow-xs ring-1 ${section.is_visible ? "ring-secondary" : "ring-dashed ring-secondary opacity-75"}`}>
              <header className="flex flex-wrap items-center gap-2 border-b border-secondary bg-secondary px-4 py-3">
                <GripVertical className="size-4 text-quaternary" />
                <span className="flex size-6 items-center justify-center rounded-md bg-primary text-xs font-semibold text-tertiary ring-1 ring-secondary">{index + 1}</span>
                <input aria-label="Section anchor" value={section.section_key} onChange={(event) => patchSection(index, { section_key: slugify(event.target.value) })} className="min-w-32 flex-1 border-0 bg-transparent font-mono text-xs text-tertiary outline-none" />
                <select value={section.section_type} onChange={(event) => patchSection(index, { section_type: event.target.value })} className="h-8 rounded-lg border-0 bg-primary px-2 text-xs font-medium text-secondary outline-none ring-1 ring-secondary">
                  {SECTION_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <button type="button" onClick={() => patchSection(index, { is_visible: !section.is_visible })} className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold ${section.is_visible ? "bg-utility-success-50 text-utility-success-700" : "bg-primary text-tertiary ring-1 ring-secondary"}`}><Eye className="size-3.5" />{section.is_visible ? "Visible" : "Hidden"}</button>
                <button type="button" disabled={index === 0} onClick={() => moveSection(index, -1)} className="flex size-8 items-center justify-center rounded-lg text-tertiary hover:bg-primary hover:text-primary disabled:opacity-30" aria-label="Move section up"><ArrowUp className="size-4" /></button>
                <button type="button" disabled={index === sections.length - 1} onClick={() => moveSection(index, 1)} className="flex size-8 items-center justify-center rounded-lg text-tertiary hover:bg-primary hover:text-primary disabled:opacity-30" aria-label="Move section down"><ArrowDown className="size-4" /></button>
                <button type="button" onClick={() => { setSections((current) => [...current.slice(0, index + 1), { ...section, id: undefined, section_key: `${section.section_key}-${crypto.randomUUID().slice(0, 4)}` }, ...current.slice(index + 1)]); setDirty(true); }} className="flex size-8 items-center justify-center rounded-lg text-tertiary hover:bg-primary hover:text-primary" aria-label="Duplicate section"><Copy className="size-4" /></button>
                <button type="button" onClick={() => { if (window.confirm("Remove this section?")) { setSections((current) => current.filter((_, itemIndex) => itemIndex !== index)); setDirty(true); } }} className="flex size-8 items-center justify-center rounded-lg text-utility-error-600 hover:bg-utility-error-50" aria-label="Remove section"><Trash2 className="size-4" /></button>
              </header>

              <div className="grid gap-4 p-5 md:grid-cols-2">
                <Field label="Eyebrow"><input value={section.content.eyebrow ?? ""} onChange={(event) => patchContent(index, { eyebrow: event.target.value })} placeholder="Executive summary" className={inputClass} /></Field>
                <Field label="Section heading"><input value={section.content.heading ?? ""} onChange={(event) => patchContent(index, { heading: event.target.value })} placeholder="A clear, specific heading" className={inputClass} /></Field>
                <div className="md:col-span-2"><Field label="Body copy"><textarea value={section.content.body ?? ""} onChange={(event) => patchContent(index, { body: event.target.value })} placeholder="Explain the recommendation in plain language…" className={textareaClass} /></Field></div>

                {(section.section_type === "proposal_text" || section.section_type === "proposal_callout") && (
                  <div className="md:col-span-2"><Field label="Bullets" hint="One item per line."><textarea value={(section.content.bullets ?? []).join("\n")} onChange={(event) => patchContent(index, { bullets: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} placeholder={"First point\nSecond point\nThird point"} className={textareaClass} /></Field></div>
                )}

                {(section.section_type === "proposal_cards" || section.section_type === "proposal_timeline") && (
                  <div className="space-y-3 md:col-span-2">
                    <div className="flex items-center justify-between"><p className="text-sm font-medium text-secondary">{section.section_type === "proposal_timeline" ? "Timeline steps" : "Cards"}</p><button type="button" onClick={() => patchContent(index, { items: [...(section.content.items ?? []), { title: "New item", description: "", value: "" }] })} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-secondary"><Plus className="size-3.5" /> Add item</button></div>
                    {(section.content.items ?? []).map((item, itemIndex) => (
                      <div key={itemIndex} className="grid gap-2 rounded-xl bg-secondary p-3 md:grid-cols-[1fr_1fr_1.5fr_auto]">
                        <input aria-label="Item title" value={item.title} onChange={(event) => patchContent(index, { items: (section.content.items ?? []).map((current, currentIndex) => currentIndex === itemIndex ? { ...current, title: event.target.value } : current) })} placeholder="Title" className={inputClass} />
                        <input aria-label="Item label or value" value={item.value} onChange={(event) => patchContent(index, { items: (section.content.items ?? []).map((current, currentIndex) => currentIndex === itemIndex ? { ...current, value: event.target.value } : current) })} placeholder={section.section_type === "proposal_timeline" ? "Week 1" : "Optional value"} className={inputClass} />
                        <input aria-label="Item description" value={item.description} onChange={(event) => patchContent(index, { items: (section.content.items ?? []).map((current, currentIndex) => currentIndex === itemIndex ? { ...current, description: event.target.value } : current) })} placeholder="Description" className={inputClass} />
                        <button type="button" onClick={() => patchContent(index, { items: (section.content.items ?? []).filter((_, currentIndex) => currentIndex !== itemIndex) })} className="flex size-10 items-center justify-center rounded-lg text-utility-error-600 hover:bg-utility-error-50" aria-label="Remove item"><Trash2 className="size-4" /></button>
                      </div>
                    ))}
                  </div>
                )}

                {section.section_type === "proposal_table" && (
                  <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
                    <Field label="Columns" hint="Separate column names with |"><input value={(section.content.columns ?? []).join(" | ")} onChange={(event) => patchContent(index, { columns: event.target.value.split("|").map((item) => item.trim()).filter(Boolean) })} placeholder="Service | Term | Investment" className={inputClass} /></Field>
                    <Field label="Rows" hint="One row per line; separate cells with |"><textarea value={(section.content.rows ?? []).map((row) => row.join(" | ")).join("\n")} onChange={(event) => patchContent(index, { rows: event.target.value.split("\n").filter(Boolean).map((row) => row.split("|").map((cell) => cell.trim())) })} placeholder={"Managed platform | 36 months | $—\nImplementation | One time | $—"} className={textareaClass} /></Field>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === "settings" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-2xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
            <div className="mb-6 flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-brand-primary_alt text-brand-secondary"><Settings2 className="size-5" /></span><div><h2 className="text-base font-semibold text-primary">Page details</h2><p className="text-sm text-tertiary">Client-facing cover copy and media.</p></div></div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Status" hint="Draft and archived pages reject every access link."><select value={settings.status || "draft"} onChange={(event) => patchSettings({ status: event.target.value as Settings["status"] })} className={inputClass}><option value="draft">Draft — nobody can open it</option><option value="active">Active — valid links work</option><option value="archived">Archived — all access stopped</option></select></Field>
              <Field label="Client / organization"><input value={settings.client_name || ""} onChange={(event) => patchSettings({ client_name: event.target.value })} placeholder="Acme Corporation" className={inputClass} /></Field>
              <Field label="Document title"><input required value={title} onChange={(event) => { setTitle(event.target.value); setDirty(true); }} className={inputClass} /></Field>
              <Field label="Private page URL"><div className="flex h-10 items-center rounded-lg bg-secondary px-3 ring-1 ring-secondary focus-within:ring-2 focus-within:ring-brand"><span className="text-sm text-quaternary">/access/</span><input value={slug} onChange={(event) => { setSlug(slugify(event.target.value)); setDirty(true); }} className="min-w-0 flex-1 border-0 bg-transparent text-sm text-primary outline-none" /></div></Field>
              <Field label="Prepared for"><input value={settings.prepared_for || ""} onChange={(event) => patchSettings({ prepared_for: event.target.value })} className={inputClass} /></Field>
              <Field label="Prepared by"><input value={settings.prepared_by || ""} onChange={(event) => patchSettings({ prepared_by: event.target.value })} className={inputClass} /></Field>
              <Field label="Prepared date"><input type="date" value={settings.prepared_date || ""} onChange={(event) => patchSettings({ prepared_date: event.target.value })} className={inputClass} /></Field>
              <div className="md:col-span-2"><Field label="Cover introduction"><textarea value={settings.intro || ""} onChange={(event) => patchSettings({ intro: event.target.value })} placeholder="A concise introduction to the proposal and intended outcome." className={textareaClass} /></Field></div>
              <div className="md:col-span-2"><Field label="Hero image"><div className="flex gap-2"><input value={settings.hero_image || ""} onChange={(event) => patchSettings({ hero_image: event.target.value })} placeholder="Choose an image or paste a URL" className={inputClass} /><button type="button" onClick={() => setMediaTarget("hero")} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-secondary px-3 text-sm font-semibold text-secondary ring-1 ring-secondary"><FileImage className="size-4" /> Browse</button></div></Field></div>
              <div className="md:col-span-2"><Field label="Optional hero video URL" hint="Use a short, muted background clip only when it adds context."><input value={settings.hero_video || ""} onChange={(event) => patchSettings({ hero_video: event.target.value })} placeholder="https://…" className={inputClass} /></Field></div>
              <div className="md:col-span-2"><Field label="Proposal PDF" hint="Private uploads are stored outside the public media library and can only be downloaded through a valid access session."><div className="flex gap-2"><input value={settings.pdf_url || ""} onChange={(event) => patchSettings({ pdf_url: event.target.value })} placeholder="Upload a private PDF or paste a public URL" className={inputClass} /><label className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-secondary px-3 text-sm font-semibold text-secondary ring-1 ring-secondary hover:text-brand-secondary">{uploadingPdf ? <Loader2 className="size-4 animate-spin" /> : <FileKey2 className="size-4" />} {uploadingPdf ? "Uploading…" : "Upload private"}<input type="file" accept="application/pdf,.pdf" disabled={uploadingPdf} onChange={(event) => { void uploadPrivatePdf(event.target.files?.[0]); event.currentTarget.value = ""; }} className="sr-only" /></label></div></Field></div>
              <label className="flex items-start gap-3 rounded-xl bg-secondary p-4 md:col-span-2"><input type="checkbox" checked={settings.allow_download === true} onChange={(event) => patchSettings({ allow_download: event.target.checked })} className="mt-0.5 size-4 accent-[var(--color-brand-600)]" /><span><span className="block text-sm font-semibold text-primary">Show PDF download button</span><span className="mt-0.5 block text-xs leading-5 text-tertiary">The page gate protects the button, but files in Public Media have their own public URL. Use a private storage workflow for highly sensitive files.</span></span></label>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="overflow-hidden rounded-2xl bg-[#07111f] text-white shadow-lg ring-1 ring-white/10">
              <div className="relative min-h-56 bg-cover bg-center p-6" style={settings.hero_image ? { backgroundImage: `linear-gradient(180deg,rgba(3,10,20,.2),rgba(3,10,20,.95)),url(${JSON.stringify(settings.hero_image).slice(1, -1)})` } : { backgroundImage: "radial-gradient(circle at 80% 10%, rgba(14,165,233,.35), transparent 45%)" }}>
                <div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-transparent to-transparent" />
                <div className="relative flex min-h-44 flex-col justify-end"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-sky-300">Prepared for {settings.prepared_for || settings.client_name || "Client"}</p><h3 className="mt-2 text-2xl font-semibold leading-tight">{title || "Proposal title"}</h3><p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-300">{settings.intro || "Add a short introduction to preview the cover."}</p></div>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-[11px] text-slate-400"><span>{settings.prepared_by || "International Computer Exchange"}</span><span>{settings.prepared_date || "Date"}</span></div>
            </div>
            <div className="rounded-xl bg-utility-warning-50 p-4 text-xs leading-5 text-utility-warning-800 ring-1 ring-utility-warning-200"><strong className="block text-sm">Private by default</strong>The CMS record always remains unpublished. Changing the status here controls server-validated access; it never publishes through the public CMS.</div>
          </aside>
        </div>
      )}

      {tab === "sharing" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl bg-primary shadow-xs ring-1 ring-secondary">
            <header className="flex flex-col justify-between gap-3 border-b border-secondary p-5 sm:flex-row sm:items-center">
              <div><h2 className="text-base font-semibold text-primary">Private access links</h2><p className="mt-0.5 text-sm text-tertiary">Create a separate revocable link for each recipient or group.</p></div>
              <button type="button" disabled={(settings.status || "draft") !== "active"} onClick={() => setNewLinkOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-solid px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Plus className="size-4" /> Create private link</button>
            </header>
            {(settings.status || "draft") !== "active" && <div className="m-5 rounded-xl bg-utility-warning-50 p-4 text-sm text-utility-warning-800 ring-1 ring-utility-warning-200"><strong>Activate and save this page first.</strong> Draft or archived pages reject every link, including previously issued links.</div>}
            {grants.length === 0 ? (
              <div className="px-6 py-16 text-center"><Link2 className="mx-auto size-9 text-quaternary" /><h3 className="mt-3 text-sm font-semibold text-primary">No access links yet</h3><p className="mx-auto mt-1 max-w-sm text-sm text-tertiary">Create one after the page is active. The full secret link is shown only once.</p></div>
            ) : (
              <div className="divide-y divide-secondary">
                {grants.map((grant) => {
                  const state = statusLabel(grant);
                  return <div key={grant.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-semibold text-primary">{grant.label}</p><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${state.cls}`}>{state.text}</span>{grant.has_password && <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-tertiary">Password</span>}</div><p className="mt-1 text-xs text-tertiary">{grant.recipient_hint || "No recipient note"} · key {grant.token_prefix || "hidden"}…</p><p className="mt-1 text-[11px] text-quaternary">{Number(grant.view_count || 0)} opens{grant.max_views ? ` of ${grant.max_views}` : ""}{grant.expires_at ? ` · Expires ${new Date(grant.expires_at).toLocaleString()}` : " · No expiration"}{grant.last_viewed_at ? ` · Last ${new Date(grant.last_viewed_at).toLocaleString()}` : ""}</p></div>{!grant.revoked_at && <button type="button" disabled={Boolean(linkBusy)} onClick={() => revokeLink(grant)} className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-utility-error-600 ring-1 ring-utility-error-200 hover:bg-utility-error-50 disabled:opacity-50">{linkBusy === grant.id ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />} Revoke</button>}</div>;
                })}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-primary p-5 shadow-xs ring-1 ring-secondary"><ShieldCheck className="size-6 text-brand-secondary" /><h3 className="mt-3 text-sm font-semibold text-primary">How access works</h3><ol className="mt-3 space-y-3 text-xs leading-5 text-tertiary"><li className="flex gap-2"><span className="font-semibold text-brand-secondary">1.</span>A random secret is included in the first link only.</li><li className="flex gap-2"><span className="font-semibold text-brand-secondary">2.</span>Only its one-way hash is stored in the CMS.</li><li className="flex gap-2"><span className="font-semibold text-brand-secondary">3.</span>The server checks status, expiry, view limit, revocation, and optional password.</li><li className="flex gap-2"><span className="font-semibold text-brand-secondary">4.</span>A short-lived signed, HttpOnly session keeps the clean page URL open.</li></ol></div>
            <div className="rounded-xl bg-secondary p-4 ring-1 ring-secondary"><p className="text-xs font-semibold uppercase tracking-wider text-quaternary">Good practice</p><p className="mt-2 text-sm leading-6 text-secondary">Make one link per recipient. Add an expiration for proposals, and revoke the link when the engagement ends.</p></div>
          </aside>
        </div>
      )}

      <MediaBrowserModal open={mediaTarget !== null} onClose={() => setMediaTarget(null)} onSelect={(url) => { patchSettings({ hero_image: url }); setMediaTarget(null); }} accept="image/*" title="Choose hero image" />

      {newLinkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !linkBusy && setNewLinkOpen(false)}>
          <form onSubmit={createLink} role="dialog" aria-modal="true" aria-labelledby="new-link-title" className="w-full max-w-lg rounded-2xl bg-primary p-6 shadow-2xl ring-1 ring-secondary">
            <div className="flex items-start justify-between"><div className="flex gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-brand-primary_alt text-brand-secondary"><KeyRound className="size-5" /></span><div><h2 id="new-link-title" className="text-lg font-semibold text-primary">Create private link</h2><p className="mt-0.5 text-sm text-tertiary">Tailor access for one recipient or group.</p></div></div><button type="button" onClick={() => setNewLinkOpen(false)} className="rounded-lg p-2 text-quaternary hover:bg-secondary" aria-label="Close"><X className="size-4" /></button></div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2"><Field label="Link label"><input required value={linkLabel} onChange={(event) => setLinkLabel(event.target.value)} placeholder="Client leadership" className={inputClass} /></Field></div>
              <div className="md:col-span-2"><Field label="Recipient note" hint="This note is visible only to admins."><input value={recipientHint} onChange={(event) => setRecipientHint(event.target.value)} placeholder="Sent to Jane and the infrastructure team" className={inputClass} /></Field></div>
              <Field label="Optional password" hint="8–200 characters. Send it separately."><input type="password" value={linkPassword} maxLength={200} onChange={(event) => setLinkPassword(event.target.value)} autoComplete="new-password" placeholder="Leave blank for link-only access" className={inputClass} /></Field>
              <Field label="Expiration"><input type="datetime-local" value={linkExpiry} min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)} onChange={(event) => setLinkExpiry(event.target.value)} className={inputClass} /></Field>
              <Field label="Maximum opens" hint="Blank means unlimited."><input type="number" min="1" step="1" value={linkMaxViews} onChange={(event) => setLinkMaxViews(event.target.value)} placeholder="Unlimited" className={inputClass} /></Field>
            </div>
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setNewLinkOpen(false)} className="h-10 rounded-lg px-4 text-sm font-semibold text-secondary ring-1 ring-secondary">Cancel</button><button type="submit" disabled={Boolean(linkBusy)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-solid px-4 text-sm font-semibold text-white disabled:opacity-60">{linkBusy === "create" && <Loader2 className="size-4 animate-spin" />} Create link</button></div>
          </form>
        </div>
      )}

      {generated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="generated-link-title" className="w-full max-w-xl rounded-2xl bg-primary p-6 shadow-2xl ring-1 ring-secondary">
            <div className="flex size-11 items-center justify-center rounded-full bg-utility-success-50 text-utility-success-600"><Check className="size-5" /></div>
            <h2 id="generated-link-title" className="mt-4 text-lg font-semibold text-primary">Private link created</h2>
            <p className="mt-1 text-sm leading-6 text-tertiary">Copy it now. For security, the complete secret is not stored and cannot be shown again.</p>
            <div className="mt-5 flex gap-2"><input readOnly value={generated.url} onFocus={(event) => event.currentTarget.select()} className={`${inputClass} font-mono text-xs`} /><button type="button" onClick={copyGenerated} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-brand-solid px-4 text-sm font-semibold text-white">{copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? "Copied" : "Copy"}</button></div>
            {generated.password && <div className="mt-4 rounded-xl bg-utility-warning-50 p-4 text-sm text-utility-warning-800 ring-1 ring-utility-warning-200"><strong>Password reminder:</strong> <code className="ml-1 rounded bg-white/60 px-1.5 py-0.5">{generated.password}</code><p className="mt-1 text-xs">Send the password through a different channel from the link.</p></div>}
            <div className="mt-6 flex justify-end gap-2"><a href={generated.url} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-secondary ring-1 ring-secondary"><MonitorPlay className="size-4" /> Test link</a><button type="button" onClick={() => setGenerated(null)} className="h-10 rounded-lg bg-brand-solid px-4 text-sm font-semibold text-white">Done</button></div>
          </section>
        </div>
      )}
    </div>
  );
}
