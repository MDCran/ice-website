import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { FileX } from "lucide-react";
import Link from "next/link";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const supabase = await createClient();

  // Verify user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user's account
  const { data: clientUser } = await supabase
    .from("client_users")
    .select("client_account_id")
    .eq("id", user.id)
    .single();
  if (!clientUser) notFound();

  // Look up share token in client_resources
  const { data: resource } = await supabase
    .from("client_resources")
    .select("id, client_account_id")
    .eq("share_token", token)
    .single();

  if (resource && resource.client_account_id === clientUser.client_account_id) {
    redirect("/portal/resources");
  }

  // Look up share token in client_invoices
  const { data: invoice } = await supabase
    .from("client_invoices")
    .select("id, client_account_id")
    .eq("share_token", token)
    .single();

  if (invoice && invoice.client_account_id === clientUser.client_account_id) {
    redirect("/portal/invoices");
  }

  // Not found or unauthorized
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <FileX size={32} className="text-red-400" />
      </div>
      <h2 className="text-xl font-bold admin-text mb-2">
        Document Not Found
      </h2>
      <p className="text-sm text-slate-400 mb-6 max-w-md">
        The shared document could not be found or you do not have permission to
        access it.
      </p>
      <Link
        href="/portal"
        className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
