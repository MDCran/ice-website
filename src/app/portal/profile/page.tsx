import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Globe,
  Phone,
  MapPin,
  Mail,
  Users,
  Pencil,
} from "lucide-react";

async function getProfileData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: clientUser } = await supabase
    .from("client_users")
    .select("client_account_id")
    .eq("id", user.id)
    .single();
  if (!clientUser) notFound();

  const { data: account } = await supabase
    .from("client_accounts")
    .select("*")
    .eq("id", clientUser.client_account_id)
    .single();

  const { data: contacts } = await supabase
    .from("client_contacts")
    .select(
      `
      *,
      contact_phones(*),
      contact_emails(*)
    `
    )
    .eq("client_account_id", clientUser.client_account_id)
    .order("last_name", { ascending: true });

  return {
    account,
    contacts: contacts ?? [],
  };
}

export default async function ProfilePage() {
  const { account, contacts } = await getProfileData();

  if (!account) {
    return (
      <div className="text-center py-12 text-slate-400">
        Account not found.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Building2 size={20} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold admin-text">
              Company & Contacts
            </h1>
            <p className="text-sm text-slate-400">
              View your company information and contacts
            </p>
          </div>
        </div>
        <Link
          href="/portal/contacts"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors"
        >
          <Pencil size={14} />
          Manage Contacts
        </Link>
      </div>

      {/* Company Info */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Company Information
        </h2>
        <div className="flex items-start gap-6">
          {account.logo_url && (
            <img
              src={account.logo_url}
              alt={account.company_name}
              className="w-16 h-16 rounded-xl object-contain bg-white/5 p-2"
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 flex-1">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Company Name
              </div>
              <div className="text-sm admin-text font-medium">
                {account.company_name}
              </div>
            </div>
            {account.account_number && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Account Number
                </div>
                <div className="text-sm text-slate-300 font-mono">
                  {account.account_number}
                </div>
              </div>
            )}
            {(account.address || account.city || account.state) && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin size={12} />
                  Address
                </div>
                <div className="text-sm text-slate-300">
                  {[
                    account.address,
                    [account.city, account.state, account.zip]
                      .filter(Boolean)
                      .join(", "),
                    account.country,
                  ]
                    .filter(Boolean)
                    .join("\n")
                    .split("\n")
                    .map((line: string, i: number) => (
                      <div key={i}>{line}</div>
                    ))}
                </div>
              </div>
            )}
            {account.phone && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Phone size={12} />
                  Phone
                </div>
                <div className="text-sm text-slate-300">{account.phone}</div>
              </div>
            )}
            {account.website && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Globe size={12} />
                  Website
                </div>
                <a
                  href={account.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
                >
                  {account.website}
                </a>
              </div>
            )}
            {account.industry && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Industry
                </div>
                <div className="text-sm text-slate-300">{account.industry}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contacts */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <Users size={16} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Contacts ({contacts.length})
          </h2>
        </div>
        {contacts.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Phone
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Title
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {contacts.map((contact) => {
                const primaryEmail = contact.contact_emails?.find(
                  (e: { is_primary: boolean }) => e.is_primary
                );
                const primaryPhone = contact.contact_phones?.find(
                  (p: { is_primary: boolean }) => p.is_primary
                );
                return (
                  <tr
                    key={contact.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium admin-text">
                        {contact.first_name} {contact.last_name}
                      </span>
                      {contact.is_primary && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-500/10 text-sky-400">
                          Primary
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {primaryEmail ? (
                        <div className="flex items-center gap-1.5 text-sm text-slate-300">
                          <Mail size={12} className="text-slate-500" />
                          {primaryEmail.email_address}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {primaryPhone ? (
                        <div className="flex items-center gap-1.5 text-sm text-slate-300">
                          <Phone size={12} className="text-slate-500" />
                          {primaryPhone.phone_number}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {contact.title || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-12 text-center text-slate-500 text-sm">
            No contacts found.
          </div>
        )}
      </div>
    </div>
  );
}
