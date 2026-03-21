import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  Eye,
  ExternalLink,
} from "lucide-react";

export const metadata = { title: "Client Surveys | ICE Admin" };

const statusBadge: Record<string, { bg: string; text: string }> = {
  draft: { bg: "bg-slate-500/10", text: "text-slate-400" },
  active: { bg: "bg-sky-500/10", text: "text-sky-400" },
  completed: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  expired: { bg: "bg-gray-500/10", text: "text-gray-400" },
};

export default async function ClientSurveysPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("client_accounts")
    .select("id, company_name")
    .eq("id", id)
    .single();

  if (!client) notFound();

  const { data: surveys, error } = await supabase
    .from("surveys")
    .select(
      `
      *,
      responded_contact:client_contacts!responded_by_contact_id(id, first_name, last_name)
    `
    )
    .eq("client_account_id", id)
    .order("created_at", { ascending: false });

  return (
    <div>
      {/* Back link */}
      <div className="mb-6">
        <Link
          href={`/admin/clients/${id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Back to {client.company_name}
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
            <ClipboardList size={20} className="text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold admin-text">Surveys</h1>
            <p className="text-sm text-slate-400">{client.company_name}</p>
          </div>
        </div>
        <Link
          href={`/admin/surveys?clientId=${id}`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors"
        >
          <ExternalLink size={16} />
          Assign Survey
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
          Failed to load surveys: {error.message}
        </div>
      )}

      {!surveys || surveys.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
          <ClipboardList
            size={48}
            className="mx-auto text-slate-600 mb-4"
          />
          <p className="text-slate-400 text-lg mb-2">No surveys yet</p>
          <p className="text-slate-500 text-sm">
            Surveys assigned to this client will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Responded By
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {surveys.map((survey) => {
                const badge =
                  statusBadge[survey.status] ?? statusBadge.draft;
                const contact = survey.responded_contact as {
                  first_name: string;
                  last_name: string;
                } | null;

                return (
                  <tr
                    key={survey.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/surveys/${survey.id}`}
                        className="text-sm font-medium admin-text hover:text-sky-400 transition-colors"
                      >
                        {survey.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${badge.bg} ${badge.text}`}
                      >
                        {survey.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {contact
                        ? `${contact.first_name} ${contact.last_name}`
                        : "---"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {survey.responded_at
                        ? new Date(
                            survey.responded_at
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : survey.created_at
                        ? new Date(
                            survey.created_at
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "---"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {survey.status === "completed" ? (
                        <Link
                          href={`/admin/surveys/${survey.id}/responses`}
                          className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <Eye size={14} />
                          View Responses
                        </Link>
                      ) : (
                        <Link
                          href={`/admin/surveys/${survey.id}`}
                          className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
                        >
                          Edit
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
