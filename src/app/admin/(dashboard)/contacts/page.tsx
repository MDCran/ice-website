import { createClient } from "@/lib/supabase/server";
import { Mail01 } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
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
                {item.email && <a href={`mailto:${item.email}`} className="mt-1 block text-xs font-medium text-brand-secondary hover:underline">{item.email}</a>}
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
        <div className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left" aria-label="Form submissions">
              <thead className="bg-secondary">
                <tr className="h-10 text-xs font-semibold text-quaternary">
                  <th scope="col" className="w-12 px-3"><span className="sr-only">Read status</span></th>
                  <th scope="col" className="px-4">Stage</th>
                  <th scope="col" className="px-4">Name</th>
                  <th scope="col" className="px-4">Email</th>
                  <th scope="col" className="px-4">Company</th>
                  <th scope="col" className="px-4">Phone</th>
                  <th scope="col" className="px-4">Service</th>
                  <th scope="col" className="px-4">Intent</th>
                  <th scope="col" className="px-4">Message</th>
                  <th scope="col" className="px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="min-h-14 border-t border-secondary text-sm text-tertiary hover:bg-secondary">
                    <td className="px-3 py-3">
                      <ContactReadToggle id={contact.id} isRead={contact.is_read ?? false} />
                    </td>
                    <td className="px-4 py-3">
                      <ContactStageSelect id={contact.id} stage={contact.pipeline_stage} />
                    </td>
                    <th scope="row" className="whitespace-nowrap px-4 py-3 text-left font-medium text-primary">
                      <span className="flex items-center gap-2">
                        {!contact.is_read && <span className="size-2 shrink-0 rounded-full bg-fg-brand-primary" />}
                        {contact.name ?? "—"}
                      </span>
                    </th>
                    <td className="whitespace-nowrap px-4 py-3">
                      {contact.email ? (
                        <a href={`mailto:${contact.email}`} className="font-medium text-brand-secondary transition-colors hover:text-brand-secondary_hover">
                          {contact.email}
                        </a>
                      ) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{contact.company ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3">{contact.phone ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {contact.service ? <Badge size="sm" color="brand">{contact.service}</Badge> : "—"}
                    </td>
                    <td className="min-w-40 px-4 py-3">
                      {typeof contact.lead_score === "number" || contact.source ? (
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {typeof contact.lead_score === "number" && (
                              <Badge size="sm" color={contact.lead_score >= 70 ? "success" : contact.lead_score >= 45 ? "warning" : "gray"}>
                                Score {contact.lead_score}
                              </Badge>
                            )}
                            {contact.source && <span className="text-xs font-medium text-secondary">{String(contact.source).replace(/_/g, " ")}</span>}
                          </div>
                          {contact.qualification && typeof contact.qualification === "object" && (
                            <p
                              className="max-w-48 truncate text-xs text-tertiary"
                              title={[contact.qualification.priority, contact.qualification.timeline].filter(Boolean).join(" · ")}
                            >
                              {[contact.qualification.priority, contact.qualification.timeline].filter(Boolean).join(" · ")}
                            </p>
                          )}
                        </div>
                      ) : "—"}
                    </td>
                    <td className="max-w-50 px-4 py-3">
                      <span className="block truncate" title={contact.message ?? ""}>
                        {contact.message ? contact.message.length > 80 ? `${contact.message.slice(0, 80)}...` : contact.message : "—"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs">
                      {contact.created_at
                        ? new Date(contact.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
