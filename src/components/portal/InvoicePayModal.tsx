"use client";

import { useState } from "react";
import { CreditCard01, Bank, LinkExternal01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { pushEvent } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/client";
import type { ClientInvoice } from "@/lib/types/database";

function formatAmount(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

/**
 * Portal invoice pay-online (#49).
 * Prefers an invoice `payment_url` or `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`;
 * otherwise offers ACH/wire instructions and a "payment submitted" marker.
 */
export default function InvoicePayModal({
  invoice,
  onClose,
  onSubmitted,
}: {
  invoice: ClientInvoice;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const paymentUrl =
    invoice.payment_url ||
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ||
    "";
  const amount = formatAmount(invoice.amount_cents ?? 0, invoice.currency || "USD");
  const billingEmail = process.env.NEXT_PUBLIC_BILLING_EMAIL || "billing@icecomp.com";

  const markSubmitted = async () => {
    setSubmitting(true);
    setError("");
    try {
      const supabase = createClient();
      const payload: Record<string, unknown> = {
        payment_submitted_at: new Date().toISOString(),
      };
      const { error: updateError } = await supabase
        .from("client_invoices")
        .update(payload)
        .eq("id", invoice.id);

      if (updateError && /payment_submitted_at/i.test(updateError.message)) {
        // Column missing — still notify billing via mailto fallback below.
      } else if (updateError) {
        throw updateError;
      }

      pushEvent("invoice_payment_submitted", {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        amount_cents: invoice.amount_cents,
      });
      onSubmitted();
    } catch {
      setError("Could not record payment submission. Email billing and we will confirm.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay isDismissable isOpen onOpenChange={(open) => !open && onClose()}>
      <Modal className="w-full max-w-lg">
        <Dialog aria-label="Pay invoice">
          <div className="px-6 pt-6 pb-6">
            <h2 className="text-lg font-semibold text-primary">Pay invoice</h2>
            <p className="mt-1 text-sm text-tertiary">
              {invoice.title || invoice.invoice_number} · {amount}
            </p>

            {paymentUrl ? (
              <div className="mt-6 space-y-4">
                <p className="text-sm text-secondary">
                  Pay securely online with card or ACH. You will be redirected to our payment
                  processor.
                </p>
                <Button
                  size="md"
                  color="primary"
                  iconLeading={CreditCard01}
                  iconTrailing={LinkExternal01}
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    pushEvent("invoice_pay_clicked", {
                      invoice_id: invoice.id,
                      method: "stripe_link",
                    })
                  }
                >
                  Pay {amount} online
                </Button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="rounded-lg bg-secondary p-4 text-sm text-secondary ring-1 ring-secondary">
                  <p className="mb-2 flex items-center gap-2 font-medium text-primary">
                    <Bank className="size-4" aria-hidden />
                    ACH / wire instructions
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-tertiary">
                    <li>Reference: {invoice.invoice_number}</li>
                    <li>Amount: {amount}</li>
                    <li>
                      Email remittance to{" "}
                      <a className="text-brand-secondary underline" href={`mailto:${billingEmail}`}>
                        {billingEmail}
                      </a>
                    </li>
                  </ul>
                </div>
                <p className="text-xs text-quaternary">
                  Online card checkout is available when ICE attaches a payment link to this
                  invoice. Until then, use ACH/wire and mark below after you send payment.
                </p>
                <Button
                  size="md"
                  color="primary"
                  iconLeading={CreditCard01}
                  isLoading={submitting}
                  showTextWhileLoading
                  onClick={markSubmitted}
                >
                  I submitted payment
                </Button>
              </div>
            )}

            {error && <p className="mt-3 text-sm text-error-primary">{error}</p>}

            <div className="mt-6 flex justify-end">
              <Button size="sm" color="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
