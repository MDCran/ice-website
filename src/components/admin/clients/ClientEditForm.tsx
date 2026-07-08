"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Image01, Save01 } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/base/avatar/avatar";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { TextArea } from "@/components/base/textarea/textarea";
import { Toggle } from "@/components/base/toggle/toggle";
import MediaBrowserModal from "@/components/admin/MediaBrowserModal";

interface ClientAccount {
  id: string;
  company_name: string;
  slug: string;
  address_line1?: string | null;
  phone?: string | null;
  website?: string | null;
  logo_url?: string | null;
  is_active?: boolean;
  [key: string]: unknown;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function ClientEditForm({
  client,
}: {
  client: ClientAccount;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [companyName, setCompanyName] = useState(client.company_name ?? "");
  const [address, setAddress] = useState(client.address_line1 ?? "");
  const [phone, setPhone] = useState(formatPhone(client.phone ?? ""));
  const [website, setWebsite] = useState(client.website ?? "");
  const [logoUrl, setLogoUrl] = useState(client.logo_url ?? "");
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(client.is_active !== false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("client_accounts")
      .update({
        company_name: companyName,
        address_line1: address || null,
        phone: phone.replace(/\D/g, "") || null,
        website: website || null,
        logo_url: logoUrl || null,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", client.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    startTransition(() => {
      router.refresh();
    });
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-utility-red-50 px-3.5 py-2.5 text-sm text-utility-red-700 ring-1 ring-utility-red-200 ring-inset">
          <AlertCircle className="size-4 shrink-0 text-utility-red-500" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-utility-green-50 px-3.5 py-2.5 text-sm text-utility-green-700 ring-1 ring-utility-green-200 ring-inset">
          <CheckCircle className="size-4 shrink-0 text-utility-green-500" />
          Changes saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Input
          label="Company Name"
          isRequired
          value={companyName}
          onChange={setCompanyName}
        />

        <Input
          label="Phone"
          type="tel"
          value={phone}
          onChange={(value) => setPhone(formatPhone(value))}
          placeholder="(555) 123-4567"
        />
      </div>

      <TextArea
        label="Address"
        rows={2}
        value={address}
        onChange={setAddress}
        placeholder="123 Main St, City, ST 12345"
        textAreaClassName="resize-none"
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Input
          label="Website"
          type="url"
          value={website}
          onChange={setWebsite}
          placeholder="https://example.com"
        />

        <div className="flex flex-col gap-1.5">
          <Label>Avatar</Label>
          <div className="flex items-center gap-4">
            <Avatar
              size="2xl"
              src={logoUrl || null}
              alt="Avatar preview"
              placeholderIcon={Image01}
            />
            <div className="flex flex-col items-start gap-2">
              <Button color="secondary" size="sm" onClick={() => setAvatarModalOpen(true)}>
                Browse Files
              </Button>
              {logoUrl && (
                <Button color="link-destructive" size="sm" onClick={() => setLogoUrl("")}>
                  Remove avatar
                </Button>
              )}
            </div>
          </div>
          <MediaBrowserModal
            open={avatarModalOpen}
            onClose={() => setAvatarModalOpen(false)}
            onSelect={(url) => {
              setLogoUrl(url);
              setAvatarModalOpen(false);
            }}
            accept="image/*"
            title="Select Avatar"
          />
        </div>
      </div>

      {/* Active toggle */}
      <Toggle
        size="sm"
        isSelected={isActive}
        onChange={setIsActive}
        label={isActive ? "Active" : "Deactivated (locked out)"}
      />

      <div className="pt-2">
        <Button
          type="submit"
          color="primary"
          size="lg"
          iconLeading={Save01}
          isDisabled={isPending}
          isLoading={isPending}
          showTextWhileLoading
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}
