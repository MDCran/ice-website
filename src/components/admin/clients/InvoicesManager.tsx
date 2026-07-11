"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Edit03, Eye, EyeOff, Plus, Receipt, SlashCircle01, XCircle, XClose } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import type { BadgeColor } from "@/components/base/badges/badges";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { NativeSelect } from "@/components/base/select/select-native";
import { TextArea } from "@/components/base/textarea/textarea";
import { Toggle } from "@/components/base/toggle/toggle";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { FileUploadDropZone } from "@/components/application/file-upload/file-upload-base";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Table, TableCard } from "@/components/application/table/table";

interface Invoice {
  id: string;
  client_account_id: string;
  title: string;
  description?: string | null;
  file_url?: string | null;
  deadline?: string | null;
  extended_days?: number | null;
  status?: string;
  is_hidden?: boolean;
  secret_edit?: boolean;
  created_at?: string;
}

const statusConfig: Record<string, { color: BadgeColor<"pill-color">; label: string }> = {
  draft: { color: "gray", label: "Draft" },
  active: { color: "blue", label: "Active" },
  accepted: { color: "success", label: "Accepted" },
  denied: { color: "error", label: "Denied" },
  void: { color: "gray", label: "Void" },
  pending: { color: "warning", label: "Pending" },
};

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Accepted", value: "accepted" },
  { label: "Denied", value: "denied" },
  { label: "Pending", value: "pending" },
  { label: "Void", value: "void" },
];

export default function InvoicesManager({
  clientId,
  initialInvoices,
}: {
  clientId: string;
  initialInvoices?: Invoice[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loadedInvoices, setLoadedInvoices] = useState<Invoice[]>(initialInvoices ?? []);

  useEffect(() => {
    if (initialInvoices) return;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("client_invoices")
        .select("*")
        .eq("client_account_id", clientId)
        .order("created_at", { ascending: false });
      setLoadedInvoices(data ?? []);
    }
    load();
  }, [clientId, initialInvoices]);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("draft");
  const [extendDays, setExtendDays] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [secretEdit, setSecretEdit] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const extendedDeadline = useMemo(() => {
    if (!deadline || extendDays <= 0) return null;
    const d = new Date(deadline);
    d.setDate(d.getDate() + extendDays);
    return d.toISOString().split("T")[0];
  }, [deadline, extendDays]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setStatus("draft");
    setExtendDays(0);
    setIsHidden(false);
    setSecretEdit(false);
    setFile(null);
    setEditingInvoice(null);
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

  const openEdit = (invoice: Invoice) => {
    setTitle(invoice.title);
    setDescription(invoice.description ?? "");
    setDeadline(invoice.deadline?.split("T")[0] ?? "");
    setStatus(invoice.status ?? "draft");
    setExtendDays(invoice.extended_days ?? 0);
    setIsHidden(invoice.is_hidden ?? false);
    setSecretEdit(invoice.secret_edit ?? false);
    setFile(null);
    setEditingInvoice(invoice);
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
    let fileUrl = editingInvoice?.file_url ?? null;

    if (file) {
      setUploading(true);
      const filename = `${Date.now()}-${file.name}`;
      const path = `invoices/${clientId}/${filename}`;

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

    const payload: Record<string, unknown> = {
      title: title.trim(),
      description: description || null,
      file_url: fileUrl,
      deadline: deadline || null,
      status,
      is_hidden: isHidden,
      secret_edit: secretEdit,
    };

    if (editingInvoice && extendDays > 0) {
      payload.extended_days = (editingInvoice.extended_days ?? 0) + extendDays;
      if (extendedDeadline) {
        payload.deadline = extendedDeadline;
      }
    }

    if (editingInvoice) {
      const { error: updateError } = await supabase
        .from("client_invoices")
        .update(payload)
        .eq("id", editingInvoice.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("client_invoices")
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

  const quickAction = async (invoiceId: string, newStatus: string) => {
    const supabase = createClient();
    await supabase
      .from("client_invoices")
      .update({ status: newStatus })
      .eq("id", invoiceId);

    startTransition(() => {
      router.refresh();
    });
  };

  const getStatusBadge = (s: string) => {
    const cfg = statusConfig[s] ?? statusConfig.draft;
    return (
      <Badge size="sm" type="pill-color" color={cfg.color}>
        {cfg.label}
      </Badge>
    );
  };

  return (
    <div>
      <TableCard.Root size="sm">
        <TableCard.Header
          title="Invoices"
          badge={`${loadedInvoices.length}`}
          contentTrailing={
            <Button color="primary" size="sm" iconLeading={Plus} onClick={openCreate}>
              Create Invoice
            </Button>
          }
        />

        {loadedInvoices.length > 0 ? (
          <Table aria-label="Invoices" size="sm">
            <Table.Header>
              <Table.Head id="title" label="Title" isRowHeader className="w-full" />
              <Table.Head id="status" label="Status" />
              <Table.Head id="deadline" label="Deadline" />
              <Table.Head id="extended" label="Extended" />
              <Table.Head id="hidden" label="Hidden" />
              <Table.Head id="date" label="Date" />
              <Table.Head id="actions" aria-label="Actions" />
            </Table.Header>
            <Table.Body>
              {loadedInvoices.map((invoice) => (
                <Table.Row id={invoice.id} key={invoice.id}>
                  <Table.Cell className="text-sm font-medium whitespace-nowrap text-primary">
                    {invoice.title}
                  </Table.Cell>
                  <Table.Cell>{getStatusBadge(invoice.status ?? "draft")}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {invoice.deadline
                      ? new Date(invoice.deadline).toLocaleDateString()
                      : "N/A"}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {invoice.extended_days
                      ? `+${invoice.extended_days} days`
                      : "-"}
                  </Table.Cell>
                  <Table.Cell>
                    {invoice.is_hidden ? (
                      <EyeOff aria-label="Hidden" className="size-4 text-fg-quaternary" />
                    ) : (
                      <Eye aria-label="Visible" className="size-4 text-fg-success-secondary" />
                    )}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {invoice.created_at
                      ? new Date(invoice.created_at).toLocaleDateString()
                      : "N/A"}
                  </Table.Cell>
                  <Table.Cell className="px-4">
                    <div className="flex justify-end">
                      <ButtonUtility
                        size="xs"
                        color="tertiary"
                        tooltip="Edit"
                        icon={Edit03}
                        onClick={() => openEdit(invoice)}
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
                <EmptyState.FeaturedIcon icon={Receipt} color="gray" />
              </EmptyState.Header>
              <EmptyState.Content>
                <EmptyState.Title>No invoices found</EmptyState.Title>
                <EmptyState.Description>Create one to get started.</EmptyState.Description>
              </EmptyState.Content>
            </EmptyState>
          </div>
        )}
      </TableCard.Root>

      {/* Invoice Form Modal */}
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
                {editingInvoice ? "Edit Invoice" : "Create Invoice"}
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
                {editingInvoice?.file_url && !file && (
                  <p className="text-xs text-tertiary">
                    Current file will be kept if no new file is selected.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Deadline"
                  type="date"
                  value={deadline}
                  onChange={setDeadline}
                />

                <NativeSelect
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={statusOptions}
                />
              </div>

              {/* Edit-only fields */}
              {editingInvoice && (
                <div className="border-t border-secondary pt-5">
                  <h3 className="mb-4 text-sm font-semibold text-primary">
                    Advanced Options
                  </h3>

                  <div className="mb-4">
                    <Input
                      label="Extend Deadline (days)"
                      type="number"
                      value={String(extendDays)}
                      onChange={(value) => setExtendDays(Math.max(0, parseInt(value) || 0))}
                      hint={
                        extendedDeadline
                          ? `New deadline: ${new Date(extendedDeadline).toLocaleDateString()}`
                          : undefined
                      }
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      color="secondary"
                      size="sm"
                      iconLeading={CheckCircle}
                      onClick={() => quickAction(editingInvoice.id, "accepted")}
                    >
                      Accept
                    </Button>
                    <Button
                      color="secondary-destructive"
                      size="sm"
                      iconLeading={XCircle}
                      onClick={() => quickAction(editingInvoice.id, "denied")}
                    >
                      Deny
                    </Button>
                    <Button
                      color="secondary"
                      size="sm"
                      iconLeading={SlashCircle01}
                      onClick={() => quickAction(editingInvoice.id, "void")}
                    >
                      Void
                    </Button>
                  </div>

                  <div className="mt-4 flex items-center gap-6">
                    <Toggle
                      size="sm"
                      isSelected={isHidden}
                      onChange={setIsHidden}
                      label={isHidden ? "Hidden" : "Visible"}
                    />

                    <Checkbox
                      size="sm"
                      label="Secret Edit"
                      isSelected={secretEdit}
                      onChange={setSecretEdit}
                    />
                  </div>
                </div>
              )}

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
                    : editingInvoice
                      ? "Save Changes"
                      : "Create Invoice"}
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
