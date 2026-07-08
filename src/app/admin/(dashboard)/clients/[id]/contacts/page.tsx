import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Users01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import ContactsManager from "@/components/admin/clients/ContactsManager";

export const metadata = { title: "Client Contacts | ICE Admin" };

export default async function ClientContactsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("client_accounts")
    .select("id, company_name")
    .eq("id", id)
    .single();

  if (!client) notFound();

  const { data: contacts } = await supabase
    .from("client_contacts")
    .select(`
      *,
      contact_phones (*),
      contact_emails (*)
    `)
    .eq("client_account_id", id)
    .order("last_name", { ascending: true });

  return (
    <div>
      <div className="mb-6">
        <Button color="link-gray" size="sm" href={`/admin/clients/${id}`} iconLeading={<ArrowLeft data-icon />}>
          Back to {client.company_name}
        </Button>
      </div>

      <div className="mb-8 flex items-center gap-3">
        <FeaturedIcon icon={Users01} color="brand" theme="modern" size="lg" />
        <div>
          <h1 className="text-xl font-semibold text-primary">Contacts</h1>
          <p className="text-sm text-tertiary">{client.company_name}</p>
        </div>
      </div>

      <ContactsManager clientId={id} initialContacts={contacts ?? []} />
    </div>
  );
}
