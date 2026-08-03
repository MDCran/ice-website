import { createClient } from "@/lib/supabase/server";
import { Mail01 } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { Table, TableCard } from "@/components/application/table/table";
import ContactsFilter from "./ContactsFilter";
import ContactReadToggle from "./ContactReadToggle";
import ContactStageSelect from "./ContactStageSelect";
import { PIPELINE_STAGES } from "@/lib/admin/pipeline";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; to?: string; sort?: string; stage?: string }>;
}) {
  const { q, from, to, sort, stage } = await searchParams;
  const supabase = await createClient();
  const ascending = sort === "oldest";

  let query = supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending });

  if (q && q.trim()) {
    const searchTerm = `%${q.trim()}%`;
    query = query.or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`);
  }

  if (from) {
    query = query.gte("created_at", `${from}T00:00:00`);
  }
  if (to) {
    query = query.lte("created_at", `${to}T23:59:59`);
  }
  if (stage && PIPELINE_STAGES.some((s) => s.value === stage)) {
    query = query.eq("pipeline_stage", stage);
  }

  const { data: contacts, error } = await query;
  const { data: callbacks } = await supabase
    .from("callback_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div className="text-sm text-error-primary">
        Failed to load contacts: {error.message}
      </div>
    );
  }

  const unreadCount = contacts?.filter((c) => !c.is_read).length ?? 0;
  const stageCounts = PIPELINE_STAGES.map((s) => ({
    ...s,
    count: contacts?.filter((c) => (c.pipeline_stage ?? "new") === s.value).length ?? 0,
  }));

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-semibold text-primary">Lead pipeline</h1>
          <p className="mt-1 text-sm text-tertiary">
            {contacts?.length ?? 0} total{unreadCount > 0 && ` · ${unreadCount} unread`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {stageCounts.map((s) => (
            <Badge key={s.value} size="sm" color={s.color}>
              {s.label}: {s.count}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mb-6 rounded-xl bg-secondary p-4 ring-1 ring-secondary">
        <p className="text-sm font-semibold text-primary">Turn submissions into follow-up</p>
        <p className="mt-1 max-w-3xl text-sm text-tertiary">
          Start with the newest unread requests, move each lead through a stage, and use the callback cards above to schedule the next conversation. Filters and stages save time when the queue grows.
        </p>
      </div>

      <ContactsFilter
        initialQuery={q ?? ""}
        initialFrom={from ?? ""}
        initialTo={to ?? ""}
        initialSort={sort ?? "newest"}
        initialStage={stage ?? ""}
      />

      {callbacks && callbacks.length > 0 && (
        <section className="mb-6 rounded-xl bg-primary p-5 ring-1 ring-secondary">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-md font-semibold text-primary">Callback requests</h2>
              <p className="mt-1 text-sm text-tertiary">Fast phone requests submitted from the personalized website CTA.</p>
            </div>
            <Badge size="sm" color="brand">{callbacks.filter((item) => item.status === "new").length} new</Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {callbacks.slice(0, 9).map((item) => (
              <div key={item.id} className="rounded-lg bg-secondary p-4 ring-1 ring-secondary">
                <a href={`tel:${String(item.phone).replace(/\D/g, "")}`} className="text-sm font-semibold text-brand-secondary hover:underline">{item.phone}</a>
                <p className="mt-1 text-sm text-primary">{item.preferred_time || "No preferred time"}</p>
                <p className="mt-1 text-xs text-tertiary">{item.context || "General inquiry"}</p>
                <p className="mt-2 text-xs text-quaternary">{new Date(item.created_at).toLocaleString("en-US")}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {!contacts || contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-primary px-6 py-16 text-center shadow-xs ring-1 ring-secondary">
          <FeaturedIcon color="gray" theme="modern" size="lg" icon={Mail01} />
          <p className="mt-4 text-md font-semibold text-primary">
            {q || from || to || stage ? "No contacts match your filters" : "No submissions yet"}
          </p>
          <p className="mt-1 text-sm text-tertiary">
            {q || from || to || stage
              ? "Try different search terms, stage, or date range."
              : "Contact form submissions will appear here."}
          </p>
        </div>
      ) : (
        <TableCard.Root size="sm">
          <Table aria-label="Form submissions" size="sm">
            <Table.Header>
              <Table.Head id="read" aria-label="Read status" className="w-10" />
              <Table.Head id="stage" label="Stage" />
              <Table.Head id="name" label="Name" isRowHeader />
              <Table.Head id="email" label="Email" />
              <Table.Head id="company" label="Company" />
              <Table.Head id="phone" label="Phone" />
              <Table.Head id="service" label="Service" />
              <Table.Head id="intent" label="Intent" />
              <Table.Head id="message" label="Message" />
              <Table.Head id="date" label="Date" />
            </Table.Header>
            <Table.Body>
              {contacts.map((contact) => (
                <Table.Row key={contact.id} id={contact.id}>
                  <Table.Cell className="px-3">
                    <ContactReadToggle
                      id={contact.id}
                      isRead={contact.is_read ?? false}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <ContactStageSelect id={contact.id} stage={contact.pipeline_stage} />
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    <span className="flex items-center gap-2 text-sm font-medium text-primary">
                      {!contact.is_read && (
                        <span className="size-2 shrink-0 rounded-full bg-fg-brand-primary" />
                      )}
                      {contact.name ?? "—"}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="font-medium text-brand-secondary transition-colors hover:text-brand-secondary_hover"
                      >
                        {contact.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {contact.company ?? "—"}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {contact.phone ?? "—"}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {contact.service ? (
                      <Badge size="sm" color="brand">
                        {contact.service}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </Table.Cell>
                  <Table.Cell className="min-w-40">
                    {typeof contact.lead_score === "number" || contact.source ? (
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {typeof contact.lead_score === "number" && (
                            <Badge
                              size="sm"
                              color={
                                contact.lead_score >= 70
                                  ? "success"
                                  : contact.lead_score >= 45
                                    ? "warning"
                                    : "gray"
                              }
                            >
                              Score {contact.lead_score}
                            </Badge>
                          )}
                          {contact.source && (
                            <span className="text-xs font-medium text-secondary">
                              {String(contact.source).replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                        {contact.qualification &&
                          typeof contact.qualification === "object" && (
                            <p
                              className="max-w-48 truncate text-xs text-tertiary"
                              title={[
                                contact.qualification.priority,
                                contact.qualification.timeline,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            >
                              {[
                                contact.qualification.priority,
                                contact.qualification.timeline,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                      </div>
                    ) : (
                      "—"
                    )}
                  </Table.Cell>
                  <Table.Cell className="max-w-50">
                    <span className="block truncate" title={contact.message ?? ""}>
                      {contact.message
                        ? contact.message.length > 80
                          ? `${contact.message.slice(0, 80)}...`
                          : contact.message
                        : "—"}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap text-xs">
                    {contact.created_at
                      ? new Date(contact.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
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
