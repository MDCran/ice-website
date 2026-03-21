import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Building2, ArrowLeft } from "lucide-react";
import ClientTabs from "./ClientTabs";

export const metadata = { title: "Client Detail | ICE Admin" };

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
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Clients
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <Building2 size={20} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold admin-text">
            {client.company_name}
          </h1>
          <p className="text-xs text-slate-500 font-mono">{client.id}</p>
        </div>
      </div>

      <ClientTabs client={client} />
    </div>
  );
}
