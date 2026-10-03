"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  File02,
  Folder,
  Grid01,
  Image01,
  List,
  SearchLg,
  Upload01,
  XClose,
} from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { cx } from "@/utils/cx";

interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  folder: string | null;
  bucket: string;
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
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("media")
      .select("id, original_filename, filename, storage_path, mime_type, size_bytes, folder, bucket, public_url, is_static_local, created_at")
      .order("created_at", { ascending: false });

    if (selectedFolder !== null) {
      query = query.eq("folder", selectedFolder);
    }

    const { data, error: fetchError } = await query;
    if (fetchError) setError(fetchError.message);
    setFiles((data ?? []).map((row) => ({
      id: row.id,
      file_name: row.original_filename || row.filename,
      file_path: row.storage_path,
      file_type: row.mime_type,
      file_size: row.size_bytes,
      folder: row.folder === "/" ? null : row.folder,
      bucket: row.bucket,
      public_url: row.public_url,
      is_static_local: row.is_static_local,
    })).filter((f) => f.file_name !== ".folder"));
    setLoading(false);
  }, [selectedFolder]);

  const fetchFolders = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("media").select("folder");
    if (data) {
      const folderList = Array.from(
        new Set(data.map((f) => f.folder).filter((f: string | null): f is string => f !== null && f !== "" && f !== "/"))
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
    const selectedFiles = Array.from(fileList);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploading(true);
    setError("");

    const supabase = createClient();
    const failures: string[] = [];
    for (const file of selectedFiles) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const folderPath = selectedFolder ? `${selectedFolder}/` : "";
      const storagePath = `${folderPath}${crypto.randomUUID()}_${safeName}`;

      const { error } = await supabase.storage
        .from("public-media")
        .upload(storagePath, file, { cacheControl: "3600", upsert: false });

      if (error) {
        failures.push(`${file.name}: ${error.message}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage.from("public-media").getPublicUrl(storagePath);

      const { error: recordError } = await supabase.from("media").insert({
        filename: safeName,
        original_filename: file.name,
        storage_path: storagePath,
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
        bucket: "public-media",
        folder: selectedFolder || null,
        public_url: publicUrl,
        is_static_local: false,
      });
      if (recordError) {
        await supabase.storage.from("public-media").remove([storagePath]);
        failures.push(`${file.name}: ${recordError.message}`);
      }
    }

    setUploading(false);
    if (failures.length) setError(`Some files could not be uploaded. ${failures.join(" · ")}`);
    fetchFiles();
  };

  const isImage = (fileType: string | null) => fileType?.startsWith("image/") ?? false;
  const isVideo = (fileType: string | null) => fileType?.startsWith("video/") ?? false;

  // Filter files
  let filtered = files;
  if (accept === "image/*") {
    filtered = filtered.filter((f) => isImage(f.file_type));
  }
  if (accept === "video/*") {
    filtered = filtered.filter((f) => isVideo(f.file_type));
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
    <ModalOverlay isDismissable isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal className="w-full max-w-4xl">
        <Dialog aria-label={title}>
          <div className="flex h-[720px] max-h-[80vh] flex-col overflow-hidden">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-secondary px-6 py-4">
              <h2 className="text-lg font-semibold text-primary">{title}</h2>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  color="secondary"
                  iconLeading={Upload01}
                  isLoading={uploading}
                  showTextWhileLoading
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={accept}
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
                <ButtonUtility size="sm" color="tertiary" icon={XClose} tooltip="Close" onClick={onClose} />
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex shrink-0 items-center gap-3 border-b border-secondary px-6 py-3">
              {/* Search */}
              <div className="flex-1">
                <Input
                  size="sm"
                  icon={SearchLg}
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>
              {/* View toggle */}
              <div className="flex items-center gap-0.5 rounded-lg bg-secondary p-0.5">
                <button
                  type="button"
                  aria-label="Grid view"
                  onClick={() => setViewMode("grid")}
                  className={cx(
                    "cursor-pointer rounded-md p-1.5 transition-colors",
                    viewMode === "grid"
                      ? "bg-primary text-fg-secondary shadow-xs ring-1 ring-secondary ring-inset"
                      : "text-fg-quaternary hover:text-fg-quaternary_hover"
                  )}
                >
                  <Grid01 className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  onClick={() => setViewMode("list")}
                  className={cx(
                    "cursor-pointer rounded-md p-1.5 transition-colors",
                    viewMode === "list"
                      ? "bg-primary text-fg-secondary shadow-xs ring-1 ring-secondary ring-inset"
                      : "text-fg-quaternary hover:text-fg-quaternary_hover"
                  )}
                >
                  <List className="size-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Folder sidebar */}
              <div className="w-44 shrink-0 overflow-y-auto border-r border-secondary p-3">
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedFolder(null)}
                    className={cx(
                      "flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                      selectedFolder === null
                        ? "bg-active text-secondary"
                        : "text-tertiary hover:bg-primary_hover hover:text-secondary"
                    )}
                  >
                    <Folder className="size-4 text-fg-quaternary" /> All Files
                  </button>
                  {folders.map((folder) => (
                    <button
                      key={folder}
                      type="button"
                      onClick={() => setSelectedFolder(folder)}
                      className={cx(
                        "flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                        selectedFolder === folder
                          ? "bg-active text-secondary"
                          : "text-tertiary hover:bg-primary_hover hover:text-secondary"
                      )}
                    >
                      <Folder className="size-4 text-fg-quaternary" /> {folder}
                    </button>
                  ))}
                </div>
              </div>

              {/* File grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {error && (
                  <p role="alert" className="mb-4 rounded-lg bg-utility-red-50 px-3 py-2 text-sm text-utility-red-700 ring-1 ring-utility-red-200">
                    {error}
                  </p>
                )}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingIndicator type="line-spinner" size="sm" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-8">
                    <EmptyState size="sm">
                      <EmptyState.Header>
                        <EmptyState.FeaturedIcon icon={Image01} color="gray" />
                      </EmptyState.Header>
                      <EmptyState.Content>
                        <EmptyState.Title>No files found</EmptyState.Title>
                        <EmptyState.Description>
                          Upload a file or adjust your search to see results.
                        </EmptyState.Description>
                      </EmptyState.Content>
                    </EmptyState>
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5">
                    {filtered.map((file) => (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => {
                          if (file.public_url) {
                            onSelect(file.public_url, file.file_name);
                            onClose();
                          }
                        }}
                        className="group cursor-pointer rounded-xl bg-primary p-2 text-left ring-1 ring-secondary transition hover:bg-secondary hover:ring-brand"
                      >
                        <div className="mb-2 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-secondary">
                          {isImage(file.file_type) && file.public_url ? (
                            <img src={file.public_url} alt={file.file_name} className="h-full w-full rounded-lg object-cover" />
                          ) : isVideo(file.file_type) && file.public_url ? (
                            <video src={file.public_url} muted playsInline preload="metadata" className="h-full w-full rounded-lg object-cover" />
                          ) : (
                            <File02 className="size-6 text-fg-quaternary" />
                          )}
                        </div>
                        <p className="truncate text-xs font-medium text-primary">{file.file_name}</p>
                        <p className="text-xs text-quaternary">{formatSize(file.file_size)}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filtered.map((file) => (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => {
                          if (file.public_url) {
                            onSelect(file.public_url, file.file_name);
                            onClose();
                          }
                        }}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary"
                      >
                        {isImage(file.file_type) && file.public_url ? (
                          <img src={file.public_url} alt="" className="size-8 shrink-0 rounded object-cover" />
                        ) : isVideo(file.file_type) && file.public_url ? (
                          <video src={file.public_url} muted playsInline preload="metadata" className="size-8 shrink-0 rounded object-cover" />
                        ) : (
                          <div className="flex size-8 shrink-0 items-center justify-center rounded bg-secondary">
                            <File02 className="size-4 text-fg-quaternary" />
                          </div>
                        )}
                        <span className="flex-1 truncate text-sm font-medium text-primary">{file.file_name}</span>
                        <span className="shrink-0 text-xs text-quaternary">{formatSize(file.file_size)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
