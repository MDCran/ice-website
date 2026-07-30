import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/auditLog";
import { can } from "@/lib/admin/permissions";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

const WELCOME_SURVEY_QUESTIONS = [
  {
    question_type: "short_text",
    question_text: "Who is the primary technical contact for this engagement?",
    description: null,
    config: {},
    is_required: true,
    sort_order: 0,
  },
  {
    question_type: "yes_no",
    question_text: "Do you currently have a documented disaster recovery plan?",
    description: null,
    config: {},
    is_required: true,
    sort_order: 1,
  },
  {
    question_type: "multiple_choice",
    question_text: "Which platforms are in scope?",
    description: "Select all that apply.",
    config: {
      choices: ["IBM i / Power", "Microsoft 365", "VMware / x86", "Public cloud", "Other"],
      maxSelections: 5,
    },
    is_required: true,
    sort_order: 2,
  },
];

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: adminProfile } = await supabase
    .from("admin_profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!adminProfile || !can(adminProfile.role, "clients.provision")) {
    return NextResponse.json(
      { error: "Forbidden — your role cannot provision clients" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const {
    company_name,
    address,
    phone,
    website,
    portal_email,
    portal_password,
    seed_welcome_survey = false,
    seed_welcome_resource = false,
  } = body;

  if (!company_name?.trim()) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  if (!portal_email?.trim() || !portal_password?.trim()) {
    return NextResponse.json(
      { error: "Portal email and password are required" },
      { status: 400 },
    );
  }

  const slug = slugify(company_name);

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

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: portal_email.trim(),
    password: portal_password.trim(),
    email_confirm: true,
  });

  if (authError) {
    await supabase.from("client_accounts").delete().eq("id", client.id);
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const { error: clientUserError } = await supabase.from("client_users").insert({
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
    return NextResponse.json({ error: clientUserError.message }, { status: 400 });
  }

  const seeded: string[] = [];

  if (seed_welcome_survey) {
    const { data: survey, error: surveyError } = await supabase
      .from("surveys")
      .insert({
        client_account_id: client.id,
        title: "Welcome / onboarding intake",
        description:
          "Quick intake so ICE can confirm contacts, platforms, and DR readiness.",
        status: "draft",
      })
      .select("id")
      .single();

    if (!surveyError && survey?.id) {
      await supabase.from("survey_questions").insert(
        WELCOME_SURVEY_QUESTIONS.map((q) => ({ ...q, survey_id: survey.id })),
      );
      seeded.push("welcome_survey");
    }
  }

  if (seed_welcome_resource) {
    const { error: resourceError } = await supabase.from("client_resources").insert({
      client_account_id: client.id,
      title: "Getting started with the ICE portal",
      description:
        "Bookmark this space for invoices, QBR reports, surveys, and shared documents.",
      author: "ICE Client Success",
      file_url: "/for-ai",
      storage_path: "",
      mime_type: "text/html",
      allow_download: false,
      visibility: "published",
      category: "Onboarding",
      version_label: "v1",
    });
    if (!resourceError) seeded.push("welcome_resource");
  }

  await writeAuditLog(supabase, {
    action: seeded.length ? "client.provisioned" : "client.created",
    entityType: "client_account",
    entityId: client.id,
    summary: `Provisioned ${company_name.trim()}`,
    metadata: { slug, seeded, portal_email: portal_email.trim() },
  });

  return NextResponse.json({ id: client.id, slug, seeded });
}
