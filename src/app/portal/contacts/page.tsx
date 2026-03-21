"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Users size={20} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold admin-text">Manage Contacts</h1>
            <p className="text-sm text-slate-400">
              Changes will be reviewed by our team before taking effect.
            </p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Contact
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Name
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mergedContacts.length > 0 ? (
              mergedContacts.map((contact) => {
                const primaryEmail = contact.contact_emails?.find(
                  (e) => e.is_primary
                );
                const primaryPhone = contact.contact_phones?.find(
                  (p) => p.is_primary
                );
                const isRemoval =
                  contact.pendingStatus === "pending_removal";
                const isPending = !!contact.pendingStatus;

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
                  <tr
                    key={contact.id}
                    className={cn(
                      "transition-colors",
                      isRemoval
                        ? "opacity-50"
                        : "hover:bg-white/[0.02]"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isRemoval
                              ? "line-through text-slate-500"
                              : "admin-text"
                          )}
                        >
                          {displayName}
                        </span>
                        {contact.pendingStatus === "pending_add" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400">
                            Pending
                          </span>
                        )}
                        {contact.pendingStatus === "pending_edit" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400">
                            Pending
                          </span>
                        )}
                        {isRemoval && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400">
                            Pending Removal
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {displayEmail ? (
                        <div className="flex items-center gap-1.5 text-sm text-slate-300">
                          <Mail size={12} className="text-slate-500" />
                          <span className={isRemoval ? "line-through" : ""}>
                            {displayEmail}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {displayPhone ? (
                        <div className="flex items-center gap-1.5 text-sm text-slate-300">
                          <Phone size={12} className="text-slate-500" />
                          <span className={isRemoval ? "line-through" : ""}>
                            {displayPhone}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!isRemoval && (
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => openEditModal(contact)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          {contact.pendingStatus !== "pending_add" && (
                            <>
                              {confirmDelete === contact.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleRemove(contact.id)}
                                    className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="px-2 py-1 rounded text-xs text-slate-400 hover:text-white transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDelete(contact.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                                  title="Remove"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-slate-500 text-sm"
                >
                  No contacts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold admin-text">
                {editingContact ? "Edit Contact" : "Add Contact"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
                  placeholder="name@company.com"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Review"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
