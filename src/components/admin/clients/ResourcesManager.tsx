"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Upload,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";

interface Resource {
  id: string;
  client_account_id: string;
  title: string;
  description?: string | null;
  author?: string | null;
  file_url?: string | null;
  allow_download?: boolean;
  visibility?: string;
  created_at?: string;
}

export default function ResourcesManager({
  clientId,
  initialResources,
}: {
  clientId: string;
  initialResources?: Resource[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loadedResources, setLoadedResources] = useState<Resource[]>(initialResources ?? []);

  useEffect(() => {
    if (initialResources) return;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("client_resources")
        .select("*")
        .eq("client_account_id", clientId)
        .order("created_at", { ascending: false });
      setLoadedResources(data ?? []);
    }
    load();
  }, [clientId, initialResources]);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [allowDownload, setAllowDownload] = useState(true);
  const [visibility, setVisibility] = useState("draft");
  const [file, setFile] = useState<File | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAuthor("");
    setAllowDownload(true);
    setVisibility("draft");
    setFile(null);
    setEditingResource(null);
    setError("");
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (resource: Resource) => {
    setTitle(resource.title);
    setDescription(resource.description ?? "");
    setAuthor(resource.author ?? "");
    setAllowDownload(resource.allow_download ?? true);
    setVisibility(resource.visibility ?? "draft");
    setFile(null);
    setEditingResource(resource);
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    const supabase = createClient();
    let fileUrl = editingResource?.file_url ?? null;

    // Upload file if selected
    if (file) {
      setUploading(true);
      const filename = `${Date.now()}-${file.name}`;
      const path = `resources/${clientId}/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("client-files")
        .upload(path, file);

      if (uploadError) {
        setError(`File upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("client-files").getPublicUrl(path);

      fileUrl = publicUrl;
      setUploading(false);
    }

    const payload = {
      title: title.trim(),
      description: description || null,
      author: author || null,
      file_url: fileUrl,
      allow_download: allowDownload,
      visibility,
    };

    if (editingResource) {
      const { error: updateError } = await supabase
        .from("client_resources")
        .update(payload)
        .eq("id", editingResource.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("client_resources")
        .insert({
          ...payload,
          client_account_id: clientId,
        });

      if (insertError) {
        setError(insertError.message);
        return;
      }
    }

    setShowForm(false);
    resetForm();
    startTransition(() => {
      router.refresh();
    });
  };

  const handleDelete = async (resource: Resource) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    const supabase = createClient();
    await supabase.from("client_resources").delete().eq("id", resource.id);

    startTransition(() => {
      router.refresh();
    });
  };

  const visibilityBadge = (vis: string) => {
    if (vis === "published") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
          <Eye size={12} />
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400">
        <EyeOff size={12} />
        Draft
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors"
        >
          <Upload size={16} />
          Upload Resource
        </button>
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Title
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Author
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Visibility
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Download
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loadedResources.length > 0 ? (
              loadedResources.map((resource) => (
                <tr
                  key={resource.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium admin-text">
                    {resource.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {resource.author ?? "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {visibilityBadge(resource.visibility ?? "draft")}
                  </td>
                  <td className="px-6 py-4">
                    {resource.allow_download ? (
                      <Download size={14} className="text-emerald-400" />
                    ) : (
                      <span className="text-xs text-slate-500">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {resource.created_at
                      ? new Date(resource.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(resource)}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(resource)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-500 text-sm"
                >
                  No resources found. Upload one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Resource Form Modal */}
      {showForm && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
            <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold admin-text">
                  {editingResource ? "Edit Resource" : "Upload Resource"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
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
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author name"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    PDF File
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20 transition-all text-sm"
                  />
                  {editingResource?.file_url && !file && (
                    <p className="text-xs text-slate-500 mt-1">
                      Current file will be kept if no new file is selected.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={allowDownload}
                        onChange={(e) => setAllowDownload(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 rounded-full bg-white/10 peer-checked:bg-sky-500 transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
                    </div>
                    <span className="text-sm text-slate-300">
                      Allow Download
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Visibility
                    </label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 admin-text text-sm focus:outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isPending || uploading}
                    className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isPending || uploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {uploading ? "Uploading..." : "Saving..."}
                      </>
                    ) : editingResource ? (
                      "Save Changes"
                    ) : (
                      "Upload Resource"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
