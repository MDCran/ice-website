import { AlertCircle, Users01 } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/base/avatar/avatar";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import ClientsSearch from "@/components/admin/clients/ClientsSearch";
import CreateClientModal from "@/components/admin/clients/CreateClientModal";

export const metadata = { title: "Client Accounts | ICE Admin" };

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || undefined
  );
}

export default async function ClientsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("client_accounts")
    .select("*")
    .order("company_name", { ascending: true });

  if (q) {
    query = query.ilike("company_name", `%${q}%`);
  }

  const { data: clients, error } = await query;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FeaturedIcon icon={Users01} color="brand" theme="modern" size="lg" />
          <div>
            <h1 className="text-xl font-semibold text-primary">Client Accounts</h1>
            <p className="text-sm text-tertiary">
              {clients?.length ?? 0} total clients
            </p>
          </div>
        </div>
        <CreateClientModal />
      </div>

      <div className="mb-6 grid gap-3 rounded-xl bg-secondary p-4 ring-1 ring-secondary sm:grid-cols-3">
        {[
          ["1", "Create the account", "Add the company and primary contact."],
          ["2", "Set up access", "Invite the client and confirm their workspace."],
          ["3", "Track the relationship", "Use the account page for balance, files, and activity."],
        ].map(([step, title, description]) => (
          <div key={step} className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white">{step}</span>
            <div>
              <p className="text-sm font-semibold text-primary">{title}</p>
              <p className="mt-0.5 text-xs text-tertiary">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <ClientsSearch defaultValue={q ?? ""} />
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-utility-red-50 px-3.5 py-2.5 text-sm text-utility-red-700 ring-1 ring-utility-red-200 ring-inset">
          <AlertCircle className="size-4 shrink-0 text-utility-red-500" />
          Failed to load clients: {error.message}
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
        {clients && clients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left" aria-label="Client accounts">
              <thead className="bg-secondary">
                <tr className="h-10 text-xs font-semibold text-quaternary">
                  <th scope="col" className="px-5">Company Name</th>
                  <th scope="col" className="px-5">Status</th>
                  <th scope="col" className="px-5">Created</th>
                  <th scope="col" className="px-5 text-right"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="h-14 border-t border-secondary text-sm text-tertiary hover:bg-secondary">
                    <td className="px-5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          size="sm"
                          src={client.logo_url}
                          alt={client.company_name}
                          initials={getInitials(client.company_name ?? "")}
                        />
                        <span className="whitespace-nowrap font-medium text-primary">
                          {client.company_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5">
                      {client.is_active !== false ? (
                        <BadgeWithDot size="sm" type="pill-color" color="success">
                          Active
                        </BadgeWithDot>
                      ) : (
                        <BadgeWithDot size="sm" type="pill-color" color="gray">
                          Inactive
                        </BadgeWithDot>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5">
                      {client.created_at
                        ? new Date(client.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-5 text-right">
                      <Button color="link-color" size="sm" href={`/admin/clients/${client.id}`}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-tertiary">
              <Users01 className="size-6" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-md font-semibold text-primary">
              {q ? "No clients match your search." : "No clients found."}
            </h2>
            <p className="mt-1 max-w-sm text-sm text-tertiary">
              {q
                ? "Try adjusting your search terms."
                : "Provision a client to create their account and portal access."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
