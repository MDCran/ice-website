"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, File02, GitPullRequest, Home01, Receipt, Users01 } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import type { BadgeColor } from "@/components/base/badges/badges";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { Table, TableCard } from "@/components/application/table/table";
import { Tabs } from "@/components/application/tabs/tabs";
import ClientEditForm from "@/components/admin/clients/ClientEditForm";
import ContactsManager from "@/components/admin/clients/ContactsManager";
import ResourcesManager from "@/components/admin/clients/ResourcesManager";
import InvoicesManager from "@/components/admin/clients/InvoicesManager";
import DeleteClientButton from "@/components/admin/clients/DeleteClientButton";
import ChangeActions from "@/app/admin/(dashboard)/contact-changes/ChangeActions";

const tabs = [
  { id: "home", label: "Home", icon: Home01 },
  { id: "contacts", label: "Contacts", icon: Users01 },
  { id: "resources", label: "Resources", icon: File02 },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "surveys", label: "Surveys", icon: ClipboardCheck },
  { id: "contact-changes", label: "Contact Changes", icon: GitPullRequest },
];

export default function ClientTabs({ client }: { client: any }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <DeleteClientButton clientId={client.id} clientName={client.company_name} />
      </div>

      <Tabs defaultSelectedKey="home">
        <Tabs.List type="underline" size="sm" className="mb-6 w-full overflow-x-auto">
          {tabs.map((tab) => (
            <Tabs.Item key={tab.id} id={tab.id} icon={tab.icon} label={tab.label} />
          ))}
        </Tabs.List>

        <Tabs.Panel id="home">
          <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
            <h2 className="mb-6 text-lg font-semibold text-primary">
              Company Information
            </h2>
            <ClientEditForm client={client} />
          </div>
        </Tabs.Panel>

        <Tabs.Panel id="contacts">
          <ContactsManager clientId={client.id} />
        </Tabs.Panel>

        <Tabs.Panel id="resources">
          <ResourcesManager clientId={client.id} />
        </Tabs.Panel>

        <Tabs.Panel id="invoices">
          <InvoicesManager clientId={client.id} />
        </Tabs.Panel>

        <Tabs.Panel id="surveys">
          <SurveysTab clientId={client.id} />
        </Tabs.Panel>

        <Tabs.Panel id="contact-changes">
          <ContactChangesTab clientId={client.id} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

/* ── Inline Surveys Tab (lightweight since it was a separate page) ── */

const surveyStatusColors: Record<string, BadgeColor<"pill-color">> = {
  draft: "gray",
  active: "blue",
  completed: "success",
  expired: "warning",
};

function SurveysTab({ clientId }: { clientId: string }) {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("surveys")
        .select("*")
        .eq("client_account_id", clientId)
        .order("created_at", { ascending: false });
      setSurveys(data ?? []);
      setLoading(false);
    }
    load();
  }, [clientId]);

  if (loading) {
    return <p className="py-8 text-center text-sm text-tertiary">Loading surveys...</p>;
  }

  if (surveys.length === 0) {
    return (
      <div className="flex justify-center rounded-xl bg-primary px-6 py-12 shadow-xs ring-1 ring-secondary">
        <EmptyState size="sm">
          <EmptyState.Header>
            <EmptyState.FeaturedIcon icon={ClipboardCheck} color="gray" />
          </EmptyState.Header>
          <EmptyState.Content>
            <EmptyState.Title>No surveys yet</EmptyState.Title>
            <EmptyState.Description>
              Create a survey for this client from the survey builder.
            </EmptyState.Description>
          </EmptyState.Content>
        </EmptyState>
      </div>
    );
  }

  return (
    <TableCard.Root size="sm">
      <Table aria-label="Surveys" size="sm">
        <Table.Header>
          <Table.Head id="title" label="Title" isRowHeader className="w-full" />
          <Table.Head id="status" label="Status" />
          <Table.Head id="created" label="Created" />
          <Table.Head id="actions" label="Actions" />
        </Table.Header>
        <Table.Body>
          {surveys.map((s) => (
            <Table.Row id={s.id} key={s.id}>
              <Table.Cell className="text-sm font-medium whitespace-nowrap text-primary">
                {s.title}
              </Table.Cell>
              <Table.Cell>
                <Badge
                  size="sm"
                  type="pill-color"
                  color={surveyStatusColors[s.status] ?? surveyStatusColors.draft}
                  className="capitalize"
                >
                  {s.status}
                </Badge>
              </Table.Cell>
              <Table.Cell className="text-xs whitespace-nowrap">
                {s.created_at
                  ? new Date(s.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </Table.Cell>
              <Table.Cell>
                <Button color="link-color" size="sm" href={`/admin/surveys/${s.id}`}>
                  Edit
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </TableCard.Root>
  );
}

/* ── Inline Contact Changes Tab ── */

const changeStatusColors: Record<string, BadgeColor<"pill-color">> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

function ContactChangesTab({ clientId }: { clientId: string }) {
  const [changes, setChanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("client_contact_changes")
        .select("*, client_contacts(first_name, last_name, email)")
        .eq("client_account_id", clientId)
        .order("created_at", { ascending: false });
      setChanges(data ?? []);
      setLoading(false);
    }
    load();
  }, [clientId]);

  if (loading) {
    return <p className="py-8 text-center text-sm text-tertiary">Loading changes...</p>;
  }

  if (changes.length === 0) {
    return (
      <div className="flex justify-center rounded-xl bg-primary px-6 py-12 shadow-xs ring-1 ring-secondary">
        <EmptyState size="sm">
          <EmptyState.Header>
            <EmptyState.FeaturedIcon icon={GitPullRequest} color="gray" />
          </EmptyState.Header>
          <EmptyState.Content>
            <EmptyState.Title>No contact changes</EmptyState.Title>
            <EmptyState.Description>
              Changes requested by portal users will appear here.
            </EmptyState.Description>
          </EmptyState.Content>
        </EmptyState>
      </div>
    );
  }

  return (
    <TableCard.Root size="sm">
      <Table aria-label="Contact changes" size="sm">
        <Table.Header>
          <Table.Head id="contact" label="Contact" isRowHeader />
          <Table.Head id="field" label="Field" />
          <Table.Head id="new-value" label="New Value" className="w-full" />
          <Table.Head id="status" label="Status" />
          <Table.Head id="actions" label="Actions" />
        </Table.Header>
        <Table.Body>
          {changes.map((c) => (
            <Table.Row id={c.id} key={c.id}>
              <Table.Cell className="text-sm font-medium whitespace-nowrap text-primary">
                {c.client_contacts?.first_name} {c.client_contacts?.last_name}
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap">{c.field_name}</Table.Cell>
              <Table.Cell>
                <span className="block max-w-[200px] truncate font-mono text-xs text-secondary">
                  {c.new_value}
                </span>
              </Table.Cell>
              <Table.Cell>
                <Badge
                  size="sm"
                  type="pill-color"
                  color={changeStatusColors[c.status] ?? changeStatusColors.pending}
                  className="capitalize"
                >
                  {c.status}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                {c.status === "pending" ? (
                  <ChangeActions changeId={c.id} />
                ) : (
                  <span className="text-xs whitespace-nowrap text-quaternary">
                    {c.reviewed_at
                      ? new Date(c.reviewed_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </span>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </TableCard.Root>
  );
}
