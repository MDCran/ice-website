"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ChevronDown,
  Plus,
  Loader2,
  Check,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left",
          open
            ? "bg-white/[0.08] border-sky-400/60 ring-2 ring-sky-400/20"
            : "bg-white/[0.06] border-white/10 hover:border-white/20"
        )}
      >
        <div className="flex items-center gap-3">
          <User size={16} className="text-slate-400" />
          {loading ? (
            <span className="text-sm text-slate-500">Loading contacts...</span>
          ) : selectedContact ? (
            <span className="text-sm admin-text">
              {selectedContact.first_name} {selectedContact.last_name}
            </span>
          ) : (
            <span className="text-sm text-slate-500">Select a contact...</span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "text-slate-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl bg-slate-900 border border-white/10 shadow-2xl shadow-black/40 overflow-hidden">
          <div className="max-h-60 overflow-y-auto py-1">
            {contacts.length === 0 && !loading && (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">
                No contacts found
              </div>
            )}
            {contacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => handleSelect(contact.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors",
                  contact.id === value
                    ? "bg-sky-500/10 text-sky-400"
                    : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 text-xs font-medium text-slate-400">
                  {contact.first_name[0]}
                  {contact.last_name[0]}
                </div>
                <span className="flex-1">
                  {contact.first_name} {contact.last_name}
                </span>
                {contact.id === value && (
                  <Check size={14} className="text-sky-400 shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Add New Contact */}
          {allowAdd && (
            <div className="border-t border-white/10">
              {showAddForm ? (
                <form
                  onSubmit={handleAddSubmit}
                  className="p-4 space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      New Contact
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={addForm.first_name}
                      onChange={(e) =>
                        setAddForm({ ...addForm, first_name: e.target.value })
                      }
                      required
                      placeholder="First name"
                      className="px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 admin-text text-sm placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 transition-all"
                    />
                    <input
                      type="text"
                      value={addForm.last_name}
                      onChange={(e) =>
                        setAddForm({ ...addForm, last_name: e.target.value })
                      }
                      required
                      placeholder="Last name"
                      className="px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 admin-text text-sm placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 transition-all"
                    />
                  </div>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) =>
                      setAddForm({ ...addForm, email: e.target.value })
                    }
                    placeholder="Email address"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 admin-text text-sm placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 transition-all"
                  />
                  <input
                    type="tel"
                    value={addForm.phone}
                    onChange={(e) =>
                      setAddForm({ ...addForm, phone: e.target.value })
                    }
                    placeholder="Phone number"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 admin-text text-sm placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 transition-all"
                  />
                  {addError && (
                    <p className="text-xs text-red-400">{addError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={addSubmitting}
                    className="w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {addSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit for Review"
                    )}
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-sky-400 hover:bg-sky-500/5 transition-colors"
                >
                  <Plus size={16} />
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
