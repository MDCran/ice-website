import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Globe01, Phone01, MarkerPin02, Mail01, Edit01 } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";

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
      <div className="py-12 text-center text-md text-tertiary">
        Account not found.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display-xs font-semibold text-primary">
            Company &amp; Contacts
          </h1>
          <p className="mt-1 text-md text-tertiary">
            View your company information and contacts
          </p>
        </div>
        <Button
          href="/portal/contacts"
          size="md"
          color="primary"
          iconLeading={<Edit01 data-icon />}
        >
          Manage Contacts
        </Button>
      </div>

      {/* Company Info */}
      <div className="mb-8 rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        <h2 className="mb-4 text-md font-semibold text-primary">
          Company Information
        </h2>
        <div className="flex items-start gap-6">
          {account.logo_url && (
            <img
              src={account.logo_url}
              alt={account.company_name}
              className="size-16 rounded-lg bg-secondary object-contain p-2 ring-1 ring-secondary ring-inset"
            />
          )}
          <div className="grid flex-1 grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2">
            <div>
              <div className="mb-1 text-sm font-medium text-tertiary">
                Company Name
              </div>
              <div className="text-sm font-medium text-primary">
                {account.company_name}
              </div>
            </div>
            {account.account_number && (
              <div>
                <div className="mb-1 text-sm font-medium text-tertiary">
                  Account Number
                </div>
                <div className="font-mono text-sm text-secondary">
                  {account.account_number}
                </div>
              </div>
            )}
            {(account.address || account.city || account.state) && (
              <div>
                <div className="mb-1 flex items-center gap-1 text-sm font-medium text-tertiary">
                  <MarkerPin02 aria-hidden="true" className="size-3.5 text-fg-quaternary" />
                  Address
                </div>
                <div className="text-sm text-secondary">
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
                <div className="mb-1 flex items-center gap-1 text-sm font-medium text-tertiary">
                  <Phone01 aria-hidden="true" className="size-3.5 text-fg-quaternary" />
                  Phone
                </div>
                <div className="text-sm text-secondary">{account.phone}</div>
              </div>
            )}
            {account.website && (
              <div>
                <div className="mb-1 flex items-center gap-1 text-sm font-medium text-tertiary">
                  <Globe01 aria-hidden="true" className="size-3.5 text-fg-quaternary" />
                  Website
                </div>
                <a
                  href={account.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm text-sm font-semibold text-brand-secondary outline-focus-ring transition duration-100 ease-linear hover:text-brand-secondary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {account.website}
                </a>
              </div>
            )}
            {account.industry && (
              <div>
                <div className="mb-1 text-sm font-medium text-tertiary">
                  Industry
                </div>
                <div className="text-sm text-secondary">{account.industry}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contacts */}
      <div className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
        <div className="flex items-center gap-2 border-b border-secondary px-4 py-5 md:px-6">
          <h2 className="text-md font-semibold text-primary">Contacts</h2>
          <Badge type="pill-color" size="sm" color="gray">
            {contacts.length}
          </Badge>
        </div>
        {contacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr className="border-b border-secondary">
                  <th className="px-6 py-3 text-left text-xs font-semibold whitespace-nowrap text-quaternary">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold whitespace-nowrap text-quaternary">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold whitespace-nowrap text-quaternary">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold whitespace-nowrap text-quaternary">
                    Title
                  </th>
                </tr>
              </thead>
              <tbody>
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
                      className="border-b border-secondary transition-colors last:border-b-0 hover:bg-secondary"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-primary">
                          {contact.first_name} {contact.last_name}
                        </span>
                        {contact.is_primary && (
                          <Badge type="pill-color" size="sm" color="brand" className="ml-2">
                            Primary
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {primaryEmail ? (
                          <div className="flex items-center gap-1.5 text-sm text-tertiary">
                            <Mail01 aria-hidden="true" className="size-3.5 text-fg-quaternary" />
                            {primaryEmail.email_address}
                          </div>
                        ) : (
                          <span className="text-sm text-quaternary">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {primaryPhone ? (
                          <div className="flex items-center gap-1.5 text-sm text-tertiary">
                            <Phone01 aria-hidden="true" className="size-3.5 text-fg-quaternary" />
                            {primaryPhone.phone_number}
                          </div>
                        ) : (
                          <span className="text-sm text-quaternary">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-tertiary">
                        {contact.title || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-tertiary">
            No contacts found.
          </div>
        )}
      </div>
    </div>
  );
}
