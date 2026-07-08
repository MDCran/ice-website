import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ClipboardCheck, Eye, LinkExternal01 } from "@untitledui/icons";
import type { BadgeColor } from "@/components/base/badges/badges";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { Table, TableCard } from "@/components/application/table/table";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

export const metadata = { title: "Client Surveys | ICE Admin" };

const statusColors: Record<string, BadgeColor<"pill-color">> = {
  draft: "gray",
  active: "blue",
  completed: "success",
  expired: "warning",
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
        <Button color="link-gray" size="sm" href={`/admin/clients/${id}`} iconLeading={<ArrowLeft data-icon />}>
          Back to {client.company_name}
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FeaturedIcon icon={ClipboardCheck} color="brand" theme="modern" size="lg" />
          <div>
            <h1 className="text-xl font-semibold text-primary">Surveys</h1>
            <p className="text-sm text-tertiary">{client.company_name}</p>
          </div>
        </div>
        <Button
          color="primary"
          size="md"
          href={`/admin/surveys?clientId=${id}`}
          iconLeading={<LinkExternal01 data-icon />}
        >
          Assign Survey
        </Button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-utility-red-50 px-3.5 py-2.5 text-sm text-utility-red-700 ring-1 ring-utility-red-200 ring-inset">
          <AlertCircle className="size-4 shrink-0 text-utility-red-500" />
          Failed to load surveys: {error.message}
        </div>
      )}

      {!surveys || surveys.length === 0 ? (
        <div className="flex justify-center rounded-xl bg-primary px-6 py-12 shadow-xs ring-1 ring-secondary">
          <EmptyState size="sm">
            <EmptyState.Header>
              <EmptyState.FeaturedIcon color="gray" />
            </EmptyState.Header>
            <EmptyState.Content>
              <EmptyState.Title>No surveys yet</EmptyState.Title>
              <EmptyState.Description>
                Surveys assigned to this client will appear here.
              </EmptyState.Description>
            </EmptyState.Content>
          </EmptyState>
        </div>
      ) : (
        <TableCard.Root size="sm">
          <Table aria-label="Surveys" size="sm">
            <Table.Header>
              <Table.Head id="title" label="Title" isRowHeader className="w-full" />
              <Table.Head id="status" label="Status" />
              <Table.Head id="responded-by" label="Responded By" />
              <Table.Head id="date" label="Date" />
              <Table.Head id="actions" />
            </Table.Header>
            <Table.Body>
              {surveys.map((survey) => {
                const color = statusColors[survey.status] ?? statusColors.draft;
                const contact = survey.responded_contact as {
                  first_name: string;
                  last_name: string;
                } | null;

                return (
                  <Table.Row id={survey.id} key={survey.id}>
                    <Table.Cell>
                      <Link
                        href={`/admin/surveys/${survey.id}`}
                        className="text-sm font-medium whitespace-nowrap text-primary hover:underline"
                      >
                        {survey.title}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge size="sm" type="pill-color" color={color} className="capitalize">
                        {survey.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      {contact
                        ? `${contact.first_name} ${contact.last_name}`
                        : "---"}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
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
                    </Table.Cell>
                    <Table.Cell className="px-4">
                      <div className="flex justify-end whitespace-nowrap">
                        {survey.status === "completed" ? (
                          <Button
                            color="link-color"
                            size="sm"
                            href={`/admin/surveys/${survey.id}/responses`}
                            iconLeading={<Eye data-icon />}
                          >
                            View Responses
                          </Button>
                        ) : (
                          <Button
                            color="link-color"
                            size="sm"
                            href={`/admin/surveys/${survey.id}`}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </TableCard.Root>
      )}
    </div>
  );
}
