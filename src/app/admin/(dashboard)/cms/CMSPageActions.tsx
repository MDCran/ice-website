"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, X, Loader2, AlertCircle } from "lucide-react";

interface PageData {
  id: string;
  title: string;
  slug: string;
  page_type: string;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  sort_order: number;
}

const PAGE_TYPES = [
  { value: "static", label: "Generic" },
  { value: "solution", label: "Solution" },
  { value: "legal", label: "Legal" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

export default function CMSPageActions({
  mode,
  page,
}: {
  mode: "create" | "row";
  page?: PageData;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit" | "delete">("create");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [pageType, setPageType] = useState("static");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const openCreate = () => {
    setTitle("");
    setSlug("");
    setPageType("static");
    setMetaTitle("");
    setMetaDescription("");
    setIsPublished(true);
    setError("");
    setModalType("create");
    setModalOpen(true);
  };

  const openEdit = () => {
    if (!page) return;
    setTitle(page.title);
    setSlug(page.slug);
    setPageType(page.page_type);
    setMetaTitle(page.meta_title ?? "");
    setMetaDescription(page.meta_description ?? "");
    setIsPublished(page.is_published);
    setError("");
    setModalType("edit");
    setModalOpen(true);
  };

  const openDelete = () => {
    setError("");
    setModalType("delete");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    const supabase = createClient();
    const finalSlug = slug.trim() || slugify(title);

    if (modalType === "create") {
      const { error: insertError } = await supabase.from("pages").insert({
        title: title.trim(),
        slug: finalSlug,
        page_type: pageType,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
        is_published: isPublished,
      });
      if (insertError) {
        setError(insertError.message);
        return;
      }
    } else if (modalType === "edit" && page) {
      const { error: updateError } = await supabase
        .from("pages")
        .update({
          title: title.trim(),
          slug: finalSlug,
          page_type: pageType,
          meta_title: metaTitle.trim() || null,
          meta_description: metaDescription.trim() || null,
          is_published: isPublished,
          updated_at: new Date().toISOString(),
        })
        .eq("id", page.id);
      if (updateError) {
        setError(updateError.message);
        return;
      }
    }

    setModalOpen(false);
    startTransition(() => router.refresh());
  };

  const handleDelete = async () => {
    if (!page) return;
    setError("");
    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("pages")
      .delete()
      .eq("id", page.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setModalOpen(false);
    startTransition(() => router.refresh());
  };

  // Render trigger
  if (mode === "create") {
    return (
      <>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Create Page
        </button>
        {modalOpen && renderModal()}
      </>
    );
  }

  // Row actions
  return (
    <>
      <div className="flex items-center gap-1">
        <a
          href={`/admin/cms/${page?.slug}`}
          className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Edit page"
        >
          <Pencil size={14} />
        </a>
        <button
          onClick={openDelete}
          className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
          title="Delete page"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {modalOpen && renderModal()}
    </>
  );

  function renderModal() {
    if (modalType === "delete") {
      return (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-lg font-bold admin-text mb-2">Delete Page</h2>
              <p className="text-sm text-slate-400 mb-6">
                Are you sure you want to delete <strong className="admin-text">{page?.title}</strong>?
                This will also remove all its sections. This cannot be undone.
              </p>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-slate-400 hover:text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setModalOpen(false)}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold admin-text">
                {modalType === "create" ? "Create Page" : "Edit Page"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (modalType === "create") setSlug(slugify(e.target.value));
                  }}
                  placeholder="Page Title"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated-from-title"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Page Type
                </label>
                <select
                  value={pageType}
                  onChange={(e) => setPageType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
                >
                  {PAGE_TYPES.map((t) => (
                    <option key={t.value} value={t.value} className="bg-slate-900">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="SEO title"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Meta Description
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="SEO description"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    isPublished ? "bg-emerald-500" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      isPublished ? "translate-x-5" : ""
                    }`}
                  />
                </button>
                <span className="text-sm text-slate-300">Published</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {modalType === "create" ? "Creating..." : "Saving..."}
                    </>
                  ) : (
                    modalType === "create" ? "Create Page" : "Save Changes"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-slate-400 hover:text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }
}
