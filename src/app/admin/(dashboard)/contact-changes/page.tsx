import { createClient } from "@/lib/supabase/server";
import { AlertTriangle } from "lucide-react";
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
  { label: string; color: string; bgColor: string }
> = {
  add: {
    label: "Add",
    color: "text-emerald-300",
    bgColor: "bg-emerald-500/20",
  },
  edit: {
    label: "Edit",
    color: "text-amber-300",
    bgColor: "bg-amber-500/20",
  },
  remove: {
    label: "Remove",
    color: "text-red-300",
    bgColor: "bg-red-500/20",
  },
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
      <div className="text-red-400">
        Failed to load contact changes: {error.message}
      </div>
    );
  }

  const typedChanges = (changes ?? []) as unknown as ContactChange[];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold admin-text">
            Pending Contact Changes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review and approve client-submitted contact changes
          </p>
        </div>
        <span className="text-sm text-slate-400">
          {typedChanges.length} pending
        </span>
      </div>

      {typedChanges.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
          <AlertTriangle size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 text-lg mb-2">No pending changes</p>
          <p className="text-slate-500 text-sm">
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
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
                    >
                      {config.label}
                    </span>
                    <div>
                      <p className="admin-text font-medium">
                        {change.client_accounts?.company_name ?? "Unknown Client"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
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
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">
                      Proposed Contact
                    </p>
                    <DataDisplay data={change.proposed_data} />
                  </div>
                )}

                {change.change_type === "edit" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {change.before_data && (
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">
                          Before
                        </p>
                        <DataDisplay data={change.before_data} />
                      </div>
                    )}
                    {change.after_data && (
                      <div>
                        <p className="text-xs text-emerald-400/70 uppercase tracking-wider mb-2 font-medium">
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
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">
                      Contact to Remove
                    </p>
                    <p className="admin-text">
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
    <div className="bg-white/[0.04] rounded-xl p-4 space-y-2">
      {Object.entries(data).map(([key, value]) => {
        const isChanged =
          highlight && compareWith && JSON.stringify(compareWith[key]) !== JSON.stringify(value);
        return (
          <div key={key} className="flex items-start gap-3 text-sm">
            <span className="text-slate-500 font-mono text-xs min-w-[120px] pt-0.5">
              {key}
            </span>
            <span
              className={`${
                isChanged
                  ? "text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded"
                  : "text-slate-300"
              }`}
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
