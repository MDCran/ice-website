"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Download01, Edit03, Eye, EyeOff, File02, Trash01, UploadCloud02, XClose } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { BadgeWithIcon } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { NativeSelect } from "@/components/base/select/select-native";
import { TextArea } from "@/components/base/textarea/textarea";
import { Toggle } from "@/components/base/toggle/toggle";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { FileUploadDropZone } from "@/components/application/file-upload/file-upload-base";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Table, TableCard } from "@/components/application/table/table";

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

const visibilityOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
];

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

  const closeForm = () => {
    setShowForm(false);
    resetForm();
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
        <BadgeWithIcon size="sm" type="pill-color" color="success" iconLeading={Eye}>
          Published
        </BadgeWithIcon>
      );
    }
    return (
      <BadgeWithIcon size="sm" type="pill-color" color="gray" iconLeading={EyeOff}>
        Draft
      </BadgeWithIcon>
    );
  };

  return (
    <div>
      <TableCard.Root size="sm">
        <TableCard.Header
          title="Resources"
          badge={`${loadedResources.length}`}
          contentTrailing={
            <Button color="primary" size="sm" iconLeading={UploadCloud02} onClick={openCreate}>
              Upload Resource
            </Button>
          }
        />

        {loadedResources.length > 0 ? (
          <Table aria-label="Resources" size="sm">
            <Table.Header>
              <Table.Head id="title" label="Title" isRowHeader className="w-full" />
              <Table.Head id="author" label="Author" />
              <Table.Head id="visibility" label="Visibility" />
              <Table.Head id="download" label="Download" />
              <Table.Head id="date" label="Date" />
              <Table.Head id="actions" />
            </Table.Header>
            <Table.Body>
              {loadedResources.map((resource) => (
                <Table.Row id={resource.id} key={resource.id}>
                  <Table.Cell className="text-sm font-medium whitespace-nowrap text-primary">
                    {resource.title}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {resource.author ?? "N/A"}
                  </Table.Cell>
                  <Table.Cell>{visibilityBadge(resource.visibility ?? "draft")}</Table.Cell>
                  <Table.Cell>
                    {resource.allow_download ? (
                      <Download01 aria-label="Download allowed" className="size-4 text-fg-success-secondary" />
                    ) : (
                      <span className="text-xs text-quaternary">No</span>
                    )}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {resource.created_at
                      ? new Date(resource.created_at).toLocaleDateString()
                      : "N/A"}
                  </Table.Cell>
                  <Table.Cell className="px-4">
                    <div className="flex justify-end gap-0.5">
                      <ButtonUtility
                        size="xs"
                        color="tertiary"
                        tooltip="Edit"
                        icon={Edit03}
                        onClick={() => openEdit(resource)}
                      />
                      <ButtonUtility
                        size="xs"
                        color="tertiary"
                        tooltip="Delete"
                        icon={Trash01}
                        onClick={() => handleDelete(resource)}
                      />
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          <div className="flex justify-center px-6 py-12">
            <EmptyState size="sm">
              <EmptyState.Header>
                <EmptyState.FeaturedIcon icon={File02} color="gray" />
              </EmptyState.Header>
              <EmptyState.Content>
                <EmptyState.Title>No resources found</EmptyState.Title>
                <EmptyState.Description>Upload one to get started.</EmptyState.Description>
              </EmptyState.Content>
            </EmptyState>
          </div>
        )}
      </TableCard.Root>

      {/* Resource Form Modal */}
      <ModalOverlay
        isDismissable
        isOpen={showForm}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
      >
        <Modal className="w-full max-w-lg">
          <Dialog>
            <div className="flex items-start justify-between gap-4 px-6 pt-6">
              <h2 className="text-lg font-semibold text-primary">
                {editingResource ? "Edit Resource" : "Upload Resource"}
              </h2>
              <CloseButton size="sm" onClick={closeForm} />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 pt-5 pb-6">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-utility-red-50 px-3.5 py-2.5 text-sm text-utility-red-700 ring-1 ring-utility-red-200 ring-inset">
                  <AlertCircle className="size-4 shrink-0 text-utility-red-500" />
                  {error}
                </div>
              )}

              <Input label="Title" isRequired value={title} onChange={setTitle} />

              <TextArea
                label="Description"
                rows={3}
                value={description}
                onChange={setDescription}
                textAreaClassName="resize-none"
              />

              <Input label="Author" value={author} onChange={setAuthor} placeholder="Author name" />

              <div className="flex flex-col gap-1.5">
                <Label>PDF File</Label>
                <FileUploadDropZone
                  accept=".pdf"
                  allowsMultiple={false}
                  hint="PDF only"
                  onDropFiles={(files) => setFile(files[0] ?? null)}
                />
                {file && (
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm text-tertiary">Selected: {file.name}</p>
                    <ButtonUtility
                      size="xs"
                      color="tertiary"
                      tooltip="Remove file"
                      icon={XClose}
                      onClick={() => setFile(null)}
                    />
                  </div>
                )}
                {editingResource?.file_url && !file && (
                  <p className="text-xs text-tertiary">
                    Current file will be kept if no new file is selected.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <Toggle
                  size="sm"
                  isSelected={allowDownload}
                  onChange={setAllowDownload}
                  label="Allow Download"
                />

                <NativeSelect
                  label="Visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  options={visibilityOptions}
                  className="w-max"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  color="primary"
                  size="md"
                  className="flex-1"
                  isDisabled={isPending || uploading}
                  isLoading={isPending || uploading}
                  showTextWhileLoading
                >
                  {isPending || uploading
                    ? uploading
                      ? "Uploading..."
                      : "Saving..."
                    : editingResource
                      ? "Save Changes"
                      : "Upload Resource"}
                </Button>
                <Button type="button" color="secondary" size="md" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}
