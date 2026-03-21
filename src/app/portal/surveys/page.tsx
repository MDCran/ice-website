import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ClipboardList, Calendar, ArrowRight } from "lucide-react";
import type { Survey } from "@/lib/types/database";

async function getSurveys(): Promise<{ surveys: Survey[] }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: clientUser } = await supabase
    .from("client_users")
    .select("client_account_id")
    .eq("id", user.id)
    .single();
  if (!clientUser) notFound();

  const { data } = await supabase
    .from("surveys")
    .select("*")
    .eq("client_account_id", clientUser.client_account_id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return { surveys: data ?? [] };
}

export default async function SurveysPage() {
  const { surveys } = await getSurveys();

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
          <ClipboardList size={20} className="text-sky-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold admin-text">Surveys</h1>
          <p className="text-sm text-slate-400">
            {surveys.length} active survey{surveys.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {surveys.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
          <ClipboardList size={32} className="text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-slate-400">
            No surveys are currently available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.06] transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
                  <ClipboardList size={18} className="text-sky-400" />
                </div>
                {survey.current_question_index > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
                    In Progress
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold admin-text mb-1 line-clamp-2">
                {survey.title}
              </h3>
              {survey.description && (
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {survey.description}
                </p>
              )}
              {survey.deadline_at && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-4">
                  <Calendar size={10} />
                  Expires{" "}
                  {new Date(survey.deadline_at).toLocaleDateString()}
                </div>
              )}
              <Link
                href={`/portal/surveys/${survey.id}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors"
              >
                {survey.current_question_index > 0
                  ? "Continue Survey"
                  : "Start Survey"}
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
