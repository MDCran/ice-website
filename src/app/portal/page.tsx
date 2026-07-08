import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardCheck, File02, AlertTriangle, ArrowRight, CheckCircle } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

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
        <FeaturedIcon color="error" theme="light" size="xl" icon={AlertTriangle} className="mb-4" />
        <h1 className="mb-2 text-xl font-semibold text-primary">No Portal Access</h1>
        <p className="mb-6 text-sm text-tertiary">
          Your account does not have client portal access. Contact your administrator.
        </p>
        <div className="space-y-1 font-mono text-xs text-quaternary">
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
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-display-xs font-semibold text-primary">
          Welcome back, {data.userName || data.companyName}
        </h1>
        <p className="mt-1 text-md text-tertiary">{data.companyName}</p>
      </div>

      {/* Action Items */}
      {actionItems.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-tertiary">Action Items</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {actionItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-4 rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <FeaturedIcon color="brand" theme="light" size="md" icon={ClipboardCheck} />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-primary">{item.label}</span>
                  <p className="text-sm text-tertiary">Action required</p>
                </div>
                <ArrowRight
                  aria-hidden="true"
                  className="size-5 text-fg-quaternary transition duration-100 ease-linear group-hover:text-fg-quaternary_hover"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {actionItems.length === 0 && (
        <div className="mb-8 rounded-xl bg-primary p-6 text-center shadow-xs ring-1 ring-secondary">
          <FeaturedIcon color="success" theme="light" size="md" icon={CheckCircle} className="mx-auto mb-3" />
          <p className="text-sm text-tertiary">
            You&apos;re all caught up. No pending action items.
          </p>
        </div>
      )}

      {/* Recent Invoices */}
      <div className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
        <div className="flex items-center justify-between gap-4 border-b border-secondary px-4 py-5 md:px-6">
          <h2 className="text-md font-semibold text-primary">Recent Invoices</h2>
          <Link
            href="/portal/invoices"
            className="rounded-sm text-sm font-semibold text-brand-secondary outline-focus-ring transition duration-100 ease-linear hover:text-brand-secondary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            View all
          </Link>
        </div>
        {data.recentInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr className="border-b border-secondary">
                  <th className="px-6 py-3 text-left text-xs font-semibold whitespace-nowrap text-quaternary">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold whitespace-nowrap text-quaternary">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold whitespace-nowrap text-quaternary">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.recentInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-secondary transition-colors last:border-b-0 hover:bg-secondary"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <File02 aria-hidden="true" className="size-4 text-fg-quaternary" />
                        <span className="text-sm font-medium text-primary">
                          {invoice.title || invoice.invoice_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <InvoiceStatusBadge status={invoice.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-tertiary">
                      {invoice.created_at
                        ? new Date(invoice.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-tertiary">
            No invoices found.
          </div>
        )}
      </div>
    </div>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const colors: Record<string, "brand" | "success" | "error" | "gray"> = {
    sent: "brand",
    accepted: "success",
    denied: "error",
    paid: "success",
    overdue: "error",
  };

  return (
    <Badge type="pill-color" size="sm" color={colors[status] || "gray"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
