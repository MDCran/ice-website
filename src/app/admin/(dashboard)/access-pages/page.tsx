import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { can } from "@/lib/admin/permissions";
import { accessSettingsForAdmin } from "@/lib/access-pages/admin";
import AccessPagesManager from "./AccessPagesManager";

export const metadata = { title: "Access Pages | ICE Admin" };

export default async function AccessPagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || !can(profile.role, "access.manage")) redirect("/admin");

  const { data, error } = await supabase
    .from("page_sections")
    .select("id,page_id,content,updated_at,pages!inner(id,slug,title,updated_at,is_published)")
    .eq("section_key", "access_settings")
    .order("updated_at", { ascending: false });

  const pages = (data ?? []).map((row) => ({
    ...((Array.isArray(row.pages) ? row.pages[0] : row.pages) ?? {}),
    settings_row_id: row.id,
    settings: accessSettingsForAdmin(row.content),
  }));

  return <AccessPagesManager initialPages={pages} loadError={error?.message ?? null} canDelete={can(profile.role, "cms.delete")} />;
}
