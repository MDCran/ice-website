"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  Loader2,
  Check,
  XCircle,
  AlertCircle,
} from "lucide-react";
import DeadlineCountdown from "@/components/portal/DeadlineCountdown";
import type { ClientInvoice } from "@/lib/types/database";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchInvoices = useCallback(async () => {
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

    const { data } = await supabase
      .from("client_invoices")
      .select("*")
      .eq("client_account_id", clientUser.client_account_id)
      .not("status", "in", '("draft","hidden")')
      .order("created_at", { ascending: false });

    setInvoices(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleAction = async (
    invoiceId: string,
    action: "accepted" | "denied"
  ) => {
    setActionLoading(invoiceId);
    setError("");
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("client_invoices")
        .update({ status: action })
        .eq("id", invoiceId);

      if (updateError) throw updateError;
      await fetchInvoices();
    } catch {
      setError(`Failed to ${action === "accepted" ? "accept" : "deny"} invoice.`);
    } finally {
      setActionLoading(null);
    }
  };

  const statusStyles: Record<string, string> = {
    sent: "bg-sky-500/10 text-sky-400",
    accepted: "bg-emerald-500/10 text-emerald-400",
    denied: "bg-red-500/10 text-red-400",
    paid: "bg-emerald-500/10 text-emerald-400",
    overdue: "bg-red-500/10 text-red-400",
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
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <FileText size={20} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold admin-text">Invoices</h1>
          <p className="text-sm text-slate-400">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
          <FileText size={32} className="text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No invoices found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => {
            const isActionable =
              invoice.status === "sent" || invoice.status === "overdue";
            const isLoading = actionLoading === invoice.id;

            return (
              <div
                key={invoice.id}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-semibold admin-text">
                        {invoice.title || invoice.invoice_number}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusStyles[invoice.status] ||
                          "bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        {invoice.status.charAt(0).toUpperCase() +
                          invoice.status.slice(1)}
                      </span>
                      {invoice.extended_days > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/10 text-violet-400">
                          Extended {invoice.extended_days} day
                          {invoice.extended_days !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      {invoice.invoice_number && (
                        <span className="font-mono">
                          #{invoice.invoice_number}
                        </span>
                      )}
                      {invoice.created_at && (
                        <span>
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {isActionable && invoice.deadline_at && (
                      <DeadlineCountdown
                        deadlineAt={invoice.deadline_at}
                        extendedDays={invoice.extended_days}
                      />
                    )}
                  </div>
                  {isActionable && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAction(invoice.id, "accepted")}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                        Accept
                      </button>
                      <button
                        onClick={() => handleAction(invoice.id, "denied")}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-400/30 hover:bg-red-500/5 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <XCircle size={14} />
                        )}
                        Deny
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
