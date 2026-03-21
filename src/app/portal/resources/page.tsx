"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FolderOpen,
  Grid3X3,
  List,
  Download,
  Eye,
  X,
  Loader2,
  FileText,
  Calendar,
  User,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClientResource } from "@/lib/types/database";

type ViewMode = "grid" | "list";

export default function ResourcesPage() {
  const [resources, setResources] = useState<ClientResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("portal_resources_view") as ViewMode) || "grid";
    }
    return "grid";
  });
  const [previewResource, setPreviewResource] = useState<ClientResource | null>(
    null
  );

  useEffect(() => {
    async function fetchResources() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: clientUser } = await supabase
        .from("client_users")
        .select("client_account_id")
        .eq("id", user.id)
        .single();
      if (!clientUser) return;

      const { data } = await supabase
        .from("client_resources")
        .select("*")
        .eq("client_account_id", clientUser.client_account_id)
        .eq("visibility", "published")
        .order("created_at", { ascending: false });

      setResources(data ?? []);
      setLoading(false);
    }
    fetchResources();
  }, []);

  const toggleView = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("portal_resources_view", mode);
  };

  const handleDownload = (resource: ClientResource) => {
    if (!resource.allow_download) return;
    window.open(resource.file_url, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
            <FolderOpen size={20} className="text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold admin-text">Resources</h1>
            <p className="text-sm text-slate-400">
              {resources.length} resource{resources.length !== 1 ? "s" : ""}{" "}
              available
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-xl p-1">
          <button
            onClick={() => toggleView("grid")}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === "grid"
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => toggleView("list")}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === "list"
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:text-white"
            )}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
          <FolderOpen size={32} className="text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No resources available.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.06] transition-colors group cursor-pointer"
              onClick={() => setPreviewResource(resource)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-sky-400" />
                </div>
                {!resource.allow_download && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400">
                    <Lock size={10} />
                    Preview Only
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold admin-text mb-1 line-clamp-2">
                {resource.title}
              </h3>
              {resource.description && (
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {resource.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                {resource.author && (
                  <span className="flex items-center gap-1">
                    <User size={10} />
                    {resource.author}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(resource.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Author
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Access
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {resources.map((resource) => (
                <tr
                  key={resource.id}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => setPreviewResource(resource)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-slate-500" />
                      <div>
                        <span className="text-sm font-medium admin-text">
                          {resource.title}
                        </span>
                        {resource.description && (
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {resource.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {resource.author || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(resource.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {resource.allow_download ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
                        Download
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400">
                        <Lock size={10} />
                        Preview Only
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sm text-sky-400 hover:text-sky-300 transition-colors">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <div>
                <h2 className="text-lg font-bold admin-text">
                  {previewResource.title}
                </h2>
                {previewResource.description && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {previewResource.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {previewResource.allow_download ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(previewResource);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors"
                  >
                    <Download size={14} />
                    Download
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-medium">
                    <Eye size={14} />
                    Preview Only
                  </span>
                )}
                <button
                  onClick={() => setPreviewResource(null)}
                  className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div
              className="flex-1 p-4 overflow-hidden"
              onContextMenu={
                !previewResource.allow_download
                  ? (e) => e.preventDefault()
                  : undefined
              }
            >
              {previewResource.file_type === "application/pdf" ||
              previewResource.file_url.endsWith(".pdf") ? (
                <object
                  data={previewResource.file_url}
                  type="application/pdf"
                  className="w-full h-full rounded-xl"
                >
                  <iframe
                    src={previewResource.file_url}
                    className="w-full h-full rounded-xl"
                    title={previewResource.title}
                  />
                </object>
              ) : (
                <iframe
                  src={previewResource.file_url}
                  className="w-full h-full rounded-xl bg-white"
                  title={previewResource.title}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
