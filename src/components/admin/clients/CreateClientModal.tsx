"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Plus } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function CreateClientModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [portalEmail, setPortalEmail] = useState("");
  const [portalPassword, setPortalPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!companyName.trim()) {
      setError("Company name is required.");
      return;
    }
    if (!portalEmail.trim() || !portalPassword.trim()) {
      setError("Portal email and password are required.");
      return;
    }

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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create client.");
        return;
      }

      setCompanyName("");
      setAddress("");
      setPhone("");
      setWebsite("");
      setPortalEmail("");
      setPortalPassword("");
      setOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("An unexpected error occurred.");
    }
  };

  return (
    <>
      <Button color="primary" size="md" iconLeading={Plus} onClick={() => setOpen(true)}>
        Create Client
      </Button>

      <ModalOverlay isDismissable isOpen={open} onOpenChange={setOpen}>
        <Modal className="w-full max-w-3xl">
          <Dialog aria-label="Create Client">
            <div className="flex items-start justify-between gap-4 px-6 pt-6">
              <div>
                <h2 className="text-lg font-semibold text-primary">Create Client</h2>
                <p className="text-sm text-tertiary">Set up a new client account and portal login.</p>
              </div>
              <CloseButton size="sm" onClick={() => setOpen(false)} />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 pt-5 pb-6">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-utility-red-50 px-3.5 py-2.5 text-sm text-utility-red-700 ring-1 ring-utility-red-200 ring-inset">
                  <AlertCircle className="size-4 shrink-0 text-utility-red-500" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Left column — Company Info */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-semibold text-primary">Company Info</h3>

                  <Input
                    label="Company Name"
                    isRequired
                    value={companyName}
                    onChange={setCompanyName}
                    placeholder="Acme Corporation"
                  />

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
                    placeholder="(555) 555-5555"
                  />

                  <Input
                    label="Website"
                    value={website}
                    onChange={setWebsite}
                    placeholder="https://example.com"
                  />
                </div>

                {/* Right column — Portal Login */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-semibold text-primary">Portal Login</h3>
                  <p className="text-xs text-tertiary">
                    This creates the company login. Individual users are managed via the client&apos;s contacts.
                  </p>

                  <Input
                    label="Email"
                    type="email"
                    isRequired
                    value={portalEmail}
                    onChange={setPortalEmail}
                    placeholder="user@company.com"
                  />

                  <Input
                    label="Password"
                    type="password"
                    isRequired
                    minLength={8}
                    value={portalPassword}
                    onChange={setPortalPassword}
                    placeholder="••••••••"
                    hint="Minimum 8 characters"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  color="primary"
                  size="md"
                  className="flex-1"
                  isDisabled={isPending}
                  isLoading={isPending}
                  showTextWhileLoading
                >
                  {isPending ? "Creating..." : "Create Client"}
                </Button>
                <Button type="button" color="secondary" size="md" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
