import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Receipt } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import InvoicesManager from "@/components/admin/clients/InvoicesManager";

export const metadata = { title: "Client Invoices | ICE Admin" };

export default async function ClientInvoicesPage({
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

  const { data: invoices } = await supabase
    .from("client_invoices")
    .select("*")
    .eq("client_account_id", id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <Button color="link-gray" size="sm" href={`/admin/clients/${id}`} iconLeading={<ArrowLeft data-icon />}>
          Back to {client.company_name}
        </Button>
      </div>

      <div className="mb-8 flex items-center gap-3">
        <FeaturedIcon icon={Receipt} color="warning" theme="modern" size="lg" />
        <div>
          <h1 className="text-xl font-semibold text-primary">Invoices</h1>
          <p className="text-sm text-tertiary">{client.company_name}</p>
        </div>
      </div>

      <InvoicesManager clientId={id} initialInvoices={invoices ?? []} />
    </div>
  );
}
