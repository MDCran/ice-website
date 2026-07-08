"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  AlertCircle,
  Check,
  ChevronRight,
  Copy01,
  Download01,
  File02,
  Folder,
  FolderPlus,
  Grid01,
  Home01,
  List,
  SearchLg,
  Trash01,
  UploadCloud02,
} from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Table } from "@/components/application/table/table";
import { cx } from "@/utils/cx";

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
    if (!bytes) return "—";
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-display-xs font-semibold text-primary">Files</h1>
          <p className="mt-1 text-sm text-tertiary">Upload, organize, and manage media files</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="md"
            color="secondary"
            iconLeading={FolderPlus}
            onClick={() => setShowNewFolder(true)}
          >
            New Folder
          </Button>
          <Button
            size="md"
            color="primary"
            iconLeading={UploadCloud02}
            isLoading={uploading}
            showTextWhileLoading
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Files
          </Button>
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
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary">
          <FolderPlus className="size-5 shrink-0 text-fg-brand-primary" />
          <Input
            size="sm"
            aria-label="Folder name"
            placeholder="Folder name..."
            value={newFolderName}
            onChange={(value) => setNewFolderName(value)}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            className="flex-1"
          />
          <Button
            size="sm"
            color="primary"
            isLoading={creatingFolder}
            showTextWhileLoading
            isDisabled={creatingFolder || !newFolderName.trim()}
            onClick={handleCreateFolder}
          >
            Create
          </Button>
          <CloseButton
            size="sm"
            label="Cancel new folder"
            onPress={() => {
              setShowNewFolder(false);
              setNewFolderName("");
            }}
          />
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-utility-red-50 p-4 ring-1 ring-utility-red-200 ring-inset">
          <AlertCircle className="size-4 shrink-0 text-utility-red-500" />
          <p className="text-sm text-utility-red-700">{error}</p>
          <CloseButton size="xs" label="Dismiss error" onPress={() => setError("")} className="ml-auto" />
        </div>
      )}

      <div className="flex gap-6">
        {/* Folder Sidebar */}
        <div className="w-56 shrink-0">
          <div className="sticky top-6 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary">
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-quaternary uppercase">Folders</h3>
            <div className="space-y-1">
              <button
                onClick={() => { setSelectedFolder(null); setSelectedFile(null); }}
                className={cx(
                  "flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  selectedFolder === null
                    ? "bg-active text-secondary_hover"
                    : "text-tertiary hover:bg-primary_hover hover:text-secondary"
                )}
              >
                <Home01 className="size-4 shrink-0 text-fg-quaternary" />
                All Files
              </button>
              {allFolders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => { setSelectedFolder(folder); setSelectedFile(null); }}
                  className={cx(
                    "flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    selectedFolder === folder
                      ? "bg-active text-secondary_hover"
                      : "text-tertiary hover:bg-primary_hover hover:text-secondary"
                  )}
                >
                  <Folder className="size-4 shrink-0 text-fg-quaternary" />
                  {folder}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-4 flex items-center gap-3">
            {/* Breadcrumb */}
            <div className="flex flex-1 items-center gap-1.5 text-sm">
              <button
                onClick={() => { setSelectedFolder(null); setSelectedFile(null); }}
                aria-label="All files"
                className="cursor-pointer rounded-md p-1 text-fg-quaternary transition-colors hover:bg-primary_hover hover:text-fg-quaternary_hover"
              >
                <Home01 className="size-4" />
              </button>
              {selectedFolder && (
                <>
                  <ChevronRight className="size-3.5 text-fg-quaternary" />
                  <span className="font-medium text-primary">{selectedFolder}</span>
                </>
              )}
            </div>

            {/* Search */}
            <div className="w-64">
              <Input
                size="sm"
                icon={SearchLg}
                aria-label="Search files"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(value) => setSearchQuery(value)}
              />
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-0.5 rounded-lg bg-primary p-0.5 ring-1 ring-secondary">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
                className={cx(
                  "cursor-pointer rounded-md p-1.5 transition-colors",
                  viewMode === "grid"
                    ? "bg-active text-fg-brand-primary"
                    : "text-fg-quaternary hover:text-fg-quaternary_hover"
                )}
              >
                <Grid01 className="size-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
                className={cx(
                  "cursor-pointer rounded-md p-1.5 transition-colors",
                  viewMode === "list"
                    ? "bg-active text-fg-brand-primary"
                    : "text-fg-quaternary hover:text-fg-quaternary_hover"
                )}
              >
                <List className="size-4" />
              </button>
            </div>
          </div>

          {/* Drop Zone (merged with empty state when no files) */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cx(
              "mb-6 flex flex-col items-center rounded-xl bg-primary px-6 text-center ring-1 transition-colors",
              displayFiles.length === 0 && !loading ? "py-16" : "py-6",
              dragOver ? "ring-2 ring-brand" : "ring-secondary"
            )}
          >
            <FeaturedIcon
              color="gray"
              theme="modern"
              size={displayFiles.length === 0 && !loading ? "lg" : "md"}
              icon={UploadCloud02}
            />
            <p className={cx("mt-3 text-sm", dragOver ? "text-brand-secondary" : "text-tertiary")}>
              {uploading ? "Uploading..." : (
                <>
                  <span className="font-semibold text-brand-secondary">Click Upload</span> or drag and drop files here
                </>
              )}
            </p>
            {displayFiles.length === 0 && !loading && (
              <p className="mt-4 text-sm font-medium text-secondary">
                {searchQuery ? "No files match your search" : "No files in this location"}
              </p>
            )}
          </div>

          {/* File Grid/List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingIndicator type="line-spinner" size="md" label="Loading files..." />
            </div>
          ) : viewMode === "grid" && displayFiles.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {displayFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={cx(
                    "group cursor-pointer rounded-xl bg-primary p-3 text-left shadow-xs ring-1 transition-all hover:bg-secondary",
                    selectedFile?.id === file.id ? "ring-2 ring-brand" : "ring-secondary"
                  )}
                >
                  <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-secondary">
                    {isImage(file.file_type) && file.public_url ? (
                      <img src={file.public_url} alt={file.alt_text ?? file.file_name} className="size-full rounded-lg object-cover" />
                    ) : (
                      <File02 className="size-8 text-fg-quaternary" />
                    )}
                  </div>
                  <p className="truncate text-sm font-medium text-primary">{file.file_name}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs text-tertiary">{formatFileSize(file.file_size)}</p>
                    {file.is_static_local && (
                      <Badge size="sm" color="warning">
                        Static
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : viewMode === "list" && displayFiles.length > 0 ? (
            <div className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
              <Table aria-label="Files" size="sm">
                <Table.Header>
                  <Table.Head id="preview" aria-label="Preview" className="w-12" />
                  <Table.Head id="name" label="Name" isRowHeader />
                  <Table.Head id="size" label="Size" />
                  <Table.Head id="type" label="Type" />
                  <Table.Head id="date" label="Date" />
                  <Table.Head id="actions" aria-label="Actions" className="w-24" />
                </Table.Header>
                <Table.Body>
                  {displayFiles.map((file) => (
                    <Table.Row
                      key={file.id}
                      id={file.id}
                      onAction={() => setSelectedFile(file)}
                      className={cx("cursor-pointer", selectedFile?.id === file.id && "bg-secondary")}
                    >
                      <Table.Cell className="px-3">
                        {isImage(file.file_type) && file.public_url ? (
                          <img src={file.public_url} alt="" className="size-8 rounded object-cover" />
                        ) : (
                          <div className="flex size-8 items-center justify-center rounded bg-secondary">
                            <File02 className="size-3.5 text-fg-quaternary" />
                          </div>
                        )}
                      </Table.Cell>
                      <Table.Cell className="max-w-50">
                        <span className="block truncate text-sm font-medium text-primary">{file.file_name}</span>
                      </Table.Cell>
                      <Table.Cell>{formatFileSize(file.file_size)}</Table.Cell>
                      <Table.Cell className="text-xs">{file.file_type ?? "Unknown"}</Table.Cell>
                      <Table.Cell className="text-xs">
                        {new Date(file.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          {file.public_url && (
                            <ButtonUtility
                              size="xs"
                              color="tertiary"
                              icon={Download01}
                              tooltip="Download"
                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); handleDownloadFile(file); }}
                            />
                          )}
                          <ButtonUtility
                            size="xs"
                            color="tertiary"
                            icon={Trash01}
                            tooltip="Delete"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); handleDeleteFile(file.id); }}
                          />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          ) : null}
        </div>

        {/* Details Panel */}
        {selectedFile && selectedFile.file_name !== ".folder" && (
          <div className="w-72 shrink-0">
            <div className="sticky top-6 space-y-5 rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-primary">Details</h3>
                <CloseButton size="xs" label="Close details" onPress={() => setSelectedFile(null)} />
              </div>

              {/* Preview */}
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-secondary">
                {isImage(selectedFile.file_type) && selectedFile.public_url ? (
                  <img src={selectedFile.public_url} alt={selectedFile.alt_text ?? selectedFile.file_name} className="size-full object-contain" />
                ) : (
                  <File02 className="size-12 text-fg-quaternary" />
                )}
              </div>

              {/* Meta */}
              <div className="space-y-3 text-sm">
                <div>
                  <p className="mb-0.5 text-xs text-quaternary">Filename</p>
                  <p className="truncate text-primary">{selectedFile.file_name}</p>
                </div>
                <div>
                  <p className="mb-0.5 text-xs text-quaternary">Size</p>
                  <p className="text-secondary">{formatFileSize(selectedFile.file_size)}</p>
                </div>
                <div>
                  <p className="mb-0.5 text-xs text-quaternary">Type</p>
                  <p className="text-secondary">{selectedFile.file_type ?? "Unknown"}</p>
                </div>
                {selectedFile.folder && (
                  <div>
                    <p className="mb-0.5 text-xs text-quaternary">Folder</p>
                    <p className="text-secondary">{selectedFile.folder}</p>
                  </div>
                )}
                <div>
                  <p className="mb-0.5 text-xs text-quaternary">Uploaded</p>
                  <p className="text-xs text-secondary">
                    {new Date(selectedFile.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                {selectedFile.is_static_local && (
                  <div className="rounded-lg bg-utility-yellow-50 px-3 py-2 ring-1 ring-utility-yellow-200 ring-inset">
                    <p className="text-xs font-medium text-utility-yellow-700">Static &mdash; needs upload</p>
                    <p className="mt-0.5 text-xs text-utility-yellow-600">This file is served locally and should be uploaded to storage.</p>
                  </div>
                )}
              </div>

              {/* Alt Text */}
              <div>
                <TextArea
                  size="sm"
                  label="Alt Text"
                  placeholder="Describe this image..."
                  rows={2}
                  value={altText}
                  onChange={(value) => setAltText(value)}
                  textAreaClassName="resize-none"
                />
                <Button
                  size="sm"
                  color="secondary"
                  isLoading={savingAlt}
                  showTextWhileLoading
                  onClick={handleSaveAltText}
                  className="mt-2 w-full"
                >
                  {savingAlt ? "Saving..." : "Save Alt Text"}
                </Button>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {selectedFile.public_url && (
                  <>
                    <Button
                      size="sm"
                      color="secondary"
                      iconLeading={Download01}
                      onClick={() => handleDownloadFile(selectedFile)}
                      className="w-full"
                    >
                      Download
                    </Button>
                    <Button
                      size="sm"
                      color="secondary"
                      iconLeading={copied ? Check : Copy01}
                      onClick={() => handleCopyUrl(selectedFile.public_url!)}
                      className="w-full"
                    >
                      {copied ? "Copied!" : "Copy URL"}
                    </Button>
                  </>
                )}

                {deleteConfirm === selectedFile.id ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      color="primary-destructive"
                      isLoading={deleting}
                      showTextWhileLoading
                      onClick={() => handleDeleteFile(selectedFile.id)}
                      className="flex-1"
                    >
                      Confirm
                    </Button>
                    <Button size="sm" color="secondary" onClick={() => setDeleteConfirm(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    color="secondary-destructive"
                    iconLeading={Trash01}
                    onClick={() => setDeleteConfirm(selectedFile.id)}
                    className="w-full"
                  >
                    Delete File
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
