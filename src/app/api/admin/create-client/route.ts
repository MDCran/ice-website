import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

export async function POST(request: Request) {
  // Verify the caller is an admin
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: adminProfile } = await supabase
    .from("admin_profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!adminProfile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { company_name, address, phone, website, portal_email, portal_password } = body;

  if (!company_name?.trim()) {
    return NextResponse.json(
      { error: "Company name is required" },
      { status: 400 }
    );
  }

  if (!portal_email?.trim() || !portal_password?.trim()) {
    return NextResponse.json(
      { error: "Portal email and password are required" },
      { status: 400 }
    );
  }

  const slug = slugify(company_name);

  // Create client account
  const { data: client, error: clientError } = await supabase
    .from("client_accounts")
    .insert({
      company_name: company_name.trim(),
      slug,
      phone: phone?.trim() || null,
      website: website?.trim() || null,
      address_line1: address?.trim() || null,
      is_active: true,
    })
    .select("id")
    .single();

  if (clientError) {
    return NextResponse.json({ error: clientError.message }, { status: 400 });
  }

  // Create auth user + client_users row
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: authUser, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: portal_email.trim(),
      password: portal_password.trim(),
      email_confirm: true,
    });

  if (authError) {
    await supabase.from("client_accounts").delete().eq("id", client.id);
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // Use company name as the user name (individual contacts are separate)
  const { error: clientUserError } = await supabase
    .from("client_users")
    .insert({
      id: authUser.user.id,
      client_account_id: client.id,
      first_name: company_name.trim(),
      last_name: "Portal",
      email: portal_email.trim(),
      role: "admin",
      is_active: true,
    });

  if (clientUserError) {
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
    await supabase.from("client_accounts").delete().eq("id", client.id);
    return NextResponse.json(
      { error: clientUserError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ id: client.id, slug });
}
