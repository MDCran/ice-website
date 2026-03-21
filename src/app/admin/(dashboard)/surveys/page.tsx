import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import CreateSurveyModal from "./CreateSurveyModal";

export const metadata = { title: "Surveys | ICE Admin" };

const statusBadge: Record<string, { bg: string; text: string }> = {
  draft: { bg: "bg-slate-500/10", text: "text-slate-400" },
  active: { bg: "bg-sky-500/10", text: "text-sky-400" },
  completed: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  expired: { bg: "bg-gray-500/10", text: "text-gray-400" },
};

export default async function SurveysListPage() {
  const supabase = await createClient();

  const { data: surveys, error } = await supabase
    .from("surveys")
    .select("*, client_accounts(id, company_name)")
    .order("created_at", { ascending: false });

  const { data: clients } = await supabase
    .from("client_accounts")
    .select("id, company_name")
    .eq("is_active", true)
    .order("company_name", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
            <ClipboardList size={20} className="text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold admin-text">Surveys</h1>
            <p className="text-sm text-slate-400">
              {surveys?.length ?? 0} total surveys
            </p>
          </div>
        </div>
        <CreateSurveyModal clients={clients ?? []} />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
          Failed to load surveys: {error.message}
        </div>
      )}

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Title
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Client Company
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Expires At
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {surveys && surveys.length > 0 ? (
              surveys.map((survey) => {
                const badge = statusBadge[survey.status] ?? statusBadge.draft;
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
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {(survey.client_accounts as any)?.company_name ?? "---"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${badge.bg} ${badge.text}`}
                      >
                        {survey.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {survey.expires_at
                        ? new Date(survey.expires_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : "---"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {survey.created_at
                        ? new Date(survey.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : "---"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/surveys/${survey.id}`}
                        className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-500 text-sm"
                >
                  No surveys found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
