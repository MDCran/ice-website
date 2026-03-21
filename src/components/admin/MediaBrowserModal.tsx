"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Upload,
  Search,
  Folder,
  FolderOpen,
  File,
  Image as ImageIcon,
  Loader2,
  Check,
  Grid3x3,
  List,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  folder: string | null;
  public_url: string | null;
  is_static_local: boolean;
}

interface MediaBrowserModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, fileName: string) => void;
  accept?: string; // e.g., "image/*" to filter to images only
  title?: string;
}

export default function MediaBrowserModal({
  open,
  onClose,
  onSelect,
  accept,
  title = "Select File",
}: MediaBrowserModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("media")
      .select("id, file_name, file_path, file_type, file_size, folder, public_url, is_static_local")
      .order("created_at", { ascending: false });

    if (selectedFolder !== null) {
      query = query.eq("folder", selectedFolder);
    }

    const { data } = await query;
    setFiles((data ?? []).filter((f: any) => f.file_name !== ".folder"));
    setLoading(false);
  }, [selectedFolder]);

  const fetchFolders = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("media").select("folder");
    if (data) {
      const folderList = Array.from(
        new Set(data.map((f: any) => f.folder).filter((f: string | null): f is string => f !== null && f !== ""))
      ).sort();
      setFolders(folderList);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchFiles();
      fetchFolders();
    }
  }, [open, fetchFiles, fetchFolders]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);

    const supabase = createClient();
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const folderPath = selectedFolder ? `${selectedFolder}/` : "";
      const storagePath = `${folderPath}${timestamp}_${safeName}`;

      const { error } = await supabase.storage
        .from("public-media")
        .upload(storagePath, file, { cacheControl: "3600", upsert: false });

      if (error) continue;

      const { data: { publicUrl } } = supabase.storage.from("public-media").getPublicUrl(storagePath);

      await supabase.from("media").insert({
        file_name: file.name,
        file_path: storagePath,
        file_type: file.type,
        file_size: file.size,
        folder: selectedFolder || null,
        public_url: publicUrl,
        is_static_local: false,
      });
    }

    setUploading(false);
    fetchFiles();
  };

  const isImage = (fileType: string | null) => fileType?.startsWith("image/") ?? false;

  // Filter files
  let filtered = files;
  if (accept === "image/*") {
    filtered = filtered.filter((f) => isImage(f.file_type));
  }
  if (searchQuery) {
    filtered = filtered.filter((f) => f.file_name.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="admin-card rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-lg font-semibold admin-text">{title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Upload
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={accept}
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-white/5 shrink-0">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-9 pr-3 py-2 admin-text text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
          </div>
          {/* View toggle */}
          <div className="flex items-center bg-white/[0.04] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === "grid" ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"}`}
            >
              <Grid3x3 size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === "list" ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"}`}
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Folder sidebar */}
          <div className="w-44 border-r border-white/5 p-3 overflow-y-auto shrink-0">
            <div className="space-y-1">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  selectedFolder === null ? "bg-sky-500/10 text-sky-400" : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <FolderOpen size={14} /> All Files
              </button>
              {folders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => setSelectedFolder(folder)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    selectedFolder === folder ? "bg-sky-500/10 text-sky-400" : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Folder size={14} /> {folder}
                </button>
              ))}
            </div>
          </div>

          {/* File grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-slate-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon size={40} className="mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm">No files found</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filtered.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => {
                      if (file.public_url) {
                        onSelect(file.public_url, file.file_name);
                        onClose();
                      }
                    }}
                    className="bg-white/[0.03] border border-white/10 rounded-xl p-2 text-left hover:bg-white/[0.06] hover:border-sky-500/30 transition-all group cursor-pointer"
                  >
                    <div className="aspect-square rounded-lg bg-white/[0.04] mb-2 flex items-center justify-center overflow-hidden">
                      {isImage(file.file_type) && file.public_url ? (
                        <img src={file.public_url} alt={file.file_name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <File size={24} className="text-slate-600" />
                      )}
                    </div>
                    <p className="admin-text text-[11px] font-medium truncate">{file.file_name}</p>
                    <p className="text-slate-500 text-[10px]">{formatSize(file.file_size)}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {filtered.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => {
                      if (file.public_url) {
                        onSelect(file.public_url, file.file_name);
                        onClose();
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                  >
                    {isImage(file.file_type) && file.public_url ? (
                      <img src={file.public_url} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-white/[0.04] flex items-center justify-center shrink-0">
                        <File size={14} className="text-slate-500" />
                      </div>
                    )}
                    <span className="text-sm admin-text font-medium truncate flex-1">{file.file_name}</span>
                    <span className="text-xs text-slate-500 shrink-0">{formatSize(file.file_size)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
