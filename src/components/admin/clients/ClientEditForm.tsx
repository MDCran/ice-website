"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2, AlertCircle, CheckCircle, Image as ImageIcon } from "lucide-react";
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

const inputCls =
  "w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all";

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

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
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle size={16} />
          Changes saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(555) 123-4567"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Address
        </label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={2}
          className={`${inputCls} resize-none`}
          placeholder="123 Main St, City, ST 12345"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Website
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Avatar
          </label>
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Avatar preview"
                className="w-16 h-16 rounded-xl object-cover border border-white/10"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                <ImageIcon size={24} className="text-slate-500" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setAvatarModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-sm text-slate-300 hover:bg-white/[0.1] hover:border-white/20 transition-all cursor-pointer"
              >
                Browse Files
              </button>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl("")}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors cursor-pointer text-left"
                >
                  Remove avatar
                </button>
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
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
            isActive ? "bg-emerald-500" : "bg-red-500/50"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              isActive ? "translate-x-5" : ""
            }`}
          />
        </button>
        <span className="text-sm text-slate-300">
          {isActive ? "Active" : "Deactivated (locked out)"}
        </span>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Save Changes
        </button>
      </div>
    </form>
  );
}
