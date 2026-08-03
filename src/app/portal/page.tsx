import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardCheck, AlertTriangle, ArrowRight, CheckCircle, BankNote01 } from "@untitledui/icons";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import PortalOnboarding from "@/components/portal/PortalOnboarding";

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
      balanceDueCents: 0,
      balanceCurrency: "USD",
      quickBooksPaymentUrl: null,
      balanceDueUpdatedAt: null,
      noAccess: true,
      debugUserId: user.id,
      debugError: clientUserError?.message ?? "No row found",
    };
  }

  const { data: account } = await supabase
    .from("client_accounts")
    .select("company_name, balance_due_cents, balance_currency, quickbooks_payment_url, balance_due_updated_at")
    .eq("id", clientUser.client_account_id)
    .single();

  const { count: activeSurveysCount } = await supabase
    .from("surveys")
    .select("id", { count: "exact", head: true })
    .eq("client_account_id", clientUser.client_account_id)
    .eq("status", "active");

  return {
    companyName: account?.company_name ?? "Your Company",
    userName: clientUser.first_name,
    activeSurveysCount: activeSurveysCount ?? 0,
    balanceDueCents: account?.balance_due_cents ?? 0,
    balanceCurrency: account?.balance_currency ?? "USD",
    quickBooksPaymentUrl: account?.quickbooks_payment_url ?? null,
    balanceDueUpdatedAt: account?.balance_due_updated_at ?? null,
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

      <PortalOnboarding
        userName={data.userName}
      />

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

      <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <FeaturedIcon color={data.balanceDueCents > 0 ? "warning" : "success"} theme="light" size="md" icon={BankNote01} />
            <div>
              <p className="text-sm font-semibold text-primary">Account balance</p>
              <p className="mt-1 text-sm text-tertiary">
                {data.balanceDueCents > 0 ? "Balance due" : "Your account is paid in full"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
              <p className="text-xl font-semibold text-primary">
              {formatCurrency(data.balanceDueCents, data.balanceCurrency)}
            </p>
            {data.balanceDueCents > 0 && data.quickBooksPaymentUrl && (
              <a
                href={data.quickBooksPaymentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
              >
                Pay balance
              </a>
            )}
          </div>
        </div>
        {data.balanceDueUpdatedAt && (
          <p className="mt-3 text-xs text-quaternary">
            Balance last updated {new Date(data.balanceDueUpdatedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}

function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format((cents || 0) / 100);
}
