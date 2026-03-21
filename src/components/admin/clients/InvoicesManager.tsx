"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Pencil,
  X,
  Loader2,
  AlertCircle,
  Upload,
  Eye,
  EyeOff,
  Ban,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
} from "lucide-react";

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

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-slate-500/10", text: "text-slate-400", label: "Draft" },
  active: { bg: "bg-sky-500/10", text: "text-sky-400", label: "Active" },
  accepted: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Accepted" },
  denied: { bg: "bg-red-500/10", text: "text-red-400", label: "Denied" },
  void: { bg: "bg-gray-500/10", text: "text-gray-400", label: "Void" },
  pending: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Pending" },
};

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
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
      >
        {cfg.label}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Create Invoice
        </button>
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Title
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Deadline
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Extended
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Hidden
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loadedInvoices.length > 0 ? (
              loadedInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium admin-text">
                    {invoice.title}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(invoice.status ?? "draft")}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {invoice.deadline
                      ? new Date(invoice.deadline).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {invoice.extended_days
                      ? `+${invoice.extended_days} days`
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    {invoice.is_hidden ? (
                      <EyeOff size={14} className="text-slate-500" />
                    ) : (
                      <Eye size={14} className="text-emerald-400" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {invoice.created_at
                      ? new Date(invoice.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEdit(invoice)}
                      className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-slate-500 text-sm"
                >
                  No invoices found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice Form Modal */}
      {showForm && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[5vh] overflow-y-auto">
            <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold admin-text">
                  {editingInvoice ? "Edit Invoice" : "Create Invoice"}
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

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    PDF File
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20 transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      <Calendar size={12} className="inline mr-1" />
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none text-sm"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="accepted">Accepted</option>
                      <option value="denied">Denied</option>
                      <option value="pending">Pending</option>
                      <option value="void">Void</option>
                    </select>
                  </div>
                </div>

                {/* Edit-only fields */}
                {editingInvoice && (
                  <>
                    <div className="border-t border-white/10 pt-5">
                      <h3 className="text-sm font-semibold admin-text mb-4">
                        Advanced Options
                      </h3>

                      <div className="mb-4">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          <Clock size={12} className="inline mr-1" />
                          Extend Deadline (days)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={extendDays}
                          onChange={(e) =>
                            setExtendDays(parseInt(e.target.value) || 0)
                          }
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
                        />
                        {extendedDeadline && (
                          <p className="text-xs text-sky-400 mt-1">
                            New deadline: {new Date(extendedDeadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => quickAction(editingInvoice.id, "accepted")}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                        >
                          <CheckCircle size={14} />
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => quickAction(editingInvoice.id, "denied")}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
                        >
                          <XCircle size={14} />
                          Deny
                        </button>
                        <button
                          type="button"
                          onClick={() => quickAction(editingInvoice.id, "void")}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-500/10 text-gray-400 text-xs font-medium hover:bg-gray-500/20 transition-colors"
                        >
                          <Ban size={14} />
                          Void
                        </button>
                      </div>

                      <div className="flex items-center gap-6 mt-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={isHidden}
                              onChange={(e) => setIsHidden(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-6 rounded-full bg-white/10 peer-checked:bg-sky-500 transition-colors" />
                            <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
                          </div>
                          <span className="text-sm text-slate-300">
                            {isHidden ? "Hidden" : "Visible"}
                          </span>
                        </label>

                        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={secretEdit}
                            onChange={(e) => setSecretEdit(e.target.checked)}
                            className="rounded border-white/20"
                          />
                          Secret Edit
                        </label>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isPending || uploading}
                    className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isPending || uploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {uploading ? "Uploading..." : "Saving..."}
                      </>
                    ) : editingInvoice ? (
                      "Save Changes"
                    ) : (
                      "Create Invoice"
                    )}
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
