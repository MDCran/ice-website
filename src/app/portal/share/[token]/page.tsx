import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { FileX02 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

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
      <FeaturedIcon color="error" theme="light" size="xl" icon={FileX02} className="mb-4" />
      <h2 className="mb-2 text-xl font-semibold text-primary">
        Document Not Found
      </h2>
      <p className="mb-6 max-w-md text-md text-tertiary">
        The shared document could not be found or you do not have permission to
        access it.
      </p>
      <Button href="/portal" size="md" color="primary">
        Back to Dashboard
      </Button>
    </div>
  );
}
