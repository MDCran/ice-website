"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DeleteClientButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: delError } = await supabase
      .from("client_accounts")
      .delete()
      .eq("id", clientId);

    if (delError) {
      setError(delError.message);
      setLoading(false);
      return;
    }

    router.push("/admin/clients");
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
      >
        <Trash2 size={14} />
        Delete
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="admin-card rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold admin-text">Delete Client</h3>
            <p className="text-xs text-slate-400">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-6">
          Are you sure you want to delete <strong className="admin-text">{clientName}</strong>? All associated contacts, invoices, documents, resources, and surveys will be permanently removed.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={() => setShowConfirm(false)}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
