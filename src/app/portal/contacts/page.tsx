"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit01, Trash01, AlertCircle, Phone01, Mail01 } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { Table, TableCard } from "@/components/application/table/table";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { cx } from "@/utils/cx";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  is_primary: boolean;
  pendingStatus?: "pending_add" | "pending_edit" | "pending_removal";
  contact_phones: { id: string; phone_number: string; is_primary: boolean }[];
  contact_emails: { id: string; email_address: string; is_primary: boolean }[];
}

interface PendingChange {
  id: string;
  change_type: string;
  contact_id: string | null;
  proposed_data: Record<string, unknown>;
  status: string;
}

interface MergedContact extends Contact {
  pendingStatus?: "pending_add" | "pending_edit" | "pending_removal";
  pendingData?: Record<string, unknown>;
}

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

const emptyForm: FormData = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [accountId, setAccountId] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Confirm delete state
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
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

    setAccountId(clientUser.client_account_id);
    setUserId(user.id);

    const [contactsResult, changesResult] = await Promise.all([
      supabase
        .from("client_contacts")
        .select(
          `*, contact_phones(*), contact_emails(*)`
        )
        .eq("client_account_id", clientUser.client_account_id)
        .order("last_name", { ascending: true }),
      supabase
        .from("client_contact_changes")
        .select("*")
        .eq("client_account_id", clientUser.client_account_id)
        .eq("status", "pending"),
    ]);

    setContacts(contactsResult.data ?? []);
    setPendingChanges(changesResult.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Merge contacts with pending changes for display
  const mergedContacts: MergedContact[] = (() => {
    const result: MergedContact[] = [];

    // Existing contacts with pending edits/removals
    for (const contact of contacts) {
      const removal = pendingChanges.find(
        (c) => c.contact_id === contact.id && c.change_type === "remove"
      );
      const edit = pendingChanges.find(
        (c) => c.contact_id === contact.id && c.change_type === "update"
      );

      if (removal) {
        result.push({ ...contact, pendingStatus: "pending_removal" });
      } else if (edit) {
        result.push({
          ...contact,
          pendingStatus: "pending_edit",
          pendingData: edit.proposed_data,
        });
      } else {
        result.push(contact);
      }
    }

    // Pending adds (new contacts not yet approved)
    const adds = pendingChanges.filter((c) => c.change_type === "add");
    for (const add of adds) {
      const data = add.proposed_data;
      result.push({
        id: add.id,
        first_name: (data.first_name as string) || "",
        last_name: (data.last_name as string) || "",
        title: null,
        is_primary: false,
        contact_phones: data.phone
          ? [
              {
                id: "pending",
                phone_number: data.phone as string,
                is_primary: true,
              },
            ]
          : [],
        contact_emails: data.email
          ? [
              {
                id: "pending",
                email_address: data.email as string,
                is_primary: true,
              },
            ]
          : [],
        pendingStatus: "pending_add",
        pendingData: data,
      });
    }

    return result;
  })();

  const openAddModal = () => {
    setEditingContact(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (contact: MergedContact) => {
    setEditingContact(contact);
    const primaryPhone = contact.contact_phones?.find((p) => p.is_primary);
    const primaryEmail = contact.contact_emails?.find((e) => e.is_primary);
    setFormData({
      first_name:
        contact.pendingStatus === "pending_edit" && contact.pendingData
          ? (contact.pendingData.first_name as string) || contact.first_name
          : contact.first_name,
      last_name:
        contact.pendingStatus === "pending_edit" && contact.pendingData
          ? (contact.pendingData.last_name as string) || contact.last_name
          : contact.last_name,
      phone:
        contact.pendingStatus === "pending_edit" && contact.pendingData
          ? (contact.pendingData.phone as string) ||
            primaryPhone?.phone_number ||
            ""
          : primaryPhone?.phone_number || "",
      email:
        contact.pendingStatus === "pending_edit" && contact.pendingData
          ? (contact.pendingData.email as string) ||
            primaryEmail?.email_address ||
            ""
          : primaryEmail?.email_address || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const supabase = createClient();

      if (editingContact && editingContact.pendingStatus !== "pending_add") {
        // Create an update change request
        await supabase.from("client_contact_changes").insert({
          account_id: accountId,
          submitted_by: userId,
          change_type: "update",
          contact_id: editingContact.id,
          proposed_data: formData,
          status: "pending",
        });
      } else {
        // Create an add change request
        await supabase.from("client_contact_changes").insert({
          account_id: accountId,
          submitted_by: userId,
          change_type: "add",
          contact_id: null,
          proposed_data: formData,
          status: "pending",
        });
      }

      setShowModal(false);
      await fetchData();
    } catch {
      setError("Failed to submit change request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (contactId: string) => {
    try {
      const supabase = createClient();
      await supabase.from("client_contact_changes").insert({
        account_id: accountId,
        submitted_by: userId,
        change_type: "remove",
        contact_id: contactId,
        proposed_data: {},
        status: "pending",
      });
      setConfirmDelete(null);
      await fetchData();
    } catch {
      setError("Failed to submit removal request.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingIndicator type="line-spinner" size="md" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display-xs font-semibold text-primary">Manage Contacts</h1>
          <p className="mt-1 text-md text-tertiary">
            Changes will be reviewed by our team before taking effect.
          </p>
        </div>
        <Button size="md" color="primary" iconLeading={Plus} onClick={openAddModal}>
          Add Contact
        </Button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-error-primary p-3 text-sm font-medium text-error-primary ring-1 ring-error_subtle ring-inset">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      <TableCard.Root>
        <Table aria-label="Contacts">
          <Table.Header>
            <Table.Head id="name" isRowHeader label="Name" className="w-full" />
            <Table.Head id="email" label="Email" />
            <Table.Head id="phone" label="Phone" />
            <Table.Head id="actions" aria-label="Actions" className="text-right" />
          </Table.Header>
          <Table.Body
            items={mergedContacts}
            renderEmptyState={() => (
              <div className="px-6 py-12 text-center text-sm text-tertiary">
                No contacts found.
              </div>
            )}
          >
            {(contact) => {
              const primaryEmail = contact.contact_emails?.find(
                (e) => e.is_primary
              );
              const primaryPhone = contact.contact_phones?.find(
                (p) => p.is_primary
              );
              const isRemoval = contact.pendingStatus === "pending_removal";

              // Display values — show pending data if edit
              const displayName =
                contact.pendingStatus === "pending_edit" && contact.pendingData
                  ? `${contact.pendingData.first_name || contact.first_name} ${contact.pendingData.last_name || contact.last_name}`
                  : `${contact.first_name} ${contact.last_name}`;
              const displayEmail =
                contact.pendingStatus === "pending_edit" && contact.pendingData
                  ? (contact.pendingData.email as string) ||
                    primaryEmail?.email_address
                  : primaryEmail?.email_address;
              const displayPhone =
                contact.pendingStatus === "pending_edit" && contact.pendingData
                  ? (contact.pendingData.phone as string) ||
                    primaryPhone?.phone_number
                  : primaryPhone?.phone_number;

              return (
                <Table.Row id={contact.id} className={cx(isRemoval && "opacity-50")}>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <span
                        className={cx(
                          "text-sm font-medium",
                          isRemoval ? "text-tertiary line-through" : "text-primary"
                        )}
                      >
                        {displayName}
                      </span>
                      {(contact.pendingStatus === "pending_add" ||
                        contact.pendingStatus === "pending_edit") && (
                        <Badge type="pill-color" size="sm" color="warning">
                          Pending
                        </Badge>
                      )}
                      {isRemoval && (
                        <Badge type="pill-color" size="sm" color="error">
                          Pending Removal
                        </Badge>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {displayEmail ? (
                      <div className="flex items-center gap-1.5 text-sm text-tertiary">
                        <Mail01 aria-hidden="true" className="size-3.5 text-fg-quaternary" />
                        <span className={isRemoval ? "line-through" : ""}>
                          {displayEmail}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-quaternary">-</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {displayPhone ? (
                      <div className="flex items-center gap-1.5 text-sm text-tertiary">
                        <Phone01 aria-hidden="true" className="size-3.5 text-fg-quaternary" />
                        <span className={isRemoval ? "line-through" : ""}>
                          {displayPhone}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-quaternary">-</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {!isRemoval && (
                      <div className="flex items-center justify-end gap-1">
                        <ButtonUtility
                          size="xs"
                          color="tertiary"
                          icon={Edit01}
                          tooltip="Edit"
                          onClick={() => openEditModal(contact)}
                        />
                        {contact.pendingStatus !== "pending_add" && (
                          <>
                            {confirmDelete === contact.id ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  color="primary-destructive"
                                  onClick={() => handleRemove(contact.id)}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  color="tertiary"
                                  onClick={() => setConfirmDelete(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <ButtonUtility
                                size="xs"
                                color="tertiary"
                                icon={Trash01}
                                tooltip="Remove"
                                onClick={() => setConfirmDelete(contact.id)}
                              />
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </Table.Cell>
                </Table.Row>
              );
            }}
          </Table.Body>
        </Table>
      </TableCard.Root>

      {/* Modal */}
      <ModalOverlay isDismissable isOpen={showModal} onOpenChange={setShowModal}>
        <Modal className="w-full max-w-md">
          <Dialog>
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-primary">
                  {editingContact ? "Edit Contact" : "Add Contact"}
                </h2>
                <CloseButton size="sm" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="First Name"
                  value={formData.first_name}
                  onChange={(v) => setFormData({ ...formData, first_name: v })}
                  isRequired
                />
                <Input
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(v) => setFormData({ ...formData, last_name: v })}
                  isRequired
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(v) => setFormData({ ...formData, phone: v })}
                  placeholder="(555) 123-4567"
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(v) => setFormData({ ...formData, email: v })}
                  placeholder="name@company.com"
                />
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    color="secondary"
                    size="md"
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    size="md"
                    className="flex-1"
                    isLoading={submitting}
                    showTextWhileLoading
                  >
                    {submitting ? "Submitting..." : "Submit for Review"}
                  </Button>
                </div>
              </form>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}
