import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { FileX02 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import SecureShareGate from "@/components/portal/SecureShareGate";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
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

  // Select * so optional share_* columns work once migration is applied.
  const { data: resource } = await supabase
    .from("client_resources")
    .select("*")
    .eq("share_token", token)
    .maybeSingle();

  if (resource && resource.client_account_id === clientUser.client_account_id) {
    const expiresAt = (resource as { share_expires_at?: string | null }).share_expires_at ?? null;
    const requiresPassword = Boolean((resource as { share_password_hash?: string | null }).share_password_hash);
    const watermark = Boolean((resource as { share_watermark?: boolean }).share_watermark);
    const viewCount = (resource as { share_view_count?: number | null }).share_view_count ?? null;

    // Best-effort view tracking (ignore errors if columns missing).
    void supabase
      .from("client_resources")
      .update({
        share_view_count: (viewCount ?? 0) + 1,
        share_last_viewed_at: new Date().toISOString(),
      })
      .eq("id", resource.id)
      .then(() => undefined);

    if (!expiresAt && !requiresPassword && !watermark) {
      redirect("/portal/resources");
    }

    return (
      <SecureShareGate
        meta={{
          title: (resource as { title?: string }).title ?? "Shared resource",
          kind: "resource",
          expiresAt,
          requiresPassword,
          watermark,
          viewCount,
        }}
      >
        <div className="rounded-xl bg-primary p-6 text-center ring-1 ring-secondary">
          <p className="text-md text-tertiary">This link is valid for your account.</p>
          <Button href="/portal/resources" size="md" className="mt-4">
            Open document center
          </Button>
        </div>
      </SecureShareGate>
    );
  }

  const { data: invoice } = await supabase
    .from("client_invoices")
    .select("*")
    .eq("share_token", token)
    .maybeSingle();

  if (invoice && invoice.client_account_id === clientUser.client_account_id) {
    const expiresAt = (invoice as { share_expires_at?: string | null }).share_expires_at ?? null;
    const requiresPassword = Boolean((invoice as { share_password_hash?: string | null }).share_password_hash);
    const viewCount = (invoice as { share_view_count?: number | null }).share_view_count ?? null;

    void supabase
      .from("client_invoices")
      .update({
        share_view_count: (viewCount ?? 0) + 1,
        share_last_viewed_at: new Date().toISOString(),
      })
      .eq("id", invoice.id)
      .then(() => undefined);

    if (!expiresAt && !requiresPassword) {
      redirect("/portal/invoices");
    }

    return (
      <SecureShareGate
        meta={{
          title: (invoice as { title?: string }).title ?? "Shared invoice",
          kind: "invoice",
          expiresAt,
          requiresPassword,
          viewCount,
        }}
      >
        <div className="rounded-xl bg-primary p-6 text-center ring-1 ring-secondary">
          <p className="text-md text-tertiary">This invoice link is valid for your account.</p>
          <Button href="/portal/invoices" size="md" className="mt-4">
            Open invoices
          </Button>
        </div>
      </SecureShareGate>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <FeaturedIcon color="error" theme="light" size="xl" icon={FileX02} className="mb-4" />
      <h2 className="mb-2 text-xl font-semibold text-primary">Document Not Found</h2>
      <p className="mb-6 max-w-md text-md text-tertiary">
        The shared document could not be found or you do not have permission to access it.
      </p>
      <Button href="/portal" size="md" color="primary">
        Back to Dashboard
      </Button>
    </div>
  );
}
