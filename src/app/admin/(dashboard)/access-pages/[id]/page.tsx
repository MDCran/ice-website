import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { can } from "@/lib/admin/permissions";
import { accessSettingsForAdmin } from "@/lib/access-pages/admin";
import AccessPageEditor from "./AccessPageEditor";

export const metadata = { title: "Edit Access Page | ICE Admin" };

export default async function EditAccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const [{ data: page }, { data: sections }] = await Promise.all([
    supabase.from("pages").select("*").eq("id", id).maybeSingle(),
    supabase.from("page_sections").select("*").eq("page_id", id).order("sort_order", { ascending: true }),
  ]);
  if (!page) notFound();
  const settingsRow = (sections ?? []).find((section) => section.section_key === "access_settings");
  if (!settingsRow) notFound();

  return (
    <AccessPageEditor
      page={page}
      settings={accessSettingsForAdmin(settingsRow.content)}
      sections={(sections ?? []).filter((section) => section.section_key !== "access_settings")}
    />
  );
}
