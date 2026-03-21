"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Loader2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Pencil,
  FileText,
  Layers,
  ExternalLink,
  Monitor,
  Image as ImageIcon,
} from "lucide-react";
import MediaBrowserModal from "@/components/admin/MediaBrowserModal";

/* ═══════════════════════════════════════════════════════════════════════ */

interface PageMeta {
  id: string;
  title: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  page_type: string;
  is_published: boolean;
}

interface Section {
  id: string;
  section_key: string;
  section_type: string;
  content: Record<string, any>;
  sort_order: number;
  is_visible: boolean;
  _isNew?: boolean;
  _deleted?: boolean;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

const SECTION_TYPES = [
  { value: "hero", label: "Hero Banner" },
  { value: "content", label: "Content Block" },
  { value: "features", label: "Features Grid" },
  { value: "process", label: "Process / Steps" },
  { value: "benefits", label: "Benefits List" },
  { value: "stats", label: "Statistics" },
  { value: "metrics", label: "Metrics / Gauges" },
  { value: "cta", label: "Call to Action" },
  { value: "faq", label: "FAQ Accordion" },
  { value: "gallery", label: "Gallery / Logos" },
  { value: "timeline", label: "Timeline" },
  { value: "partners", label: "Partners Grid" },
  { value: "industries", label: "Industries" },
  { value: "contact", label: "Contact Info" },
  { value: "form", label: "Form / Options" },
];

const TYPE_COLORS: Record<string, string> = {
  hero: "bg-sky-500/15 text-sky-400",
  content: "bg-emerald-500/15 text-emerald-400",
  features: "bg-purple-500/15 text-purple-400",
  process: "bg-blue-500/15 text-blue-400",
  benefits: "bg-cyan-500/15 text-cyan-400",
  stats: "bg-teal-500/15 text-teal-400",
  metrics: "bg-teal-500/15 text-teal-400",
  cta: "bg-amber-500/15 text-amber-400",
  faq: "bg-indigo-500/15 text-indigo-400",
  gallery: "bg-orange-500/15 text-orange-400",
  timeline: "bg-violet-500/15 text-violet-400",
  partners: "bg-pink-500/15 text-pink-400",
  industries: "bg-rose-500/15 text-rose-400",
  contact: "bg-sky-500/15 text-sky-400",
  form: "bg-slate-500/15 text-slate-400",
};

/** Convert section_key like "services_grid" to "Services Grid" */
function prettifyKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getTypeLabel(value: string): string {
  return SECTION_TYPES.find((t) => t.value === value)?.label ?? value;
}

/** Check if a field key is likely a media/image URL field */
const MEDIA_KEY_PATTERNS = ["image", "logo", "avatar", "background", "banner", "icon_url", "photo", "thumbnail", "cover", "poster", "src"];
function isMediaKey(key: string): boolean {
  const lower = key.toLowerCase();
  return MEDIA_KEY_PATTERNS.some((p) => lower.includes(p));
}

/* ═══════════════════════════════════════════════════════════════════════ */

export default function CMSPageEditor({
  page,
  initialSections,
}: {
  page: PageMeta;
  initialSections: Section[];
}) {
  const router = useRouter();
  const supabase = createClient();

  // Page meta
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [metaTitle, setMetaTitle] = useState(page.meta_title ?? "");
  const [metaDesc, setMetaDesc] = useState(page.meta_description ?? "");
  const [isPublished, setIsPublished] = useState(page.is_published);

  // Sections
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState("content");

  // Preview
  const [showPreview, setShowPreview] = useState(false);

  const active = sections.filter((s) => !s._deleted).sort((a, b) => a.sort_order - b.sort_order);

  const dirty = () => { if (saveStatus === "saved") setSaveStatus("idle"); };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const updateSection = (id: string, field: keyof Section, value: unknown) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    dirty();
  };

  const updateContent = (id: string, content: Record<string, any>) => {
    updateSection(id, "content", content);
  };

  const deleteSection = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, _deleted: true } : s)));
    dirty();
  };

  const moveSection = (idx: number, dir: "up" | "down") => {
    const t = dir === "up" ? idx - 1 : idx + 1;
    if (t < 0 || t >= active.length) return;
    const a = active[idx], b = active[t];
    setSections((prev) => prev.map((s) => {
      if (s.id === a.id) return { ...s, sort_order: b.sort_order };
      if (s.id === b.id) return { ...s, sort_order: a.sort_order };
      return s;
    }));
    dirty();
  };

  const addSection = () => {
    if (!newKey.trim()) return;
    const maxOrder = active.reduce((max, s) => Math.max(max, s.sort_order), -1);
    setSections((prev) => [...prev, {
      id: `new_${Date.now()}`,
      section_key: newKey.trim().toLowerCase().replace(/\s+/g, "_"),
      section_type: newType,
      content: {},
      sort_order: maxOrder + 1,
      is_visible: true,
      _isNew: true,
    }]);
    setNewKey("");
    setNewType("content");
    setAddOpen(false);
    dirty();
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    setErrorMsg("");
    try {
      const { error: pageErr } = await supabase.from("pages").update({
        title: title.trim(), slug: slug.trim(),
        meta_title: metaTitle.trim() || null,
        meta_description: metaDesc.trim() || null, is_published: isPublished,
        updated_at: new Date().toISOString(),
      }).eq("id", page.id);
      if (pageErr) throw pageErr;

      for (const s of sections.filter((s) => s._deleted && !s._isNew)) {
        const { error } = await supabase.from("page_sections").delete().eq("id", s.id);
        if (error) throw error;
      }
      for (const s of sections.filter((s) => s._isNew && !s._deleted)) {
        const { error } = await supabase.from("page_sections").insert({
          page_id: page.id, section_key: s.section_key, section_type: s.section_type,
          content: s.content, sort_order: s.sort_order, is_visible: s.is_visible,
        });
        if (error) throw error;
      }
      for (const s of sections.filter((s) => !s._isNew && !s._deleted)) {
        const { error } = await supabase.from("page_sections").update({
          section_key: s.section_key, section_type: s.section_type, content: s.content,
          sort_order: s.sort_order, is_visible: s.is_visible, updated_at: new Date().toISOString(),
        }).eq("id", s.id);
        if (error) throw error;
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
      router.refresh();
    } catch (err: unknown) {
      setSaveStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Save failed");
    }
  };

  const previewUrl = page.page_type === "solution"
    ? `/solutions/${slug}`
    : slug === "home" ? "/" : `/${slug}`;

  const inputCls = "w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 admin-text text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all";

  /* ═══ RENDER ═══ */

  return (
    <div className={showPreview ? "flex gap-6" : ""}>
      {/* ── Editor Panel ── */}
      <div className={showPreview ? "w-1/2 min-w-0 space-y-5" : "space-y-5"}>

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
              <FileText size={18} className="text-sky-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold admin-text truncate">{title}</h1>
              <p className="text-xs text-slate-500 font-mono">/{slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                showPreview ? "bg-sky-500/15 text-sky-400" : "bg-white/[0.06] text-slate-400 hover:text-white hover:bg-white/10"
              }`}
              title="Toggle preview"
            >
              <Monitor size={14} />
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saveStatus === "saving" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save"}
            </button>
          </div>
        </div>

        {/* Status */}
        {saveStatus === "error" && errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {/* Page Settings */}
        <details className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden group" open>
          <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors list-none">
            <div className="flex items-center gap-3">
              <Pencil size={15} className="text-slate-400" />
              <span className="admin-text font-medium text-sm">Page Settings</span>
            </div>
            <svg className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="border-t border-white/10 p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Title</label>
                <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); dirty(); }} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Slug</label>
                <input type="text" value={slug} onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/[^\w-]/g, "")); dirty(); }} className={`${inputCls} font-mono`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Meta Title</label>
                <input type="text" value={metaTitle} onChange={(e) => { setMetaTitle(e.target.value); dirty(); }} placeholder="SEO title" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Meta Description</label>
              <textarea value={metaDesc} onChange={(e) => { setMetaDesc(e.target.value); dirty(); }} rows={2} placeholder="SEO description" className={`${inputCls} resize-none`} />
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => { setIsPublished(!isPublished); dirty(); }} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${isPublished ? "bg-emerald-500" : "bg-white/10"}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isPublished ? "translate-x-5" : ""}`} />
              </button>
              <span className="text-sm text-slate-300">{isPublished ? "Published" : "Draft"}</span>
            </div>
          </div>
        </details>

        {/* Sections */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold admin-text flex items-center gap-2">
            <Layers size={16} className="text-slate-400" />
            Sections ({active.length})
          </h2>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Plus size={14} /> Add Section
          </button>
        </div>

        {active.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-10 text-center">
            <Layers size={40} className="mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400 mb-1">No sections yet</p>
            <p className="text-slate-500 text-sm">Add a section to start building this page.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {active.map((section, idx) => {
              const isExpanded = expandedIds.has(section.id);
              const colorClass = TYPE_COLORS[section.section_type] ?? TYPE_COLORS.custom;

              return (
                <div key={section.id} className={`border rounded-2xl overflow-hidden transition-colors ${
                  section.is_visible
                    ? "bg-white/[0.03] border-white/10"
                    : "bg-white/[0.01] border-white/[0.05] opacity-60"
                }`}>
                  {/* Section header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() => toggleExpand(section.id)}
                  >
                    {/* Reorder (stop propagation so clicking arrows doesn't toggle) */}
                    <div className="flex flex-col gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => moveSection(idx, "up")} disabled={idx === 0} className="text-slate-600 hover:text-white disabled:opacity-20 cursor-pointer p-0.5"><ArrowUp size={11} /></button>
                      <button onClick={() => moveSection(idx, "down")} disabled={idx === active.length - 1} className="text-slate-600 hover:text-white disabled:opacity-20 cursor-pointer p-0.5"><ArrowDown size={11} /></button>
                    </div>

                    {/* Name + type */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="admin-text font-medium text-sm truncate">{prettifyKey(section.section_key)}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${colorClass}`}>
                          {getTypeLabel(section.section_type)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-mono">{section.section_key}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => updateSection(section.id, "is_visible", !section.is_visible)} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${section.is_visible ? "text-emerald-400 hover:bg-emerald-500/10" : "text-slate-500 hover:bg-white/10"}`}>
                        {section.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button onClick={() => deleteSection(section.id)} className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                      <ChevronDown size={14} className={`text-slate-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-white/10 p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Section Key</label>
                          <input type="text" value={section.section_key} onChange={(e) => updateSection(section.id, "section_key", e.target.value)} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Type</label>
                          <select value={section.section_type} onChange={(e) => updateSection(section.id, "section_type", e.target.value)} className={inputCls}>
                            {SECTION_TYPES.map((t) => <option key={t.value} value={t.value} className="bg-slate-900">{t.label}</option>)}
                          </select>
                        </div>
                      </div>

                      <ContentEditor
                        content={section.content}
                        onChange={(c) => updateContent(section.id, c)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Section Modal */}
        {addOpen && (
          <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setAddOpen(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-lg font-bold admin-text mb-4">Add Section</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Section Name</label>
                    <input
                      type="text"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="e.g. Hero Banner, Features, Call to Action"
                      className={inputCls}
                    />
                    {newKey && (
                      <p className="text-[10px] text-slate-600 mt-1 font-mono">
                        Key: {newKey.toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "")}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Section Type</label>
                    <select value={newType} onChange={(e) => setNewType(e.target.value)} className={inputCls}>
                      {SECTION_TYPES.map((t) => <option key={t.value} value={t.value} className="bg-slate-900">{t.label}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={addSection} disabled={!newKey.trim()} className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer">Add Section</button>
                    <button onClick={() => setAddOpen(false)} className="px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-slate-400 hover:text-white text-sm transition-colors cursor-pointer">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Preview Panel ── */}
      {showPreview && (
        <div className="w-1/2 shrink-0 sticky top-0 h-[calc(100vh-8rem)]">
          <div className="h-full bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Monitor size={14} className="text-slate-400" />
                <span className="text-xs text-slate-400 font-medium">Live Preview</span>
              </div>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-sky-400 hover:text-sky-300 cursor-pointer flex items-center gap-1"
              >
                Open in new tab <ExternalLink size={10} />
              </a>
            </div>
            <div className="flex-1 bg-white">
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title="Page Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CONTENT EDITOR
   ═══════════════════════════════════════════════════════════════════════ */

function ContentEditor({ content, onChange }: { content: Record<string, any>; onChange: (c: Record<string, any>) => void }) {
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState(JSON.stringify(content, null, 2));
  const [jsonValid, setJsonValid] = useState(true);

  const toggleJson = () => {
    if (jsonMode) {
      try { const parsed = JSON.parse(jsonText); onChange(parsed); setJsonMode(false); } catch { /* stay in json */ }
    } else {
      setJsonText(JSON.stringify(content, null, 2));
      setJsonMode(true);
    }
  };

  const inputCls = "w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 admin-text text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40";
  const smallInputCls = "w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500/40";

  if (jsonMode) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">JSON Editor</span>
          <button onClick={toggleJson} className="text-[10px] text-sky-400 hover:text-sky-300 cursor-pointer">{jsonValid ? "Switch to Fields" : "Fix JSON first"}</button>
        </div>
        <textarea
          value={jsonText}
          onChange={(e) => { setJsonText(e.target.value); try { JSON.parse(e.target.value); setJsonValid(true); onChange(JSON.parse(e.target.value)); } catch { setJsonValid(false); } }}
          spellCheck={false}
          className={`w-full min-h-[250px] bg-white/[0.04] border rounded-xl px-4 py-3 text-white text-xs font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 ${!jsonValid ? "border-red-500/50 focus:ring-red-500/30" : "border-white/10 focus:ring-sky-500/40"}`}
        />
        {!jsonValid && <p className="text-red-400 text-[10px] flex items-center gap-1"><AlertCircle size={10} /> Invalid JSON</p>}
      </div>
    );
  }

  const keys = Object.keys(content);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Content ({keys.length} fields)</span>
        <button onClick={toggleJson} className="text-[10px] text-sky-400 hover:text-sky-300 cursor-pointer">Edit as JSON</button>
      </div>

      {keys.length === 0 && (
        <p className="text-xs text-slate-500 py-3 text-center">No content fields. Add fields below or use JSON editor.</p>
      )}

      {keys.map((key) => (
        <FieldEditor key={key} fieldKey={key} value={content[key]}
          onChange={(val) => onChange({ ...content, [key]: val })}
          onDelete={() => { const n = { ...content }; delete n[key]; onChange(n); }}
          inputCls={inputCls} smallInputCls={smallInputCls}
        />
      ))}

      <AddFieldButton onAdd={(k, v) => onChange({ ...content, [k]: v })} existingKeys={keys} inputCls={inputCls} />
    </div>
  );
}

/* ── Field Editor ── */

function FieldEditor({ fieldKey, value, onChange, onDelete, inputCls, smallInputCls }: {
  fieldKey: string; value: unknown; onChange: (v: unknown) => void; onDelete: () => void;
  inputCls: string; smallInputCls: string;
}) {
  const [mediaBrowserOpen, setMediaBrowserOpen] = useState(false);
  const label = prettifyKey(fieldKey);
  const mediaField = isMediaKey(fieldKey);

  if (typeof value === "string") {
    const isLong = value.length > 80 && !mediaField;
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            {label}
            {mediaField && <ImageIcon size={11} className="text-sky-400" />}
          </label>
          <button onClick={onDelete} className="text-slate-600 hover:text-red-400 cursor-pointer p-0.5"><Trash2 size={11} /></button>
        </div>
        {isLong ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={`${inputCls} resize-y`} />
        ) : (
          <div className="flex items-center gap-1.5">
            <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
            {mediaField && (
              <button
                type="button"
                onClick={() => setMediaBrowserOpen(true)}
                className="shrink-0 px-2.5 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 text-xs font-medium transition-colors cursor-pointer"
                title="Browse media library"
              >
                Browse
              </button>
            )}
          </div>
        )}
        {mediaField && typeof value === "string" && value && (value.startsWith("http") || value.startsWith("/")) && (
          <div className="mt-1.5 w-16 h-16 rounded-lg bg-white/[0.04] border border-white/10 overflow-hidden">
            <img src={value} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
        )}
        {mediaField && (
          <MediaBrowserModal
            open={mediaBrowserOpen}
            onClose={() => setMediaBrowserOpen(false)}
            onSelect={(url) => { onChange(url); setMediaBrowserOpen(false); }}
            accept="image/*"
            title="Select Image"
          />
        )}
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-slate-400 font-medium">{label}</label>
          <button onClick={onDelete} className="text-slate-600 hover:text-red-400 cursor-pointer p-0.5"><Trash2 size={11} /></button>
        </div>
        <input type="number" value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className={inputCls} />
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between py-1">
        <label className="text-xs text-slate-400 font-medium">{label}</label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onChange(!value)} className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${value ? "bg-emerald-500" : "bg-white/10"}`}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? "translate-x-4" : ""}`} />
          </button>
          <button onClick={onDelete} className="text-slate-600 hover:text-red-400 cursor-pointer p-0.5"><Trash2 size={11} /></button>
        </div>
      </div>
    );
  }

  // Array of strings
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-slate-400 font-medium">{label} <span className="text-slate-600">({value.length})</span></label>
          <div className="flex items-center gap-2">
            <button onClick={() => onChange([...value, ""])} className="text-[10px] text-sky-400 hover:text-sky-300 cursor-pointer">+ Add</button>
            <button onClick={onDelete} className="text-slate-600 hover:text-red-400 cursor-pointer p-0.5"><Trash2 size={11} /></button>
          </div>
        </div>
        <div className="space-y-1.5">
          {value.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-600 w-5 text-right shrink-0">{i + 1}</span>
              <input type="text" value={item} onChange={(e) => { const n = [...value]; n[i] = e.target.value; onChange(n); }} className={smallInputCls} />
              <button onClick={() => onChange(value.filter((_: string, j: number) => j !== i))} className="text-slate-600 hover:text-red-400 cursor-pointer p-0.5 shrink-0"><Trash2 size={11} /></button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Array of objects
  if (Array.isArray(value)) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-slate-400 font-medium">{label} <span className="text-slate-600">({value.length} items)</span></label>
          <div className="flex items-center gap-2">
            <button onClick={() => {
              const tmpl = value.length > 0 ? Object.fromEntries(Object.keys(value[0]).map((k) => [k, typeof value[0][k] === "number" ? 0 : ""])) : {};
              onChange([...value, tmpl]);
            }} className="text-[10px] text-sky-400 hover:text-sky-300 cursor-pointer">+ Add Item</button>
            <button onClick={onDelete} className="text-slate-600 hover:text-red-400 cursor-pointer p-0.5"><Trash2 size={11} /></button>
          </div>
        </div>
        <div className="space-y-2">
          {value.map((item, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-600">Item {i + 1}</span>
                <button onClick={() => onChange(value.filter((_: any, j: number) => j !== i))} className="text-[10px] text-red-400/50 hover:text-red-400 cursor-pointer">Remove</button>
              </div>
              {typeof item === "object" && item !== null ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.keys(item).map((k) => (
                    <SubFieldInput
                      key={k}
                      fieldKey={k}
                      value={item[k]}
                      onChange={(newVal) => { const n = [...value]; n[i] = { ...n[i], [k]: newVal }; onChange(n); }}
                      inputCls={smallInputCls}
                    />
                  ))}
                </div>
              ) : (
                <input type="text" value={String(item)} onChange={(e) => { const n = [...value]; n[i] = e.target.value; onChange(n); }} className={smallInputCls} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Nested object
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, any>;
    return (
      <div className="bg-white/[0.01] border border-white/[0.04] rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-400 font-medium">{label}</label>
          <button onClick={onDelete} className="text-slate-600 hover:text-red-400 cursor-pointer p-0.5"><Trash2 size={11} /></button>
        </div>
        <div className="space-y-2">
          {Object.keys(obj).map((k) => (
            <div key={k}>
              <div className="flex items-center gap-1.5">
                <div className="flex-1">
                  <SubFieldInput
                    fieldKey={k}
                    value={obj[k]}
                    onChange={(newVal) => onChange({ ...obj, [k]: newVal })}
                    inputCls={smallInputCls}
                  />
                </div>
                <button onClick={() => { const n = { ...obj }; delete n[k]; onChange(n); }} className="text-slate-600 hover:text-red-400 cursor-pointer p-0.5 shrink-0 mt-4"><Trash2 size={10} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-slate-400 font-medium">{label}</label>
        <button onClick={onDelete} className="text-slate-600 hover:text-red-400 cursor-pointer p-0.5"><Trash2 size={11} /></button>
      </div>
      <input type="text" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </div>
  );
}

/* ── Sub-field input with optional media browse ── */

function SubFieldInput({ fieldKey, value, onChange, inputCls }: {
  fieldKey: string; value: unknown; onChange: (v: unknown) => void; inputCls: string;
}) {
  const [mediaBrowserOpen, setMediaBrowserOpen] = useState(false);
  const mediaField = isMediaKey(fieldKey);

  if (typeof value === "number") {
    return (
      <div>
        <label className="block text-[10px] text-slate-500 mb-0.5">{prettifyKey(fieldKey)}</label>
        <input type="number" value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className={inputCls} />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-[10px] text-slate-500 mb-0.5 flex items-center gap-1">
        {prettifyKey(fieldKey)}
        {mediaField && <ImageIcon size={9} className="text-sky-400" />}
      </label>
      <div className="flex items-center gap-1">
        <input type="text" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={inputCls} />
        {mediaField && (
          <button
            type="button"
            onClick={() => setMediaBrowserOpen(true)}
            className="shrink-0 px-1.5 py-1.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 text-[10px] font-medium transition-colors cursor-pointer"
            title="Browse media library"
          >
            <ImageIcon size={12} />
          </button>
        )}
      </div>
      {mediaField && typeof value === "string" && value && (value.startsWith("http") || value.startsWith("/")) && (
        <div className="mt-1 w-10 h-10 rounded bg-white/[0.04] border border-white/10 overflow-hidden">
          <img src={value} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      )}
      {mediaField && (
        <MediaBrowserModal
          open={mediaBrowserOpen}
          onClose={() => setMediaBrowserOpen(false)}
          onSelect={(url) => { onChange(url); setMediaBrowserOpen(false); }}
          accept="image/*"
          title="Select Image"
        />
      )}
    </div>
  );
}

/* ── Add Field ── */

function AddFieldButton({ onAdd, existingKeys, inputCls }: { onAdd: (k: string, v: unknown) => void; existingKeys: string[]; inputCls: string }) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [type, setType] = useState<"text" | "number" | "boolean" | "list" | "items" | "object">("text");

  const handleAdd = () => {
    const cleanKey = key.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "");
    if (!cleanKey || existingKeys.includes(cleanKey)) return;
    const defaults = { text: "", number: 0, boolean: false, list: [""], items: [{}], object: {} };
    onAdd(cleanKey, defaults[type]);
    setKey(""); setOpen(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-[10px] text-sky-400 hover:text-sky-300 cursor-pointer flex items-center gap-1">
        <Plus size={11} /> Add Field
      </button>
    );
  }

  return (
    <div className="flex items-end gap-2 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
      <div className="flex-1">
        <label className="block text-[10px] text-slate-500 mb-0.5">Field Name</label>
        <input type="text" value={key} onChange={(e) => setKey(e.target.value)} placeholder="e.g. Headline" className={inputCls} />
        {key && <p className="text-[9px] text-slate-600 mt-0.5 font-mono">{key.toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "")}</p>}
      </div>
      <div className="w-28">
        <label className="block text-[10px] text-slate-500 mb-0.5">Type</label>
        <select value={type} onChange={(e) => setType(e.target.value as any)} className={inputCls}>
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="boolean">Toggle</option>
          <option value="list">List</option>
          <option value="items">Items</option>
          <option value="object">Object</option>
        </select>
      </div>
      <button onClick={handleAdd} disabled={!key.trim()} className="px-3 py-2 rounded-lg bg-sky-500 text-white text-xs font-medium disabled:opacity-50 cursor-pointer shrink-0">Add</button>
      <button onClick={() => setOpen(false)} className="px-2 py-2 text-slate-500 text-xs cursor-pointer shrink-0">Cancel</button>
    </div>
  );
}
