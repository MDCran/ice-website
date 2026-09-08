import { createClient } from "@/lib/supabase/server";
import { can, type AdminCapability } from "@/lib/admin/permissions";

/** Authenticate an admin request and enforce a capability on the server. */
export async function requireAdminCapability(capability: AdminCapability) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false as const,
      status: 401,
      error: "Unauthorized",
      supabase,
      user: null,
    };
  }

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !can(profile.role, capability)) {
    return {
      ok: false as const,
      status: 403,
      error: "Forbidden",
      supabase,
      user,
    };
  }

  return {
    ok: true as const,
    status: 200,
    supabase,
    user,
    role: profile.role,
  };
}
