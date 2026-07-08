import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ClipboardCheck } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import type { BadgeColor } from "@/components/base/badges/badges";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { Table, TableCard } from "@/components/application/table/table";
import CreateSurveyModal from "./CreateSurveyModal";

export const metadata = { title: "Surveys | ICE Admin" };

const statusBadge: Record<string, BadgeColor<"pill-color">> = {
  draft: "gray",
  active: "brand",
  completed: "success",
  expired: "gray",
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
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FeaturedIcon color="brand" theme="modern" size="md" icon={ClipboardCheck} />
          <div>
            <h1 className="text-display-xs font-semibold text-primary">Surveys</h1>
            <p className="text-sm text-tertiary">
              {surveys?.length ?? 0} total surveys
            </p>
          </div>
        </div>
        <CreateSurveyModal clients={clients ?? []} />
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-utility-red-50 p-4 text-sm text-utility-red-700 ring-1 ring-utility-red-200 ring-inset">
          Failed to load surveys: {error.message}
        </div>
      )}

      {!surveys || surveys.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-primary px-6 py-16 text-center shadow-xs ring-1 ring-secondary">
          <FeaturedIcon color="gray" theme="modern" size="lg" icon={ClipboardCheck} />
          <p className="mt-4 text-md font-semibold text-primary">No surveys found</p>
          <p className="mt-1 text-sm text-tertiary">
            Create a survey to send to a client.
          </p>
        </div>
      ) : (
        <TableCard.Root size="sm">
          <Table aria-label="Surveys" size="sm">
            <Table.Header>
              <Table.Head id="title" label="Title" isRowHeader />
              <Table.Head id="client" label="Client Company" />
              <Table.Head id="status" label="Status" />
              <Table.Head id="expires" label="Expires At" />
              <Table.Head id="created" label="Created" />
              <Table.Head id="actions" aria-label="Actions" className="w-20" />
            </Table.Header>
            <Table.Body>
              {surveys.map((survey) => (
                <Table.Row key={survey.id} id={survey.id}>
                  <Table.Cell>
                    <Link
                      href={`/admin/surveys/${survey.id}`}
                      className="text-sm font-medium text-primary transition-colors hover:text-brand-secondary"
                    >
                      {survey.title}
                    </Link>
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {(survey.client_accounts as any)?.company_name ?? "---"}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      size="sm"
                      color={statusBadge[survey.status] ?? statusBadge.draft}
                      className="capitalize"
                    >
                      {survey.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
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
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
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
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <Link
                      href={`/admin/surveys/${survey.id}`}
                      className="text-sm font-semibold text-brand-secondary transition-colors hover:text-brand-secondary_hover"
                    >
                      Edit
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </TableCard.Root>
      )}
    </div>
  );
}
