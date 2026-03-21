"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  User,
} from "lucide-react";

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

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Add Contact
        </button>
      </div>

      {/* Contacts Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Name
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Primary Email
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Primary Phone
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(loadedContacts ?? []).length > 0 ? (
              (loadedContacts ?? []).map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center">
                        <User size={14} className="text-sky-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium admin-text">
                          {contact.first_name} {contact.last_name}
                        </div>
                        {(contact.title || contact.department) && (
                          <div className="text-xs text-slate-500">
                            {[contact.title, contact.department]
                              .filter(Boolean)
                              .join(" - ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Mail size={13} className="text-slate-500" />
                      {getPrimaryEmail(contact)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Phone size={13} className="text-slate-500" />
                      {getPrimaryPhone(contact)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(contact)}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-slate-500 text-sm"
                >
                  No contacts found. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Contact Form Modal */}
      {showForm && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
            <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold admin-text">
                  {editingContact ? "Edit Contact" : "Add Contact"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. IT Director"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. IT"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
                    />
                  </div>
                </div>

                {/* Phones */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Phone Numbers
                    </label>
                    <button
                      type="button"
                      onClick={addPhone}
                      className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      + Add Phone
                    </button>
                  </div>
                  <div className="space-y-2">
                    {phones.map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="tel"
                          value={p.phone_number}
                          onChange={(e) =>
                            updatePhone(i, "phone_number", e.target.value)
                          }
                          placeholder="(555) 123-4567"
                          className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all text-sm"
                        />
                        <select
                          value={p.label}
                          onChange={(e) =>
                            updatePhone(i, "label", e.target.value)
                          }
                          className="px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 admin-text text-sm focus:outline-none"
                        >
                          <option value="Work">Work</option>
                          <option value="Mobile">Mobile</option>
                          <option value="Home">Home</option>
                          <option value="Other">Other</option>
                        </select>
                        <label className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={p.is_primary}
                            onChange={(e) =>
                              updatePhone(i, "is_primary", e.target.checked)
                            }
                            className="rounded"
                          />
                          Primary
                        </label>
                        {phones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePhone(i)}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emails */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Email Addresses
                    </label>
                    <button
                      type="button"
                      onClick={addEmail}
                      className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      + Add Email
                    </button>
                  </div>
                  <div className="space-y-2">
                    {emails.map((em, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="email"
                          value={em.email}
                          onChange={(e) =>
                            updateEmail(i, "email", e.target.value)
                          }
                          placeholder="name@company.com"
                          className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all text-sm"
                        />
                        <select
                          value={em.label}
                          onChange={(e) =>
                            updateEmail(i, "label", e.target.value)
                          }
                          className="px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 admin-text text-sm focus:outline-none"
                        >
                          <option value="Work">Work</option>
                          <option value="Personal">Personal</option>
                          <option value="Other">Other</option>
                        </select>
                        <label className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={em.is_primary}
                            onChange={(e) =>
                              updateEmail(i, "is_primary", e.target.checked)
                            }
                            className="rounded"
                          />
                          Primary
                        </label>
                        {emails.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEmail(i)}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : null}
                    {editingContact ? "Save Changes" : "Add Contact"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
