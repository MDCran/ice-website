import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ClipboardCheck, Calendar, ArrowRight } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
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
      <div className="mb-8">
        <h1 className="text-display-xs font-semibold text-primary">Surveys</h1>
        <p className="mt-1 text-md text-tertiary">
          {surveys.length} active survey{surveys.length !== 1 ? "s" : ""}
        </p>
      </div>

      {surveys.length === 0 ? (
        <div className="rounded-xl bg-primary p-12 text-center shadow-xs ring-1 ring-secondary">
          <FeaturedIcon
            color="gray"
            theme="modern"
            size="lg"
            icon={ClipboardCheck}
            className="mx-auto mb-4"
          />
          <h3 className="mb-1 text-md font-semibold text-primary">
            No surveys available
          </h3>
          <p className="text-sm text-tertiary">
            No surveys are currently available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="flex flex-col rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary"
            >
              <div className="mb-3 flex items-start justify-between">
                <FeaturedIcon color="brand" theme="light" size="md" icon={ClipboardCheck} />
                {survey.current_question_index > 0 && (
                  <Badge type="pill-color" size="sm" color="warning">
                    In Progress
                  </Badge>
                )}
              </div>
              <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-primary">
                {survey.title}
              </h3>
              {survey.description && (
                <p className="mb-3 line-clamp-2 text-sm text-tertiary">
                  {survey.description}
                </p>
              )}
              {survey.deadline_at && (
                <div className="mb-4 flex items-center gap-1.5 text-xs text-quaternary">
                  <Calendar aria-hidden="true" className="size-3" />
                  Expires {new Date(survey.deadline_at).toLocaleDateString()}
                </div>
              )}
              <Button
                href={`/portal/surveys/${survey.id}`}
                size="md"
                color="primary"
                className="mt-auto w-full"
                iconTrailing={<ArrowRight data-icon />}
              >
                {survey.current_question_index > 0
                  ? "Continue Survey"
                  : "Start Survey"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
