"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, Check, Plus } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { Toggle } from "@/components/base/toggle/toggle";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { cx } from "@/utils/cx";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const STEPS = ["Company", "Portal access", "Seed content"] as const;

/**
 * Client provisioning wizard (#43) — company → invite → optional survey/resource seeds.
 */
export default function CreateClientModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [portalEmail, setPortalEmail] = useState("");
  const [portalPassword, setPortalPassword] = useState("");
  const [seedSurvey, setSeedSurvey] = useState(true);
  const [seedResource, setSeedResource] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setStep(0);
    setCompanyName("");
    setAddress("");
    setPhone("");
    setWebsite("");
    setPortalEmail("");
    setPortalPassword("");
    setSeedSurvey(true);
    setSeedResource(true);
    setError("");
  };

  const canNext =
    step === 0
      ? Boolean(companyName.trim())
      : step === 1
        ? Boolean(portalEmail.trim() && portalPassword.trim().length >= 8)
        : true;

  const handleSubmit = async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName.trim(),
          address: address.trim() || undefined,
          phone: phone.trim() || undefined,
          website: website.trim() || undefined,
          portal_email: portalEmail.trim(),
          portal_password: portalPassword.trim(),
          seed_welcome_survey: seedSurvey,
          seed_welcome_resource: seedResource,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create client.");
        return;
      }

      const clientId = data.id as string;
      reset();
      setOpen(false);
      startTransition(() => {
        router.push(`/admin/clients/${clientId}`);
        router.refresh();
      });
    } catch {
      setError("An unexpected error occurred.");
    }
  };

  return (
    <>
      <Button color="primary" size="md" iconLeading={Plus} onClick={() => setOpen(true)}>
        Provision client
      </Button>

      <ModalOverlay
        isDismissable
        isOpen={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) reset();
        }}
      >
        <Modal className="w-full max-w-2xl">
          <Dialog aria-label="Provision client">
            <div className="flex items-start justify-between gap-4 px-6 pt-6">
              <div>
                <h2 className="text-lg font-semibold text-primary">Provision client</h2>
                <p className="text-sm text-tertiary">
                  Create the account, portal login, and optional starter content.
                </p>
              </div>
              <CloseButton
                size="sm"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
              />
            </div>

            <ol className="mt-4 flex gap-2 px-6">
              {STEPS.map((label, i) => (
                <li
                  key={label}
                  className={cx(
                    "flex-1 rounded-lg px-3 py-2 text-center text-xs font-semibold ring-1 ring-inset",
                    i === step
                      ? "bg-brand-solid text-white ring-transparent"
                      : i < step
                        ? "bg-success-primary text-success-primary ring-success_subtle"
                        : "bg-secondary text-tertiary ring-secondary",
                  )}
                >
                  {i + 1}. {label}
                </li>
              ))}
            </ol>

            <div className="flex flex-col gap-5 px-6 pt-5 pb-6">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-utility-red-50 px-3.5 py-2.5 text-sm text-utility-red-700 ring-1 ring-utility-red-200 ring-inset">
                  <AlertCircle className="size-4 shrink-0 text-utility-red-500" />
                  {error}
                </div>
              )}

              {step === 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Input
                      label="Company Name"
                      isRequired
                      value={companyName}
                      onChange={setCompanyName}
                      placeholder="Acme Corporation"
                    />
                  </div>
                  <Input
                    label="Address"
                    value={address}
                    onChange={setAddress}
                    placeholder="123 Main St, City, State"
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    value={phone}
                    onChange={(value) => setPhone(formatPhone(value))}
                    placeholder="(561) 555-0100"
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Website"
                      value={website}
                      onChange={setWebsite}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Portal login email"
                    type="email"
                    isRequired
                    value={portalEmail}
                    onChange={setPortalEmail}
                    placeholder="admin@client.com"
                  />
                  <Input
                    label="Temporary password"
                    type="password"
                    isRequired
                    value={portalPassword}
                    onChange={setPortalPassword}
                    placeholder="Min. 8 characters"
                    hint="Share securely with the client; they can change it after first login."
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 rounded-lg bg-secondary p-4 ring-1 ring-secondary">
                    <div>
                      <p className="text-sm font-semibold text-primary">Welcome survey (draft)</p>
                      <p className="mt-1 text-sm text-tertiary">
                        Seeds an onboarding intake with contacts, DR, and platform questions.
                      </p>
                    </div>
                    <Toggle isSelected={seedSurvey} onChange={setSeedSurvey} />
                  </div>
                  <div className="flex items-start justify-between gap-4 rounded-lg bg-secondary p-4 ring-1 ring-secondary">
                    <div>
                      <p className="text-sm font-semibold text-primary">Getting-started resource</p>
                      <p className="mt-1 text-sm text-tertiary">
                        Publishes a portal document under category Onboarding.
                      </p>
                    </div>
                    <Toggle isSelected={seedResource} onChange={setSeedResource} />
                  </div>
                  <p className="text-xs text-quaternary">
                    Creating: <span className="font-medium text-secondary">{companyName}</span> ·{" "}
                    {portalEmail}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  size="md"
                  color="secondary"
                  iconLeading={ArrowLeft}
                  isDisabled={step === 0 || isPending}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  Back
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button
                    size="md"
                    color="primary"
                    iconTrailing={ArrowRight}
                    isDisabled={!canNext}
                    onClick={() => setStep((s) => s + 1)}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    size="md"
                    color="primary"
                    iconLeading={Check}
                    isLoading={isPending}
                    showTextWhileLoading
                    isDisabled={!canNext || isPending}
                    onClick={() => startTransition(() => void handleSubmit())}
                  >
                    Provision
                  </Button>
                )}
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
