import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Receipt } from "lucide-react";
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
        <Link
          href={`/admin/clients/${id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Back to {client.company_name}
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Receipt size={20} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold admin-text">Invoices</h1>
          <p className="text-sm text-slate-400">{client.company_name}</p>
        </div>
      </div>

      <InvoicesManager clientId={id} initialInvoices={invoices ?? []} />
    </div>
  );
}
