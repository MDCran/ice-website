import { createClient } from "@/lib/supabase/server";
import { UserPlus01 } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { Table, TableCard } from "@/components/application/table/table";

export default async function SubscribersPage() {
  const supabase = await createClient();
  const { data: subscribers, error } = await supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-sm text-error-primary">
        Failed to load subscribers: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-display-xs font-semibold text-primary">
            Newsletter Subscribers
          </h1>
          <p className="mt-1 text-sm text-tertiary">
            View newsletter subscriber information
          </p>
        </div>
        <Badge size="md" color="gray">
          {subscribers?.length ?? 0} subscribers
        </Badge>
      </div>

      {!subscribers || subscribers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-primary px-6 py-16 text-center shadow-xs ring-1 ring-secondary">
          <FeaturedIcon color="gray" theme="modern" size="lg" icon={UserPlus01} />
          <p className="mt-4 text-md font-semibold text-primary">No subscribers yet</p>
          <p className="mt-1 text-sm text-tertiary">
            Newsletter subscribers will appear here.
          </p>
        </div>
      ) : (
        <TableCard.Root size="sm">
          <Table aria-label="Newsletter subscribers" size="sm">
            <Table.Header>
              <Table.Head id="name" label="Name" isRowHeader />
              <Table.Head id="company" label="Company" />
              <Table.Head id="phone" label="Phone" />
              <Table.Head id="sms" label="SMS Consent" />
              <Table.Head id="date" label="Date" />
            </Table.Header>
            <Table.Body>
              {subscribers.map((sub) => (
                <Table.Row key={sub.id} id={sub.id}>
                  <Table.Cell className="whitespace-nowrap text-sm font-medium text-primary">
                    {sub.name ?? "—"}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {sub.company ?? "—"}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {sub.phone ?? "—"}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {sub.sms_consent ? (
                      <Badge size="sm" color="success">
                        Yes
                      </Badge>
                    ) : (
                      <Badge size="sm" color="gray">
                        No
                      </Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap text-xs">
                    {sub.created_at
                      ? new Date(sub.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
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
