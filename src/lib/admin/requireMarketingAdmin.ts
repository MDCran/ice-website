import { createClient } from "@/lib/supabase/server";
import { can } from "@/lib/admin/permissions";

export async function requireMarketingAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401, error: "Unauthorized", supabase, user: null };

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !can(profile.role, "marketing.manage")) {
    return { ok: false as const, status: 403, error: "Forbidden", supabase, user };
  }

  return { ok: true as const, status: 200, supabase, user, role: profile.role };
}

