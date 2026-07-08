"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { File02, Check, XClose, AlertCircle } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Table, TableCard } from "@/components/application/table/table";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import DeadlineCountdown from "@/components/portal/DeadlineCountdown";
import type { ClientInvoice } from "@/lib/types/database";

const statusColors: Record<string, "brand" | "success" | "error" | "gray"> = {
  sent: "brand",
  accepted: "success",
  denied: "error",
  paid: "success",
  overdue: "error",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchInvoices = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: clientUser } = await supabase
      .from("client_users")
      .select("client_account_id")
      .eq("id", user.id)
      .single();
    if (!clientUser) return;

    const { data } = await supabase
      .from("client_invoices")
      .select("*")
      .eq("client_account_id", clientUser.client_account_id)
      .not("status", "in", '("draft","hidden")')
      .order("created_at", { ascending: false });

    setInvoices(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleAction = async (
    invoiceId: string,
    action: "accepted" | "denied"
  ) => {
    setActionLoading(invoiceId);
    setError("");
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("client_invoices")
        .update({ status: action })
        .eq("id", invoiceId);

      if (updateError) throw updateError;
      await fetchInvoices();
    } catch {
      setError(`Failed to ${action === "accepted" ? "accept" : "deny"} invoice.`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingIndicator type="line-spinner" size="md" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-display-xs font-semibold text-primary">Invoices</h1>
        <p className="mt-1 text-md text-tertiary">
          {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-error-primary p-3 text-sm font-medium text-error-primary ring-1 ring-error_subtle ring-inset">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="rounded-xl bg-primary py-12 shadow-xs ring-1 ring-secondary">
          <EmptyState size="sm">
            <EmptyState.Header>
              <EmptyState.FeaturedIcon color="gray" icon={File02} />
            </EmptyState.Header>
            <EmptyState.Content>
              <EmptyState.Title>No invoices found</EmptyState.Title>
              <EmptyState.Description>
                Invoices shared with your account will appear here.
              </EmptyState.Description>
            </EmptyState.Content>
          </EmptyState>
        </div>
      ) : (
        <TableCard.Root>
          <Table aria-label="Invoices">
            <Table.Header>
              <Table.Head id="invoice" isRowHeader label="Invoice" className="w-full" />
              <Table.Head id="status" label="Status" />
              <Table.Head id="date" label="Date" />
              <Table.Head id="deadline" label="Deadline" />
              <Table.Head id="actions" aria-label="Actions" />
            </Table.Header>
            <Table.Body items={invoices}>
              {(invoice) => {
                const isActionable =
                  invoice.status === "sent" || invoice.status === "overdue";
                const isLoading = actionLoading === invoice.id;

                return (
                  <Table.Row id={invoice.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        <File02 aria-hidden="true" className="size-4 shrink-0 text-fg-quaternary" />
                        <div>
                          <span className="text-sm font-medium text-primary">
                            {invoice.title || invoice.invoice_number}
                          </span>
                          {invoice.invoice_number && (
                            <p className="font-mono text-xs text-quaternary">
                              #{invoice.invoice_number}
                            </p>
                          )}
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <Badge
                          type="pill-color"
                          size="sm"
                          color={statusColors[invoice.status] || "gray"}
                        >
                          {invoice.status.charAt(0).toUpperCase() +
                            invoice.status.slice(1)}
                        </Badge>
                        {invoice.extended_days > 0 && (
                          <Badge type="pill-color" size="sm" color="purple">
                            Extended {invoice.extended_days} day
                            {invoice.extended_days !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="whitespace-nowrap">
                        {invoice.created_at
                          ? new Date(invoice.created_at).toLocaleDateString()
                          : "-"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {isActionable && invoice.deadline_at ? (
                        <DeadlineCountdown
                          deadlineAt={invoice.deadline_at}
                          extendedDays={0}
                        />
                      ) : (
                        <span className="text-sm text-quaternary">-</span>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {isActionable && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            color="primary"
                            iconLeading={Check}
                            isDisabled={isLoading}
                            isLoading={isLoading}
                            showTextWhileLoading
                            onClick={() => handleAction(invoice.id, "accepted")}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            color="secondary-destructive"
                            iconLeading={XClose}
                            isDisabled={isLoading}
                            onClick={() => handleAction(invoice.id, "denied")}
                          >
                            Deny
                          </Button>
                        </div>
                      )}
                    </Table.Cell>
                  </Table.Row>
                );
              }}
            </Table.Body>
          </Table>
        </TableCard.Root>
      )}
    </div>
  );
}
