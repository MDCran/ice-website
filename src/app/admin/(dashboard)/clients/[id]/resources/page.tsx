import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, File02 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import ResourcesManager from "@/components/admin/clients/ResourcesManager";

export const metadata = { title: "Client Documents | ICE Admin" };

export default async function ClientResourcesPage({
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

  const { data: resources } = await supabase
    .from("client_resources")
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
        <FeaturedIcon icon={File02} color="success" theme="modern" size="lg" />
        <div>
          <h1 className="text-xl font-semibold text-primary">Documents</h1>
          <p className="text-sm text-tertiary">{client.company_name}</p>
        </div>
      </div>

      <ResourcesManager clientId={id} initialResources={resources ?? []} />
    </div>
  );
}
