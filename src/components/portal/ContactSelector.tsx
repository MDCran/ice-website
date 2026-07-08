"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronDown, Plus, Check, User01, XClose } from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { cx } from "@/utils/cx";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
}

interface ContactSelectorProps {
  clientAccountId: string;
  value: string | null;
  onChange: (contactId: string | null) => void;
  allowAdd?: boolean;
}

export default function ContactSelector({
  clientAccountId,
  value,
  onChange,
  allowAdd = false,
}: ContactSelectorProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchContacts = useCallback(async () => {
    if (!clientAccountId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("client_contacts")
      .select("id, first_name, last_name")
      .eq("account_id", clientAccountId)
      .order("last_name", { ascending: true });

    setContacts(data ?? []);
    setLoading(false);
  }, [clientAccountId]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedContact = contacts.find((c) => c.id === value);

  const handleSelect = (contactId: string) => {
    onChange(contactId);
    setOpen(false);
    setShowAddForm(false);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSubmitting(true);
    setAddError("");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: insertError } = await supabase
        .from("client_contact_changes")
        .insert({
          account_id: clientAccountId,
          submitted_by: user.id,
          change_type: "add",
          contact_id: null,
          proposed_data: addForm,
          status: "pending",
        });

      if (insertError) throw insertError;

      setShowAddForm(false);
      setAddForm({ first_name: "", last_name: "", email: "", phone: "" });
      await fetchContacts();
    } catch {
      setAddError("Failed to add contact. Please try again.");
    } finally {
      setAddSubmitting(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cx(
          "flex w-full cursor-pointer items-center justify-between rounded-lg bg-primary px-3.5 py-2.5 text-left shadow-xs ring-1 ring-inset transition duration-100 ease-linear outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2",
          open ? "ring-2 ring-brand" : "ring-primary hover:bg-primary_hover",
        )}
      >
        <div className="flex items-center gap-3">
          <User01 aria-hidden="true" className="size-5 text-fg-quaternary" />
          {loading ? (
            <span className="text-md text-placeholder">Loading contacts...</span>
          ) : selectedContact ? (
            <span className="text-md text-primary">
              {selectedContact.first_name} {selectedContact.last_name}
            </span>
          ) : (
            <span className="text-md text-placeholder">Select a contact...</span>
          )}
        </div>
        <ChevronDown
          aria-hidden="true"
          className={cx(
            "size-5 text-fg-quaternary transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg bg-primary shadow-lg ring-1 ring-secondary_alt">
          <div className="max-h-60 overflow-y-auto py-1">
            {contacts.length === 0 && !loading && (
              <div className="px-4 py-3 text-center text-sm text-tertiary">
                No contacts found
              </div>
            )}
            {contacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => handleSelect(contact.id)}
                className={cx(
                  "flex w-full cursor-pointer items-center gap-3 px-3.5 py-2.5 text-left text-sm transition duration-100 ease-linear",
                  contact.id === value
                    ? "bg-active font-semibold text-secondary_hover"
                    : "font-medium text-secondary hover:bg-primary_hover hover:text-secondary_hover",
                )}
              >
                <Avatar
                  size="xs"
                  initials={`${contact.first_name[0] ?? ""}${contact.last_name[0] ?? ""}`}
                  alt={`${contact.first_name} ${contact.last_name}`}
                />
                <span className="flex-1">
                  {contact.first_name} {contact.last_name}
                </span>
                {contact.id === value && (
                  <Check aria-hidden="true" className="size-4 shrink-0 stroke-[2.25px] text-fg-brand-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Add New Contact */}
          {allowAdd && (
            <div className="border-t border-secondary">
              {showAddForm ? (
                <form
                  onSubmit={handleAddSubmit}
                  className="space-y-3 p-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-semibold text-secondary">
                      New Contact
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      aria-label="Close new contact form"
                      className="cursor-pointer rounded-md p-1 text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      <XClose className="size-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      size="sm"
                      value={addForm.first_name}
                      onChange={(v) => setAddForm({ ...addForm, first_name: v })}
                      isRequired
                      placeholder="First name"
                      aria-label="First name"
                    />
                    <Input
                      size="sm"
                      value={addForm.last_name}
                      onChange={(v) => setAddForm({ ...addForm, last_name: v })}
                      isRequired
                      placeholder="Last name"
                      aria-label="Last name"
                    />
                  </div>
                  <Input
                    size="sm"
                    type="email"
                    value={addForm.email}
                    onChange={(v) => setAddForm({ ...addForm, email: v })}
                    placeholder="Email address"
                    aria-label="Email address"
                  />
                  <Input
                    size="sm"
                    type="tel"
                    value={addForm.phone}
                    onChange={(v) => setAddForm({ ...addForm, phone: v })}
                    placeholder="Phone number"
                    aria-label="Phone number"
                  />
                  {addError && (
                    <p className="text-sm text-error-primary">{addError}</p>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    color="primary"
                    className="w-full"
                    isLoading={addSubmitting}
                    showTextWhileLoading
                  >
                    {addSubmitting ? "Submitting..." : "Submit for Review"}
                  </Button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="flex w-full cursor-pointer items-center gap-2 px-3.5 py-2.5 text-sm font-semibold text-brand-secondary transition duration-100 ease-linear hover:bg-primary_hover hover:text-brand-secondary_hover"
                >
                  <Plus className="size-4 stroke-[2.25px]" aria-hidden="true" />
                  Add New Contact
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
