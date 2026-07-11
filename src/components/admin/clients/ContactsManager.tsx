"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Edit03, Mail01, Phone01, Plus, Trash01, Users01, XClose } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/base/avatar/avatar";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { NativeSelect } from "@/components/base/select/select-native";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Table, TableCard } from "@/components/application/table/table";

interface ContactPhone {
  id: string;
  phone_number: string;
  label?: string | null;
  is_primary?: boolean;
}

interface ContactEmail {
  id: string;
  email: string;
  label?: string | null;
  is_primary?: boolean;
}

interface Contact {
  id: string;
  client_account_id: string;
  first_name: string;
  last_name: string;
  title?: string | null;
  department?: string | null;
  contact_phones: ContactPhone[];
  contact_emails: ContactEmail[];
}

interface PhoneEntry {
  phone_number: string;
  label: string;
  is_primary: boolean;
}

interface EmailEntry {
  email: string;
  label: string;
  is_primary: boolean;
}

const phoneLabelOptions = [
  { label: "Work", value: "Work" },
  { label: "Mobile", value: "Mobile" },
  { label: "Home", value: "Home" },
  { label: "Other", value: "Other" },
];

const emailLabelOptions = [
  { label: "Work", value: "Work" },
  { label: "Personal", value: "Personal" },
  { label: "Other", value: "Other" },
];

const getInitials = (first: string, last: string) =>
  `${first?.charAt(0) ?? ""}${last?.charAt(0) ?? ""}`.toUpperCase() || undefined;

export default function ContactsManager({
  clientId,
  initialContacts,
}: {
  clientId: string;
  initialContacts?: Contact[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [loadedContacts, setLoadedContacts] = useState<Contact[] | null>(initialContacts ?? null);

  // Fetch contacts if not provided as props
  useEffect(() => {
    if (initialContacts) return;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("client_contacts")
        .select("*, contact_phones(*), contact_emails(*)")
        .eq("client_account_id", clientId)
        .order("created_at", { ascending: true });
      setLoadedContacts(data ?? []);
    }
    load();
  }, [clientId, initialContacts]);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [error, setError] = useState("");

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [phones, setPhones] = useState<PhoneEntry[]>([
    { phone_number: "", label: "Work", is_primary: true },
  ]);
  const [emails, setEmails] = useState<EmailEntry[]>([
    { email: "", label: "Work", is_primary: true },
  ]);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setTitle("");
    setDepartment("");
    setPhones([{ phone_number: "", label: "Work", is_primary: true }]);
    setEmails([{ email: "", label: "Work", is_primary: true }]);
    setEditingContact(null);
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

  const openEdit = (contact: Contact) => {
    setFirstName(contact.first_name);
    setLastName(contact.last_name);
    setTitle(contact.title ?? "");
    setDepartment(contact.department ?? "");
    setPhones(
      contact.contact_phones.length > 0
        ? contact.contact_phones.map((p) => ({
            phone_number: p.phone_number,
            label: p.label ?? "Work",
            is_primary: p.is_primary ?? false,
          }))
        : [{ phone_number: "", label: "Work", is_primary: true }]
    );
    setEmails(
      contact.contact_emails.length > 0
        ? contact.contact_emails.map((e) => ({
            email: e.email,
            label: e.label ?? "Work",
            is_primary: e.is_primary ?? false,
          }))
        : [{ email: "", label: "Work", is_primary: true }]
    );
    setEditingContact(contact);
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    const supabase = createClient();

    if (editingContact) {
      // Update contact
      const { error: updateError } = await supabase
        .from("client_contacts")
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          title: title || null,
          department: department || null,
        })
        .eq("id", editingContact.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Delete existing phones/emails and re-insert
      await supabase
        .from("contact_phones")
        .delete()
        .eq("contact_id", editingContact.id);
      await supabase
        .from("contact_emails")
        .delete()
        .eq("contact_id", editingContact.id);

      const validPhones = phones.filter((p) => p.phone_number.trim());
      if (validPhones.length > 0) {
        await supabase.from("contact_phones").insert(
          validPhones.map((p) => ({
            contact_id: editingContact.id,
            phone_number: p.phone_number.trim(),
            label: p.label || "Work",
            is_primary: p.is_primary,
          }))
        );
      }

      const validEmails = emails.filter((em) => em.email.trim());
      if (validEmails.length > 0) {
        await supabase.from("contact_emails").insert(
          validEmails.map((em) => ({
            contact_id: editingContact.id,
            email: em.email.trim(),
            label: em.label || "Work",
            is_primary: em.is_primary,
          }))
        );
      }
    } else {
      // Create contact
      const { data: newContact, error: insertError } = await supabase
        .from("client_contacts")
        .insert({
          client_account_id: clientId,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          title: title || null,
          department: department || null,
        })
        .select("id")
        .single();

      if (insertError || !newContact) {
        setError(insertError?.message ?? "Failed to create contact.");
        return;
      }

      const validPhones = phones.filter((p) => p.phone_number.trim());
      if (validPhones.length > 0) {
        await supabase.from("contact_phones").insert(
          validPhones.map((p) => ({
            contact_id: newContact.id,
            phone_number: p.phone_number.trim(),
            label: p.label || "Work",
            is_primary: p.is_primary,
          }))
        );
      }

      const validEmails = emails.filter((em) => em.email.trim());
      if (validEmails.length > 0) {
        await supabase.from("contact_emails").insert(
          validEmails.map((em) => ({
            contact_id: newContact.id,
            email: em.email.trim(),
            label: em.label || "Work",
            is_primary: em.is_primary,
          }))
        );
      }
    }

    setShowForm(false);
    resetForm();
    startTransition(() => {
      router.refresh();
    });
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    const supabase = createClient();
    await supabase.from("contact_phones").delete().eq("contact_id", contactId);
    await supabase.from("contact_emails").delete().eq("contact_id", contactId);
    await supabase.from("client_contacts").delete().eq("id", contactId);

    startTransition(() => {
      router.refresh();
    });
  };

  const addPhone = () =>
    setPhones([...phones, { phone_number: "", label: "Work", is_primary: false }]);

  const removePhone = (idx: number) =>
    setPhones(phones.filter((_, i) => i !== idx));

  const updatePhone = (idx: number, field: keyof PhoneEntry, value: string | boolean) =>
    setPhones(phones.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));

  const addEmail = () =>
    setEmails([...emails, { email: "", label: "Work", is_primary: false }]);

  const removeEmail = (idx: number) =>
    setEmails(emails.filter((_, i) => i !== idx));

  const updateEmail = (idx: number, field: keyof EmailEntry, value: string | boolean) =>
    setEmails(emails.map((em, i) => (i === idx ? { ...em, [field]: value } : em)));

  const getPrimaryEmail = (contact: Contact) => {
    const primary = contact.contact_emails.find((e) => e.is_primary);
    return primary?.email ?? contact.contact_emails[0]?.email ?? "N/A";
  };

  const getPrimaryPhone = (contact: Contact) => {
    const primary = contact.contact_phones.find((p) => p.is_primary);
    return primary?.phone_number ?? contact.contact_phones[0]?.phone_number ?? "N/A";
  };

  const contacts = loadedContacts ?? [];

  return (
    <div>
      <TableCard.Root size="sm">
        <TableCard.Header
          title="Contacts"
          badge={`${contacts.length}`}
          contentTrailing={
            <Button color="primary" size="sm" iconLeading={Plus} onClick={openCreate}>
              Add Contact
            </Button>
          }
        />

        {contacts.length > 0 ? (
          <Table aria-label="Contacts" size="sm">
            <Table.Header>
              <Table.Head id="name" label="Name" isRowHeader className="w-full" />
              <Table.Head id="email" label="Primary Email" />
              <Table.Head id="phone" label="Primary Phone" />
              <Table.Head id="actions" aria-label="Actions" />
            </Table.Header>
            <Table.Body>
              {contacts.map((contact) => (
                <Table.Row id={contact.id} key={contact.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        size="sm"
                        alt={`${contact.first_name} ${contact.last_name}`}
                        initials={getInitials(contact.first_name, contact.last_name)}
                      />
                      <div>
                        <p className="text-sm font-medium whitespace-nowrap text-primary">
                          {contact.first_name} {contact.last_name}
                        </p>
                        {(contact.title || contact.department) && (
                          <p className="text-xs whitespace-nowrap text-tertiary">
                            {[contact.title, contact.department]
                              .filter(Boolean)
                              .join(" - ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Mail01 className="size-4 shrink-0 text-fg-quaternary" />
                      {getPrimaryEmail(contact)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Phone01 className="size-4 shrink-0 text-fg-quaternary" />
                      {getPrimaryPhone(contact)}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-4">
                    <div className="flex justify-end gap-0.5">
                      <ButtonUtility
                        size="xs"
                        color="tertiary"
                        tooltip="Edit"
                        icon={Edit03}
                        onClick={() => openEdit(contact)}
                      />
                      <ButtonUtility
                        size="xs"
                        color="tertiary"
                        tooltip="Delete"
                        icon={Trash01}
                        onClick={() => handleDelete(contact.id)}
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
                <EmptyState.FeaturedIcon icon={Users01} color="gray" />
              </EmptyState.Header>
              <EmptyState.Content>
                <EmptyState.Title>No contacts found</EmptyState.Title>
                <EmptyState.Description>Add one to get started.</EmptyState.Description>
              </EmptyState.Content>
            </EmptyState>
          </div>
        )}
      </TableCard.Root>

      {/* Contact Form Modal */}
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
                {editingContact ? "Edit Contact" : "Add Contact"}
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

              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" isRequired value={firstName} onChange={setFirstName} />
                <Input label="Last Name" isRequired value={lastName} onChange={setLastName} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Title" value={title} onChange={setTitle} placeholder="e.g. IT Director" />
                <Input label="Department" value={department} onChange={setDepartment} placeholder="e.g. IT" />
              </div>

              {/* Phones */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label>Phone Numbers</Label>
                  <Button color="link-color" size="sm" onClick={addPhone}>
                    + Add Phone
                  </Button>
                </div>
                {phones.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      size="sm"
                      type="tel"
                      aria-label="Phone number"
                      value={p.phone_number}
                      onChange={(value) => updatePhone(i, "phone_number", value)}
                      placeholder="(555) 123-4567"
                      className="flex-1"
                    />
                    <NativeSelect
                      aria-label="Phone label"
                      size="sm"
                      value={p.label}
                      onChange={(e) => updatePhone(i, "label", e.target.value)}
                      options={phoneLabelOptions}
                      className="w-max shrink-0"
                    />
                    <Checkbox
                      size="sm"
                      label="Primary"
                      isSelected={p.is_primary}
                      onChange={(isSelected) => updatePhone(i, "is_primary", isSelected)}
                      className="shrink-0"
                    />
                    {phones.length > 1 && (
                      <ButtonUtility
                        size="xs"
                        color="tertiary"
                        tooltip="Remove phone"
                        icon={XClose}
                        onClick={() => removePhone(i)}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Emails */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label>Email Addresses</Label>
                  <Button color="link-color" size="sm" onClick={addEmail}>
                    + Add Email
                  </Button>
                </div>
                {emails.map((em, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      size="sm"
                      type="email"
                      aria-label="Email address"
                      value={em.email}
                      onChange={(value) => updateEmail(i, "email", value)}
                      placeholder="name@company.com"
                      className="flex-1"
                    />
                    <NativeSelect
                      aria-label="Email label"
                      size="sm"
                      value={em.label}
                      onChange={(e) => updateEmail(i, "label", e.target.value)}
                      options={emailLabelOptions}
                      className="w-max shrink-0"
                    />
                    <Checkbox
                      size="sm"
                      label="Primary"
                      isSelected={em.is_primary}
                      onChange={(isSelected) => updateEmail(i, "is_primary", isSelected)}
                      className="shrink-0"
                    />
                    {emails.length > 1 && (
                      <ButtonUtility
                        size="xs"
                        color="tertiary"
                        tooltip="Remove email"
                        icon={XClose}
                        onClick={() => removeEmail(i)}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  color="primary"
                  size="md"
                  className="flex-1"
                  isDisabled={isPending}
                  isLoading={isPending}
                  showTextWhileLoading
                >
                  {editingContact ? "Save Changes" : "Add Contact"}
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
