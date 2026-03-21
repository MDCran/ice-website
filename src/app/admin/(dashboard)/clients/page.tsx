import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, Plus, Search, Building2, CheckCircle, XCircle } from "lucide-react";
import ClientsSearch from "@/components/admin/clients/ClientsSearch";
import CreateClientModal from "@/components/admin/clients/CreateClientModal";

export const metadata = { title: "Client Accounts | ICE Admin" };

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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Users size={20} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold admin-text">Client Accounts</h1>
            <p className="text-sm text-slate-400">
              {clients?.length ?? 0} total clients
            </p>
          </div>
        </div>
        <CreateClientModal />
      </div>

      <div className="mb-6">
        <ClientsSearch defaultValue={q ?? ""} />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
          Failed to load clients: {error.message}
        </div>
      )}

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Company Name
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {clients && clients.length > 0 ? (
              clients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Building2 size={16} className="text-slate-500" />
                      <span className="text-sm font-medium admin-text">
                        {client.company_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {client.is_active !== false ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                        <CheckCircle size={12} />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400">
                        <XCircle size={12} />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {client.created_at
                      ? new Date(client.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-slate-500 text-sm"
                >
                  {q ? "No clients match your search." : "No clients found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
