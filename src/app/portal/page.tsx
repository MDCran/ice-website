import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList,
  FileText,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

async function getPortalData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: clientUser, error: clientUserError } = await supabase
    .from("client_users")
    .select("client_account_id, first_name")
    .eq("id", user.id)
    .single();
  if (!clientUser) {
    console.error("[Portal] client_users lookup failed for user:", user.id, "error:", clientUserError?.message);
    return {
      companyName: "",
      userName: "",
      activeSurveysCount: 0,
      recentInvoices: [],
      noAccess: true,
      debugUserId: user.id,
      debugError: clientUserError?.message ?? "No row found",
    };
  }

  const { data: account } = await supabase
    .from("client_accounts")
    .select("company_name")
    .eq("id", clientUser.client_account_id)
    .single();

  const [activeSurveys, recentInvoices] = await Promise.all([
    supabase
      .from("surveys")
      .select("id", { count: "exact", head: true })
      .eq("client_account_id", clientUser.client_account_id)
      .eq("status", "active"),
    supabase
      .from("client_invoices")
      .select("*")
      .eq("client_account_id", clientUser.client_account_id)
      .not("status", "in", '("draft","hidden")')
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    companyName: account?.company_name ?? "Your Company",
    userName: clientUser.first_name,
    activeSurveysCount: activeSurveys.count ?? 0,
    recentInvoices: recentInvoices.data ?? [],
  };
}

export default async function PortalDashboard() {
  const data = await getPortalData();

  if ((data as any).noAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <AlertTriangle size={32} className="text-red-400" />
        </div>
        <h1 className="text-xl admin-text font-bold mb-2">No Portal Access</h1>
        <p className="text-sm text-slate-400 mb-6">Your account does not have client portal access. Contact your administrator.</p>
        <div className="text-xs text-slate-600 font-mono space-y-1">
          <p>User ID: {(data as any).debugUserId}</p>
          <p>Error: {(data as any).debugError}</p>
        </div>
      </div>
    );
  }

  const actionItems = [];
  if (data.activeSurveysCount > 0) {
    actionItems.push({
      label: `${data.activeSurveysCount} survey${data.activeSurveysCount === 1 ? "" : "s"} pending`,
      href: "/portal/surveys",
      icon: ClipboardList,
      color: "sky",
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold admin-text">
          Welcome back, {data.userName || data.companyName}
        </h1>
        <p className="text-sm text-slate-400 mt-1">{data.companyName}</p>
      </div>

      {/* Action Items */}
      {actionItems.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Action Items
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {actionItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.06] transition-colors group flex items-center gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.color === "amber"
                        ? "bg-amber-500/10"
                        : "bg-sky-500/10"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={
                        item.color === "amber"
                          ? "text-amber-400"
                          : "text-sky-400"
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        size={14}
                        className={
                          item.color === "amber"
                            ? "text-amber-400"
                            : "text-sky-400"
                        }
                      />
                      <span className="text-sm font-medium admin-text">
                        {item.label}
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-slate-500 group-hover:text-white transition-colors"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {actionItems.length === 0 && (
        <div className="mb-8 bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
            <ClipboardList size={20} className="text-emerald-400" />
          </div>
          <p className="text-sm text-slate-400">
            You&apos;re all caught up. No pending action items.
          </p>
        </div>
      )}

      {/* Recent Invoices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Recent Invoices
          </h2>
          <Link
            href="/portal/invoices"
            className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
          >
            View All
          </Link>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          {data.recentInvoices.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.recentInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-slate-500" />
                        <span className="text-sm font-medium admin-text">
                          {invoice.title || invoice.invoice_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <InvoiceStatusBadge status={invoice.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {invoice.created_at
                        ? new Date(invoice.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-12 text-center text-slate-500 text-sm">
              No invoices found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    sent: "bg-sky-500/10 text-sky-400",
    accepted: "bg-emerald-500/10 text-emerald-400",
    denied: "bg-red-500/10 text-red-400",
    paid: "bg-emerald-500/10 text-emerald-400",
    overdue: "bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        styles[status] || "bg-slate-500/10 text-slate-400"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
