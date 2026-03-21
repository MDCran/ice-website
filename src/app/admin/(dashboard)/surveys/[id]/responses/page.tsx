import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Star, CheckCircle, XCircle } from "lucide-react";

export const metadata = { title: "Survey Responses | ICE Admin" };

function StarDisplay({ count, max }: { count: number; max: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < count
              ? "text-yellow-400 fill-yellow-400"
              : "text-slate-600"
          }
        />
      ))}
      <span className="ml-1.5 text-xs text-slate-400">
        {count}/{max}
      </span>
    </span>
  );
}

function YesNoBadge({ value }: { value: unknown }) {
  const isYes =
    value === true ||
    value === "yes" ||
    value === "Yes" ||
    value === "true";
  return isYes ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
      <CheckCircle size={12} />
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400">
      <XCircle size={12} />
      No
    </span>
  );
}

function formatAnswer(
  value: unknown,
  questionType: string,
  config: Record<string, unknown>
): React.ReactNode {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-500 italic">No answer</span>;
  }

  switch (questionType) {
    case "yes_no":
      return <YesNoBadge value={value} />;

    case "star_rating": {
      const maxStars =
        typeof config?.maxStars === "number" ? config.maxStars : 5;
      const count = typeof value === "number" ? value : parseInt(String(value)) || 0;
      return <StarDisplay count={count} max={maxStars} />;
    }

    case "multiple_choice": {
      if (Array.isArray(value)) {
        return (
          <div className="flex flex-wrap gap-1.5">
            {value.map((v, i) => (
              <span
                key={i}
                className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400"
              >
                {String(v)}
              </span>
            ))}
          </div>
        );
      }
      return <span className="text-sm admin-text">{String(value)}</span>;
    }

    case "ranking": {
      if (Array.isArray(value)) {
        return (
          <ol className="list-decimal list-inside space-y-0.5 text-sm admin-text">
            {value.map((v, i) => (
              <li key={i}>
                <span className="text-slate-300">{String(v)}</span>
              </li>
            ))}
          </ol>
        );
      }
      return <span className="text-sm admin-text">{String(value)}</span>;
    }

    default:
      return <span className="text-sm admin-text">{String(value)}</span>;
  }
}

export default async function SurveyResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: survey, error: surveyError } = await supabase
    .from("surveys")
    .select(
      `
      *,
      client_accounts(id, company_name),
      responded_contact:client_contacts!responded_by_contact_id(id, first_name, last_name)
    `
    )
    .eq("id", id)
    .single();

  if (surveyError || !survey) notFound();

  const { data: questions } = await supabase
    .from("survey_questions")
    .select("*")
    .eq("survey_id", id)
    .order("sort_order", { ascending: true });

  const responseValues: Record<string, unknown> =
    (survey.response_values as Record<string, unknown>) ?? {};
  const contact = survey.responded_contact as {
    first_name: string;
    last_name: string;
  } | null;
  const company = (survey.client_accounts as { company_name: string } | null)
    ?.company_name;

  return (
    <div>
      {/* Back link */}
      <div className="mb-6">
        <Link
          href={`/admin/surveys/${id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Survey
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <MessageSquare size={20} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold admin-text">{survey.title}</h1>
          <p className="text-sm text-slate-400">{company ?? "Unknown Client"}</p>
        </div>
      </div>

      {/* Respondent info */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Respondent Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Name</span>
            <p className="admin-text font-medium mt-0.5">
              {contact
                ? `${contact.first_name} ${contact.last_name}`
                : "---"}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Responded At</span>
            <p className="admin-text font-medium mt-0.5">
              {survey.responded_at
                ? new Date(survey.responded_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "---"}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Status</span>
            <p className="mt-0.5">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                  survey.status === "completed"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : survey.status === "active"
                    ? "bg-sky-500/10 text-sky-400"
                    : "bg-slate-500/10 text-slate-400"
                }`}
              >
                {survey.status}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Questions & answers */}
      <h2 className="text-lg font-semibold admin-text mb-4">
        Responses ({questions?.length ?? 0} questions)
      </h2>

      {!questions || questions.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
          <MessageSquare
            size={48}
            className="mx-auto text-slate-600 mb-4"
          />
          <p className="text-slate-400">No questions in this survey.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const answer = responseValues[q.id];
            return (
              <div
                key={q.id}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-slate-500 font-mono">
                    Q{idx + 1}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-slate-500/10 text-slate-400">
                    {q.question_type.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-medium mb-3">
                  {q.question_text}
                </p>
                <div className="pl-2 border-l-2 border-white/10 py-1">
                  {formatAnswer(answer, q.question_type, q.config ?? {})}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
