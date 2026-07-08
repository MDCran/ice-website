import { createClient } from "@/lib/supabase/server";
import { CheckCircle } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import ChangeActions from "./ChangeActions";

interface ContactChange {
  id: string;
  change_type: "add" | "edit" | "remove";
  proposed_data: Record<string, unknown> | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  contact_name: string | null;
  status: string;
  created_at: string;
  client_account_id: string;
  client_accounts: { company_name: string } | null;
}

const changeTypeConfig: Record<
  string,
  { label: string; color: "success" | "warning" | "error" }
> = {
  add: { label: "Add", color: "success" },
  edit: { label: "Edit", color: "warning" },
  remove: { label: "Remove", color: "error" },
};

export default async function ContactChangesPage() {
  const supabase = await createClient();
  const { data: changes, error } = await supabase
    .from("client_contact_changes")
    .select("*, client_accounts(company_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-sm text-error-primary">
        Failed to load contact changes: {error.message}
      </div>
    );
  }

  const typedChanges = (changes ?? []) as unknown as ContactChange[];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-display-xs font-semibold text-primary">
            Pending Contact Changes
          </h1>
          <p className="mt-1 text-sm text-tertiary">
            Review and approve client-submitted contact changes
          </p>
        </div>
        <Badge size="md" color="gray">
          {typedChanges.length} pending
        </Badge>
      </div>

      {typedChanges.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-primary px-6 py-16 text-center shadow-xs ring-1 ring-secondary">
          <FeaturedIcon color="success" theme="modern" size="lg" icon={CheckCircle} />
          <p className="mt-4 text-md font-semibold text-primary">No pending changes</p>
          <p className="mt-1 text-sm text-tertiary">
            All client contact changes have been reviewed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {typedChanges.map((change) => {
            const config =
              changeTypeConfig[change.change_type] ?? changeTypeConfig.edit;
            return (
              <div
                key={change.id}
                className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Badge size="sm" color={config.color}>
                      {config.label}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-primary">
                        {change.client_accounts?.company_name ?? "Unknown Client"}
                      </p>
                      <p className="mt-0.5 text-xs text-tertiary">
                        {new Date(change.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <ChangeActions changeId={change.id} />
                </div>

                {/* Change Details */}
                {change.change_type === "add" && change.proposed_data && (
                  <div>
                    <p className="mb-2 text-xs font-semibold tracking-wider text-quaternary uppercase">
                      Proposed Contact
                    </p>
                    <DataDisplay data={change.proposed_data} />
                  </div>
                )}

                {change.change_type === "edit" && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {change.before_data && (
                      <div>
                        <p className="mb-2 text-xs font-semibold tracking-wider text-quaternary uppercase">
                          Before
                        </p>
                        <DataDisplay data={change.before_data} />
                      </div>
                    )}
                    {change.after_data && (
                      <div>
                        <p className="mb-2 text-xs font-semibold tracking-wider text-success-primary uppercase">
                          After
                        </p>
                        <DataDisplay
                          data={change.after_data}
                          highlight
                          compareWith={change.before_data ?? undefined}
                        />
                      </div>
                    )}
                  </div>
                )}

                {change.change_type === "remove" && (
                  <div>
                    <p className="mb-2 text-xs font-semibold tracking-wider text-quaternary uppercase">
                      Contact to Remove
                    </p>
                    <p className="text-sm text-primary">
                      {change.contact_name ?? "Unknown contact"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DataDisplay({
  data,
  highlight,
  compareWith,
}: {
  data: Record<string, unknown>;
  highlight?: boolean;
  compareWith?: Record<string, unknown>;
}) {
  return (
    <div className="space-y-2 rounded-lg bg-secondary p-4">
      {Object.entries(data).map(([key, value]) => {
        const isChanged =
          highlight && compareWith && JSON.stringify(compareWith[key]) !== JSON.stringify(value);
        return (
          <div key={key} className="flex items-start gap-3 text-sm">
            <span className="min-w-30 pt-0.5 font-mono text-xs text-quaternary">
              {key}
            </span>
            <span
              className={
                isChanged
                  ? "rounded bg-utility-green-50 px-1.5 py-0.5 text-utility-green-700 ring-1 ring-utility-green-200 ring-inset"
                  : "text-secondary"
              }
            >
              {typeof value === "object"
                ? JSON.stringify(value)
                : String(value ?? "—")}
            </span>
          </div>
        );
      })}
    </div>
  );
}
