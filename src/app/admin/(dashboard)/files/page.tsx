"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload,
  Download,
  Trash2,
  Copy,
  Check,
  X,
  Image as ImageIcon,
  File,
  Folder,
  FolderOpen,
  FolderPlus,
  Loader2,
  AlertCircle,
  Info,
  Search,
  Grid3x3,
  List,
  ChevronRight,
  Home,
  MoreVertical,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  alt_text: string | null;
  folder: string | null;
  public_url: string | null;
  is_static_local: boolean;
  created_at: string;
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [altText, setAltText] = useState("");
  const [savingAlt, setSavingAlt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });

    if (selectedFolder !== null) {
      query = query.eq("folder", selectedFolder);
    }

    const { data, error: fetchError } = await query;
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setFiles(data ?? []);
    }
    setLoading(false);
  }, [selectedFolder]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Derive folder list from all files
  const [allFolders, setAllFolders] = useState<string[]>([]);
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("media")
      .select("folder")
      .then(({ data }) => {
        if (data) {
          const folders = Array.from(
            new Set(
              data
                .map((f: any) => f.folder)
                .filter((f: string | null): f is string => f !== null && f !== "")
            )
          ).sort();
          setAllFolders(folders);
        }
      });
  }, [files]);

  // Filtered files
  const filteredFiles = searchQuery
    ? files.filter((f) => f.file_name.toLowerCase().includes(searchQuery.toLowerCase()))
    : files;

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError("");

    const supabase = createClient();

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const folderPath = selectedFolder ? `${selectedFolder}/` : "";
      const storagePath = `${folderPath}${timestamp}_${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("public-media")
        .upload(storagePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError(`Upload failed for ${file.name}: ${uploadError.message}`);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("public-media").getPublicUrl(storagePath);

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    const supabase = createClient();

    // Create a placeholder file to establish the folder
    const folderName = newFolderName.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    const placeholderPath = `${folderName}/.folder`;
    await supabase.storage
      .from("public-media")
      .upload(placeholderPath, new Blob([""]), { cacheControl: "3600", upsert: true });

    // Insert a media record so the folder shows up
    await supabase.from("media").insert({
      file_name: ".folder",
      file_path: placeholderPath,
      file_type: "folder/placeholder",
      file_size: 0,
      folder: folderName,
      public_url: null,
      is_static_local: false,
    });

    setNewFolderName("");
    setShowNewFolder(false);
    setCreatingFolder(false);
    fetchFiles();
  };

  const handleDeleteFile = async (fileId: string) => {
    setDeleting(true);
    const supabase = createClient();

    const fileToDelete = files.find((f) => f.id === fileId);
    if (fileToDelete && !fileToDelete.is_static_local) {
      await supabase.storage.from("public-media").remove([fileToDelete.file_path]);
    }

    await supabase.from("media").delete().eq("id", fileId);

    setDeleting(false);
    setDeleteConfirm(null);
    if (selectedFile?.id === fileId) setSelectedFile(null);
    fetchFiles();
  };

  const handleDownloadFile = (file: MediaFile) => {
    if (!file.public_url) return;
    const a = document.createElement("a");
    a.href = file.public_url;
    a.download = file.file_name;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAltText = async () => {
    if (!selectedFile) return;
    setSavingAlt(true);
    const supabase = createClient();
    await supabase
      .from("media")
      .update({ alt_text: altText })
      .eq("id", selectedFile.id);

    setSelectedFile({ ...selectedFile, alt_text: altText });
    setSavingAlt(false);
    fetchFiles();
  };

  useEffect(() => {
    if (selectedFile) {
      setAltText(selectedFile.alt_text ?? "");
    }
  }, [selectedFile]);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "\u2014";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (fileType: string | null) => fileType?.startsWith("image/") ?? false;

  // Filter out placeholder files
  const displayFiles = filteredFiles.filter((f) => f.file_name !== ".folder");

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold admin-text">Files</h1>
          <p className="text-sm text-slate-400 mt-1">Upload, organize, and manage media files</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewFolder(true)}
            className="inline-flex items-center gap-2 admin-card admin-nav-hover rounded-xl px-4 py-2 text-sm font-medium admin-text transition-colors cursor-pointer"
          >
            <FolderPlus size={16} />
            New Folder
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Upload Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>
      </div>

      {/* New Folder Dialog */}
      {showNewFolder && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <FolderPlus size={20} className="text-sky-400 shrink-0" />
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name..."
            autoFocus
            className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2 admin-text text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
          />
          <button
            onClick={handleCreateFolder}
            disabled={creatingFolder || !newFolderName.trim()}
            className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
          >
            {creatingFolder ? <Loader2 size={14} className="animate-spin" /> : "Create"}
          </button>
          <button
            onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
          <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-300 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Folder Sidebar */}
        <div className="w-56 shrink-0">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sticky top-6">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Folders</h3>
            <div className="space-y-1">
              <button
                onClick={() => { setSelectedFolder(null); setSelectedFile(null); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer ${
                  selectedFolder === null
                    ? "bg-sky-500/10 text-sky-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <FolderOpen size={16} />
                All Files
              </button>
              {allFolders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => { setSelectedFolder(folder); setSelectedFile(null); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer ${
                    selectedFolder === folder
                      ? "bg-sky-500/10 text-sky-400"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Folder size={16} />
                  {folder}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm flex-1">
              <button
                onClick={() => { setSelectedFolder(null); setSelectedFile(null); }}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Home size={14} />
              </button>
              {selectedFolder && (
                <>
                  <ChevronRight size={12} className="text-slate-600" />
                  <span className="admin-text font-medium">{selectedFolder}</span>
                </>
              )}
            </div>

            {/* Search */}
            <div className="relative w-64">
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
            <div className="flex items-center admin-card rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === "grid" ? "bg-sky-500/10 text-sky-400" : "text-slate-500 hover:text-sky-400"}`}
              >
                <Grid3x3 size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === "list" ? "bg-sky-500/10 text-sky-400" : "text-slate-500 hover:text-sky-400"}`}
              >
                <List size={14} />
              </button>
            </div>
          </div>

          {/* Drop Zone (merged with empty state when no files) */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl mb-6 text-center transition-colors ${
              displayFiles.length === 0 && !loading ? "p-16" : "p-6"
            } ${
              dragOver ? "border-sky-400 bg-sky-500/10" : "border-white/10 hover:border-white/20"
            }`}
          >
            <Upload size={displayFiles.length === 0 && !loading ? 48 : 28} className={`mx-auto mb-2 ${dragOver ? "text-sky-400" : "text-slate-600"}`} />
            <p className={`text-sm ${dragOver ? "text-sky-300" : "text-slate-500"}`}>
              {uploading ? "Uploading..." : "Drag and drop files here, or click Upload"}
            </p>
            {displayFiles.length === 0 && !loading && (
              <p className="text-slate-400 mt-4 text-sm">
                {searchQuery ? "No files match your search" : "No files in this location"}
              </p>
            )}
          </div>

          {/* File Grid/List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-slate-500" />
            </div>
          ) : viewMode === "grid" && displayFiles.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`bg-white/[0.03] border rounded-2xl p-3 text-left transition-all hover:bg-white/[0.06] group cursor-pointer ${
                    selectedFile?.id === file.id
                      ? "border-sky-500/50 ring-2 ring-sky-500/20"
                      : "border-white/10"
                  }`}
                >
                  <div className="aspect-square rounded-xl bg-white/[0.04] mb-3 flex items-center justify-center overflow-hidden">
                    {isImage(file.file_type) && file.public_url ? (
                      <img src={file.public_url} alt={file.alt_text ?? file.file_name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <File size={32} className="text-slate-600" />
                    )}
                  </div>
                  <p className="admin-text text-sm font-medium truncate">{file.file_name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-slate-500 text-xs">{formatFileSize(file.file_size)}</p>
                    {file.is_static_local && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300">
                        <Info size={10} />Static
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : viewMode === "list" && displayFiles.length > 0 ? (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider w-10"></th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Size</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayFiles.map((file) => (
                    <tr
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
                      className={`hover:bg-white/[0.03] transition-colors cursor-pointer ${selectedFile?.id === file.id ? "bg-sky-500/5" : ""}`}
                    >
                      <td className="px-4 py-3">
                        {isImage(file.file_type) && file.public_url ? (
                          <img src={file.public_url} alt="" className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-white/[0.04] flex items-center justify-center">
                            <File size={14} className="text-slate-500" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 admin-text font-medium truncate max-w-[200px]">{file.file_name}</td>
                      <td className="px-4 py-3 text-slate-400">{formatFileSize(file.file_size)}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{file.file_type ?? "Unknown"}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {new Date(file.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {file.public_url && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDownloadFile(file); }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 transition-colors cursor-pointer"
                              title="Download"
                            >
                              <Download size={14} />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id); }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        {/* Details Panel */}
        {selectedFile && selectedFile.file_name !== ".folder" && (
          <div className="w-72 shrink-0">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 sticky top-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold admin-text">Details</h3>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Preview */}
              <div className="aspect-square rounded-xl bg-white/[0.04] flex items-center justify-center overflow-hidden">
                {isImage(selectedFile.file_type) && selectedFile.public_url ? (
                  <img src={selectedFile.public_url} alt={selectedFile.alt_text ?? selectedFile.file_name} className="w-full h-full object-contain" />
                ) : (
                  <File size={48} className="text-slate-600" />
                )}
              </div>

              {/* Meta */}
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Filename</p>
                  <p className="admin-text truncate">{selectedFile.file_name}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Size</p>
                  <p className="text-slate-300">{formatFileSize(selectedFile.file_size)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Type</p>
                  <p className="text-slate-300">{selectedFile.file_type ?? "Unknown"}</p>
                </div>
                {selectedFile.folder && (
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">Folder</p>
                    <p className="text-slate-300">{selectedFile.folder}</p>
                  </div>
                )}
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Uploaded</p>
                  <p className="text-slate-300 text-xs">
                    {new Date(selectedFile.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                {selectedFile.is_static_local && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                    <p className="text-amber-300 text-xs font-medium">Static &mdash; needs upload</p>
                    <p className="text-amber-400/60 text-xs mt-0.5">This file is served locally and should be uploaded to storage.</p>
                  </div>
                )}
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Alt Text</label>
                <textarea
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  rows={2}
                  placeholder="Describe this image..."
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2 admin-text text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
                />
                <button
                  onClick={handleSaveAltText}
                  disabled={savingAlt}
                  className="mt-2 w-full admin-card admin-nav-hover disabled:opacity-50 admin-text rounded-xl px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
                >
                  {savingAlt ? "Saving..." : "Save Alt Text"}
                </button>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {selectedFile.public_url && (
                  <>
                    <button
                      onClick={() => handleDownloadFile(selectedFile)}
                      className="w-full inline-flex items-center justify-center gap-2 admin-card admin-nav-hover admin-text rounded-xl px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
                    >
                      <Download size={14} />
                      Download
                    </button>
                    <button
                      onClick={() => handleCopyUrl(selectedFile.public_url!)}
                      className="w-full inline-flex items-center justify-center gap-2 admin-card admin-nav-hover admin-text rounded-xl px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <><Check size={14} className="text-emerald-400" /> Copied!</>
                      ) : (
                        <><Copy size={14} /> Copy URL</>
                      )}
                    </button>
                  </>
                )}

                {deleteConfirm === selectedFile.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteFile(selectedFile.id)}
                      disabled={deleting}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 text-red-300 rounded-xl px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
                    >
                      {deleting ? <Loader2 size={14} className="animate-spin" /> : "Confirm"}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="admin-card admin-nav-hover admin-text rounded-xl px-4 py-2 text-sm transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(selectedFile.id)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} /> Delete File
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
