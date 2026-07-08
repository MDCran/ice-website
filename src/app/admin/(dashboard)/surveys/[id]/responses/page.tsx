import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, MessageChatSquare, Star01, XCircle } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

export const metadata = { title: "Survey Responses | ICE Admin" };

function StarDisplay({ count, max }: { count: number; max: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star01
          key={i}
          className={
            i < count
              ? "size-4 fill-yellow-400 text-yellow-400"
              : "size-4 text-fg-quaternary"
          }
        />
      ))}
      <span className="ml-1.5 text-xs text-tertiary">
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
    <Badge size="sm" color="success">
      <span className="inline-flex items-center gap-1.5">
        <CheckCircle className="size-3" />
        Yes
      </span>
    </Badge>
  ) : (
    <Badge size="sm" color="gray">
      <span className="inline-flex items-center gap-1.5">
        <XCircle className="size-3" />
        No
      </span>
    </Badge>
  );
}

function formatAnswer(
  value: unknown,
  questionType: string,
  config: Record<string, unknown>
): React.ReactNode {
  if (value === null || value === undefined || value === "") {
    return <span className="text-tertiary italic">No answer</span>;
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
              <Badge key={i} size="sm" color="purple">
                {String(v)}
              </Badge>
            ))}
          </div>
        );
      }
      return <span className="text-sm text-primary">{String(value)}</span>;
    }

    case "ranking": {
      if (Array.isArray(value)) {
        return (
          <ol className="list-inside list-decimal space-y-0.5 text-sm text-primary">
            {value.map((v, i) => (
              <li key={i}>
                <span className="text-secondary">{String(v)}</span>
              </li>
            ))}
          </ol>
        );
      }
      return <span className="text-sm text-primary">{String(value)}</span>;
    }

    default:
      return <span className="text-sm text-primary">{String(value)}</span>;
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
          className="inline-flex items-center gap-2 text-sm font-semibold text-tertiary transition-colors hover:text-tertiary_hover"
        >
          <ArrowLeft className="size-4" />
          Back to Survey
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <FeaturedIcon color="success" theme="modern" size="md" icon={MessageChatSquare} />
        <div>
          <h1 className="text-display-xs font-semibold text-primary">{survey.title}</h1>
          <p className="text-sm text-tertiary">{company ?? "Unknown Client"}</p>
        </div>
      </div>

      {/* Respondent info */}
      <div className="mb-8 rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        <h2 className="mb-4 text-sm font-semibold tracking-wider text-quaternary uppercase">
          Respondent Information
        </h2>
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div>
            <span className="text-tertiary">Name</span>
            <p className="mt-0.5 font-medium text-primary">
              {contact
                ? `${contact.first_name} ${contact.last_name}`
                : "---"}
            </p>
          </div>
          <div>
            <span className="text-tertiary">Responded At</span>
            <p className="mt-0.5 font-medium text-primary">
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
            <span className="text-tertiary">Status</span>
            <p className="mt-0.5">
              <Badge
                size="sm"
                color={
                  survey.status === "completed"
                    ? "success"
                    : survey.status === "active"
                    ? "brand"
                    : "gray"
                }
                className="capitalize"
              >
                {survey.status}
              </Badge>
            </p>
          </div>
        </div>
      </div>

      {/* Questions & answers */}
      <h2 className="mb-4 text-lg font-semibold text-primary">
        Responses ({questions?.length ?? 0} questions)
      </h2>

      {!questions || questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-primary px-6 py-16 text-center shadow-xs ring-1 ring-secondary">
          <FeaturedIcon color="gray" theme="modern" size="lg" icon={MessageChatSquare} />
          <p className="mt-4 text-sm text-tertiary">No questions in this survey.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const answer = responseValues[q.id];
            return (
              <div
                key={q.id}
                className="rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-xs text-quaternary">
                    Q{idx + 1}
                  </span>
                  <Badge size="sm" color="gray" className="uppercase">
                    {q.question_type.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="mb-3 text-sm font-medium text-secondary">
                  {q.question_text}
                </p>
                <div className="border-l-2 border-secondary py-1 pl-3">
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
