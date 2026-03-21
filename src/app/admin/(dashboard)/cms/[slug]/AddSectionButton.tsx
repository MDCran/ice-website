"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AddSectionButton({ pageId }: { pageId: string }) {
  const [open, setOpen] = useState(false);
  const [sectionKey, setSectionKey] = useState("");
  const [sectionType, setSectionType] = useState("content");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const sectionTypes = [
    "hero",
    "content",
    "cta",
    "features",
    "testimonials",
    "faq",
    "stats",
    "gallery",
    "pricing",
    "custom",
  ];

  const handleCreate = async () => {
    if (!sectionKey.trim()) {
      setError("Section key is required");
      return;
    }

    setSaving(true);
    setError("");
    const supabase = createClient();

    const { error: insertError } = await supabase
      .from("page_sections")
      .insert({
        page_id: pageId,
        section_key: sectionKey.trim(),
        section_type: sectionType,
        content: {},
        sort_order: 999,
      });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setOpen(false);
    setSectionKey("");
    setSectionType("content");
    router.refresh();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors"
      >
        <Plus size={16} />
        Add Section
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold admin-text">Add Section</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Section Key
            </label>
            <input
              type="text"
              value={sectionKey}
              onChange={(e) => setSectionKey(e.target.value)}
              placeholder="e.g. hero_banner"
              className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 admin-text text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Section Type
            </label>
            <select
              value={sectionType}
              onChange={(e) => setSectionType(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 admin-text text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50"
            >
              {sectionTypes.map((type) => (
                <option key={type} value={type} className="bg-slate-900">
                  {type}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 admin-card admin-nav-hover admin-text rounded-xl px-4 py-2 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors"
            >
              {saving ? "Creating..." : "Create Section"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
