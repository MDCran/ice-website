import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import { Button } from "@/components/base/buttons/button";
import ClientTabs from "./ClientTabs";

export const metadata = { title: "Client Detail | ICE Admin" };

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || undefined
  );
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from("client_accounts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !client) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Button color="link-gray" size="sm" href="/admin/clients" iconLeading={<ArrowLeft data-icon />}>
          Back to Clients
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <Avatar
          size="lg"
          src={client.logo_url}
          alt={client.company_name}
          initials={getInitials(client.company_name ?? "")}
        />
        <div>
          <h1 className="text-xl font-semibold text-primary">
            {client.company_name}
          </h1>
          <p className="font-mono text-xs text-quaternary">{client.id}</p>
        </div>
      </div>

      <ClientTabs client={client} />
    </div>
  );
}
