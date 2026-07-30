import { createClient } from "@/lib/supabase/server";
import { Clock, AlertCircle } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { EmptyState } from "@/components/application/empty-state/empty-state";

export const metadata = { title: "Activity audit log | ICE Admin" };

export default async function AdminAuditPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-display-xs font-semibold text-primary">Activity audit log</h1>
        <p className="mt-1 text-sm text-tertiary">
          Who changed CMS pages, clients, and surveys — most recent 100 events.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl bg-primary p-6 ring-1 ring-secondary">
          <div className="flex items-start gap-3 text-sm text-tertiary">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning-primary" />
            <div>
              <p className="font-medium text-primary">Audit log not available yet</p>
              <p className="mt-1">
                Apply migration <code className="text-xs">20260729_admin_audit_log.sql</code> to
                enable persistence. ({error.message})
              </p>
            </div>
          </div>
        </div>
      ) : !data?.length ? (
        <div className="rounded-xl bg-primary py-12 shadow-xs ring-1 ring-secondary">
          <EmptyState size="sm">
            <EmptyState.Header>
              <EmptyState.FeaturedIcon color="gray" icon={Clock} />
            </EmptyState.Header>
            <EmptyState.Content>
              <EmptyState.Title>No activity yet</EmptyState.Title>
              <EmptyState.Description>
                Saves in the CMS editor and client provisioning will appear here.
              </EmptyState.Description>
            </EmptyState.Content>
          </EmptyState>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs text-quaternary">
              <tr>
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Actor</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Entity</th>
                <th className="px-4 py-3 font-semibold">Summary</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-t border-secondary">
                  <td className="whitespace-nowrap px-4 py-3 text-tertiary">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-secondary">{row.actor_email || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge size="sm" color="gray">
                      {row.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-tertiary">
                    {row.entity_type}
                    {row.entity_id ? `:${String(row.entity_id).slice(0, 8)}` : ""}
                  </td>
                  <td className="px-4 py-3 text-secondary">{row.summary || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
