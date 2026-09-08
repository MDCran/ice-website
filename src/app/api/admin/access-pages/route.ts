import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { can } from "@/lib/admin/permissions";
import { requireAdminCapability } from "@/lib/admin/requireAdminCapability";
import {
  accessGrantForAdmin,
  accessSettingsForAdmin,
} from "@/lib/access-pages/admin";
import { createAccessToken, hashAccessPassword } from "@/lib/access-pages/crypto";
import {
  cleanupDeletedAccessPageFiles,
  cleanupReplacedPrivateAccessFile,
} from "@/lib/access-pages/storage";

const SETTINGS_KEY = "access_settings";
const MAX_GRANTS = 100;
const PAGE_TYPES = new Set(["proposal_text", "proposal_cards", "proposal_table", "proposal_timeline", "proposal_callout"]);
const PRIVATE_PAGE_STATE = {
  page_type: "static",
  is_published: false,
  publish_status: "draft",
  scheduled_publish_at: null,
  published_at: null,
} as const;

type JsonRecord = Record<string, unknown>;

type AccessGrant = {
  id: string;
  label: string;
  recipient_hint: string;
  token_hash: string;
  token_prefix: string;
  password_hash: string;
  expires_at: string | null;
  revoked_at: string | null;
  max_views: number | null;
  view_count: number;
  last_viewed_at: string | null;
  created_at: string;
};

const clean = (value: unknown, max = 500) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

function slugify(value: unknown) {
  return clean(value, 100)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function positiveInteger(value: unknown, max = 1_000_000) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : null;
}

function nextUpdatedAt(previous: unknown): string {
  const previousMs =
    typeof previous === "string" && !Number.isNaN(Date.parse(previous))
      ? Date.parse(previous)
      : 0;
  return new Date(Math.max(Date.now(), previousMs + 1)).toISOString();
}

function settingsFrom(value: unknown): JsonRecord & { grants: AccessGrant[] } {
  const raw = value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
  return {
    ...raw,
    schema_version: 1,
    grants: Array.isArray(raw.grants) ? raw.grants as AccessGrant[] : [],
  };
}

function editableSettings(body: JsonRecord, current: JsonRecord & { grants: AccessGrant[] }) {
  const rawStatus = clean(body.status, 20);
  const status = ["draft", "active", "archived"].includes(rawStatus) ? rawStatus : "draft";
  return {
    ...current,
    schema_version: 1,
    status,
    template_key: clean(body.template_key, 50) || "proposal",
    client_name: clean(body.client_name, 180),
    document_title: clean(body.document_title, 240),
    prepared_for: clean(body.prepared_for, 180),
    prepared_by: clean(body.prepared_by, 180) || "International Computer Exchange",
    prepared_date: clean(body.prepared_date, 40),
    intro: clean(body.intro, 2000),
    hero_image: clean(body.hero_image, 2000),
    hero_video: clean(body.hero_video, 2000),
    pdf_url: clean(body.pdf_url, 2000),
    allow_download: body.allow_download === true,
    grants: current.grants,
  };
}

function starterSections(title: string) {
  return [
    {
      section_key: "executive-summary",
      section_type: "proposal_text",
      sort_order: 10,
      is_visible: true,
      content: {
        eyebrow: "Executive summary",
        heading: "A clear path from today to the target environment",
        body: `Use this section to frame ${title || "the engagement"}, the business drivers, and the outcome ICE is proposing.`,
        bullets: ["Current-state priorities", "Recommended architecture", "Expected business outcomes"],
      },
    },
    {
      section_key: "solution-overview",
      section_type: "proposal_cards",
      sort_order: 20,
      is_visible: true,
      content: {
        eyebrow: "Solution",
        heading: "Proposed solution",
        body: "Summarize the major components of the solution.",
        items: [
          { title: "Platform", description: "Describe the production platform and capacity.", value: "" },
          { title: "Protection", description: "Describe backup, recovery, and security controls.", value: "" },
          { title: "Operations", description: "Describe monitoring, support, and service ownership.", value: "" },
        ],
      },
    },
    {
      section_key: "timeline",
      section_type: "proposal_timeline",
      sort_order: 30,
      is_visible: true,
      content: {
        eyebrow: "Delivery plan",
        heading: "Implementation timeline",
        body: "Set clear phases and ownership for delivery.",
        items: [
          { title: "Discover", description: "Confirm requirements and dependencies.", value: "Week 1" },
          { title: "Build", description: "Configure and validate the target environment.", value: "Weeks 2–3" },
          { title: "Migrate", description: "Cut over, stabilize, and transition to operations.", value: "Week 4" },
        ],
      },
    },
    {
      section_key: "investment",
      section_type: "proposal_table",
      sort_order: 40,
      is_visible: true,
      content: {
        eyebrow: "Investment",
        heading: "Commercial summary",
        body: "Edit the columns and rows to match the proposal.",
        columns: ["Service", "Term", "Investment"],
        rows: [["Managed platform", "36 months", "$—"], ["Implementation", "One time", "$—"]],
      },
    },
    {
      section_key: "next-steps",
      section_type: "proposal_callout",
      sort_order: 50,
      is_visible: true,
      content: {
        eyebrow: "Next steps",
        heading: "Ready to move forward?",
        body: "Confirm the scope, finalize dates, and authorize ICE to begin implementation.",
        bullets: ["Review the proposed scope", "Confirm commercial terms", "Schedule the project kickoff"],
      },
    },
  ];
}

async function loadAccessPage(supabase: Awaited<ReturnType<typeof requireAdminCapability>>["supabase"], id: string) {
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (pageError || !page) return { error: pageError?.message || "Access page not found." } as const;

  const { data: sections, error: sectionError } = await supabase
    .from("page_sections")
    .select("*")
    .eq("page_id", id)
    .order("sort_order", { ascending: true });
  if (sectionError) return { error: sectionError.message } as const;
  const settingsRow = (sections ?? []).find((section) => section.section_key === SETTINGS_KEY);
  if (!settingsRow) return { error: "This is not an access page." } as const;
  return { page, sections: sections ?? [], settingsRow, settings: settingsFrom(settingsRow.content) } as const;
}

export async function GET() {
  const auth = await requireAdminCapability("access.manage");
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data: settingsRows, error } = await auth.supabase
    .from("page_sections")
    .select("id,page_id,content,updated_at,pages!inner(id,slug,title,updated_at,is_published)")
    .eq("section_key", SETTINGS_KEY)
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const pages = (settingsRows ?? []).map((row) => {
    const page = Array.isArray(row.pages) ? row.pages[0] : row.pages;
    const settings = accessSettingsForAdmin(row.content);
    return { ...page, settings, settings_row_id: row.id };
  });
  return NextResponse.json({ pages });
}

export async function POST(request: Request) {
  const auth = await requireAdminCapability("access.manage");
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => ({})) as JsonRecord;
  const action = clean(body.action, 40);

  if (action === "create") {
    const clientName = clean(body.client_name, 180);
    const title = clean(body.document_title, 240) || (clientName ? `${clientName} proposal` : "New client proposal");
    const slug = slugify(body.slug || `${clientName || title}-${new Date().getFullYear()}`);
    if (!slug) return NextResponse.json({ error: "Enter a valid page name or URL slug." }, { status: 400 });

    const { data: page, error: pageError } = await auth.supabase.from("pages").insert({
      slug,
      title,
      ...PRIVATE_PAGE_STATE,
      meta_title: title,
      meta_description: `Private proposal prepared for ${clientName || "an ICE client"}.`,
      updated_by: auth.user.id,
    }).select("*").single();
    if (pageError || !page) return NextResponse.json({ error: pageError?.message || "Could not create the page." }, { status: 400 });

    const settings = editableSettings({
      ...body,
      status: "draft",
      document_title: title,
      prepared_for: clean(body.prepared_for, 180) || clientName,
      prepared_by: "International Computer Exchange",
      prepared_date: new Date().toISOString().slice(0, 10),
    }, { schema_version: 1, grants: [] });

    const { error: sectionsError } = await auth.supabase.from("page_sections").insert([
      {
        page_id: page.id,
        section_key: SETTINGS_KEY,
        section_type: "access_settings",
        content: settings,
        sort_order: -1000,
        is_visible: false,
        updated_by: auth.user.id,
      },
      ...starterSections(title).map((section) => ({ ...section, page_id: page.id, updated_by: auth.user.id })),
    ]);
    if (sectionsError) {
      await auth.supabase.from("pages").delete().eq("id", page.id);
      return NextResponse.json({ error: sectionsError.message }, { status: 400 });
    }
    return NextResponse.json({ page }, { status: 201 });
  }

  const id = clean(body.id, 80);
  if (!id) return NextResponse.json({ error: "Access page id is required." }, { status: 400 });
  const loaded = await loadAccessPage(auth.supabase, id);
  if ("error" in loaded) return NextResponse.json({ error: loaded.error }, { status: 404 });

  if (action === "duplicate") {
    const requestedTitle = clean(body.document_title, 240) || `${loaded.page.title} copy`;
    const requestedClientName = clean(body.client_name, 180);
    const requestedPreparedFor = clean(body.prepared_for, 180) || requestedClientName;
    const slug = slugify(body.slug || `${loaded.page.slug}-copy`);
    if (!slug) return NextResponse.json({ error: "Enter a valid URL slug." }, { status: 400 });
    const { data: page, error: pageError } = await auth.supabase.from("pages").insert({
      slug,
      title: requestedTitle,
      ...PRIVATE_PAGE_STATE,
      meta_title: requestedTitle,
      meta_description: `Private proposal prepared for ${requestedClientName || "an ICE client"}.`,
      updated_by: auth.user.id,
    }).select("*").single();
    if (pageError || !page) return NextResponse.json({ error: pageError?.message || "Could not duplicate the page." }, { status: 400 });

    const copies = loaded.sections.map((section) => ({
      page_id: page.id,
      section_key: section.section_key,
      section_type: section.section_type,
      content: section.section_key === SETTINGS_KEY
        ? {
            ...settingsFrom(section.content),
            status: "draft",
            template_key: "proposal",
            client_name: requestedClientName,
            document_title: requestedTitle,
            prepared_for: requestedPreparedFor,
            pdf_url: "",
            grants: [],
          }
        : section.content,
      sort_order: section.sort_order,
      is_visible: section.is_visible,
      updated_by: auth.user.id,
    }));
    const { error: copyError } = await auth.supabase.from("page_sections").insert(copies);
    if (copyError) {
      await auth.supabase.from("pages").delete().eq("id", page.id);
      return NextResponse.json({ error: copyError.message }, { status: 400 });
    }
    return NextResponse.json({ page }, { status: 201 });
  }

  if (action === "save") {
    const title = clean(body.document_title, 240) || loaded.page.title;
    const slug = slugify(body.slug) || loaded.page.slug;
    const settings = editableSettings(body, loaded.settings);
    const now = nextUpdatedAt(loaded.settingsRow.updated_at);
    const { error: pageError } = await auth.supabase.from("pages").update({
      slug,
      title,
      ...PRIVATE_PAGE_STATE,
      meta_title: title,
      meta_description: clean(body.intro, 500) || loaded.page.meta_description,
      updated_at: now,
      updated_by: auth.user.id,
    }).eq("id", id);
    if (pageError) return NextResponse.json({ error: pageError.message }, { status: 400 });
    let settingsUpdate = auth.supabase.from("page_sections").update({
      content: settings,
      is_visible: false,
      sort_order: -1000,
      updated_at: now,
      updated_by: auth.user.id,
    }).eq("id", loaded.settingsRow.id);
    settingsUpdate = loaded.settingsRow.updated_at
      ? settingsUpdate.eq("updated_at", loaded.settingsRow.updated_at)
      : settingsUpdate.is("updated_at", null);
    const { data: savedSettingsRow, error: settingsError } = await settingsUpdate
      .select("id")
      .maybeSingle();
    if (settingsError) return NextResponse.json({ error: settingsError.message }, { status: 400 });
    if (!savedSettingsRow) {
      return NextResponse.json(
        { error: "This page changed while you were editing it. Reload and try again." },
        { status: 409 },
      );
    }

    const incoming = Array.isArray(body.sections) ? body.sections.slice(0, 80) : [];
    const normalized = incoming.map((raw, index) => {
      const section = raw && typeof raw === "object" ? raw as JsonRecord : {};
      const sectionType = clean(section.section_type, 50);
      const fallbackKey = `section-${index + 1}`;
      return {
        id: clean(section.id, 80),
        page_id: id,
        section_key: slugify(section.section_key) || fallbackKey,
        section_type: PAGE_TYPES.has(sectionType) ? sectionType : "proposal_text",
        content: section.content && typeof section.content === "object" && !Array.isArray(section.content) ? section.content : {},
        sort_order: (index + 1) * 10,
        is_visible: section.is_visible !== false,
        updated_at: now,
        updated_by: auth.user.id,
      };
    });
    const existing = loaded.sections.filter((section) => section.section_key !== SETTINGS_KEY);
    const incomingIds = new Set(normalized.map((section) => section.id).filter(Boolean));
    const removedIds = existing.map((section) => section.id).filter((sectionId) => !incomingIds.has(sectionId));
    if (removedIds.length) {
      const { error } = await auth.supabase.from("page_sections").delete().in("id", removedIds);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }
    for (const section of normalized) {
      const values = {
        section_key: section.section_key,
        section_type: section.section_type,
        content: section.content,
        sort_order: section.sort_order,
        is_visible: section.is_visible,
        updated_at: section.updated_at,
        updated_by: section.updated_by,
      };
      if (section.id) {
        const { error } = await auth.supabase.from("page_sections").update(values).eq("id", section.id).eq("page_id", id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      } else {
        const { error } = await auth.supabase.from("page_sections").insert({ ...values, page_id: id });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    const { data: savedSections, error: reloadError } = await auth.supabase
      .from("page_sections")
      .select("id,section_key,section_type,content,sort_order,is_visible")
      .eq("page_id", id)
      .neq("section_key", SETTINGS_KEY)
      .order("sort_order", { ascending: true });
    if (reloadError) return NextResponse.json({ error: reloadError.message }, { status: 400 });
    let cleanupWarning = "";
    try {
      const cleanup = await cleanupReplacedPrivateAccessFile(
        loaded.settings.pdf_url,
        settings.pdf_url,
      );
      if (cleanup.errors.length) {
        cleanupWarning = "The page was saved, but an older private file could not be removed automatically.";
      }
    } catch {
      cleanupWarning = "The page was saved, but an older private file could not be removed automatically.";
    }
    return NextResponse.json({
      ok: true,
      slug,
      settings: accessSettingsForAdmin(settings),
      sections: savedSections ?? [],
      ...(cleanupWarning ? { warning: cleanupWarning } : {}),
    });
  }

  if (action === "generate_link") {
    if (loaded.settings.status !== "active") {
      return NextResponse.json({ error: "Set the page status to Active before creating a link." }, { status: 400 });
    }
    if (loaded.settings.grants.length >= MAX_GRANTS) {
      return NextResponse.json(
        { error: `This page already has the maximum of ${MAX_GRANTS} access links. Revoke or remove an old link before creating another.` },
        { status: 400 },
      );
    }
    if (body.password !== null && body.password !== undefined && typeof body.password !== "string") {
      return NextResponse.json(
        { error: "The optional access password must be text." },
        { status: 400 },
      );
    }
    const password = typeof body.password === "string" ? body.password.trim() : "";
    if (password && (password.length < 8 || password.length > 200)) {
      return NextResponse.json(
        { error: "Access passwords must contain between 8 and 200 characters after trimming." },
        { status: 400 },
      );
    }
    const { token: rawToken, tokenHash, tokenPrefix } = createAccessToken();
    const expiryInput = clean(body.expires_at, 80);
    const expiryDate = expiryInput ? new Date(expiryInput) : null;
    if (expiryDate && Number.isNaN(expiryDate.getTime())) {
      return NextResponse.json({ error: "Enter a valid expiration date." }, { status: 400 });
    }
    if (expiryDate && expiryDate.getTime() <= Date.now()) {
      return NextResponse.json({ error: "Expiration must be in the future." }, { status: 400 });
    }
    const grant: AccessGrant = {
      id: randomUUID(),
      label: clean(body.label, 160) || "Client access",
      recipient_hint: clean(body.recipient_hint, 200),
      token_hash: tokenHash,
      token_prefix: tokenPrefix,
      password_hash: password ? await hashAccessPassword(password) : "",
      expires_at: expiryDate ? expiryDate.toISOString() : null,
      revoked_at: null,
      max_views: positiveInteger(body.max_views),
      view_count: 0,
      last_viewed_at: null,
      created_at: new Date().toISOString(),
    };
    const settings = { ...loaded.settings, grants: [grant, ...loaded.settings.grants] };
    const nextGrantUpdatedAt = nextUpdatedAt(loaded.settingsRow.updated_at);
    let grantUpdate = auth.supabase.from("page_sections").update({
      content: settings,
      updated_at: nextGrantUpdatedAt,
      updated_by: auth.user.id,
    }).eq("id", loaded.settingsRow.id);
    grantUpdate = loaded.settingsRow.updated_at
      ? grantUpdate.eq("updated_at", loaded.settingsRow.updated_at)
      : grantUpdate.is("updated_at", null);
    const { data: savedGrantRow, error } = await grantUpdate.select("id").maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!savedGrantRow) {
      return NextResponse.json(
        { error: "Access activity changed while the link was being created. Try again." },
        { status: 409 },
      );
    }
    const origin = new URL(request.url).origin;
    const shareUrl = `${origin}/access/${encodeURIComponent(loaded.page.slug)}/open?key=${encodeURIComponent(rawToken)}`;
    return NextResponse.json({ grant: accessGrantForAdmin(grant), share_url: shareUrl });
  }

  if (action === "revoke_link") {
    const grantId = clean(body.grant_id, 80);
    const now = nextUpdatedAt(loaded.settingsRow.updated_at);
    const grants = loaded.settings.grants.map((grant) => grant.id === grantId ? { ...grant, revoked_at: now } : grant);
    if (!grants.some((grant) => grant.id === grantId)) return NextResponse.json({ error: "Access link not found." }, { status: 404 });
    let revokeUpdate = auth.supabase.from("page_sections").update({
      content: { ...loaded.settings, grants },
      updated_at: now,
      updated_by: auth.user.id,
    }).eq("id", loaded.settingsRow.id);
    revokeUpdate = loaded.settingsRow.updated_at
      ? revokeUpdate.eq("updated_at", loaded.settingsRow.updated_at)
      : revokeUpdate.is("updated_at", null);
    const { data: revokedRow, error } = await revokeUpdate.select("id").maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!revokedRow) {
      return NextResponse.json(
        { error: "Access activity changed while the link was being revoked. Try again." },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: true, grants: grants.map(accessGrantForAdmin) });
  }

  if (action === "archive") {
    const now = nextUpdatedAt(loaded.settingsRow.updated_at);
    let archiveUpdate = auth.supabase.from("page_sections").update({
      content: { ...loaded.settings, status: "archived" },
      updated_at: now,
      updated_by: auth.user.id,
    }).eq("id", loaded.settingsRow.id);
    archiveUpdate = loaded.settingsRow.updated_at
      ? archiveUpdate.eq("updated_at", loaded.settingsRow.updated_at)
      : archiveUpdate.is("updated_at", null);
    const { data: archivedRow, error } = await archiveUpdate.select("id").maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!archivedRow) {
      return NextResponse.json(
        { error: "Access activity changed while the page was being archived. Try again." },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    if (!can(auth.role, "cms.delete")) return NextResponse.json({ error: "Your role cannot permanently delete pages." }, { status: 403 });
    const { error } = await auth.supabase.from("pages").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    let cleanupWarning = "";
    try {
      const cleanup = await cleanupDeletedAccessPageFiles(id, loaded.settings.pdf_url);
      if (cleanup.errors.length) {
        cleanupWarning = "The page was deleted, but one or more private files need manual cleanup.";
      }
    } catch {
      cleanupWarning = "The page was deleted, but one or more private files need manual cleanup.";
    }
    return NextResponse.json({
      ok: true,
      ...(cleanupWarning ? { warning: cleanupWarning } : {}),
    });
  }

  return NextResponse.json({ error: "Unknown access-page action." }, { status: 400 });
}
