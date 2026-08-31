"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, Copy01, Download01, Pencil01, Plus, Trash01, Upload01, XClose } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { NativeSelect } from "@/components/base/select/select-native";
import { Toggle } from "@/components/base/toggle/toggle";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { writeAuditLog } from "@/lib/auditLog";
import { can } from "@/lib/admin/permissions";
import { publicPathForCmsPage, SYSTEM_CMS_SLUGS } from "@/lib/cms/pageRegistry";

interface PageData {
  id: string;
  title: string;
  slug: string;
  page_type: string;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  sort_order: number;
}

const PAGE_TYPES = [
  { value: "static", label: "Generic" },
  { value: "solution", label: "Solution" },
  { value: "legal", label: "Legal" },
  { value: "settings", label: "Settings" },
];

function solutionStarterSections(title: string) {
  const serviceName = title.trim() || "New Solution";
  return [
    {
      section_key: "service_profile",
      section_type: "content",
      sort_order: -1,
      is_visible: true,
      content: {
        listed: true,
        category: "Managed Services",
        category_description: "Managed technology services for enterprise environments.",
        category_icon: "Server",
        icon: "Server",
        card_description: "Describe this service for the solutions catalog.",
        card_image: "",
        card_image_alt: `${serviceName} service`,
        tags: [],
        industries: [],
        platforms: [],
        workloads: [],
        outcome: "",
        link_label: "Learn more",
        finder: {
          enabled: true,
          proof: "",
          outcomes: [],
          timeline: "",
          complexity: "Medium",
          role: "",
          cta_label: "Explore solution",
          next_step: "",
        },
        schema: {
          service_type: "Managed Services",
          aliases: [],
          offer_names: [],
        },
      },
    },
    {
      section_key: "hero",
      section_type: "hero",
      sort_order: 0,
      is_visible: true,
      content: {
        eyebrow: "Managed Solution",
        headline: serviceName,
        subheadline: "Describe the business problem this service solves and why ICE is the right partner.",
        cta_primary: { label: "Talk to an Architect", href: "/contact" },
        cta_secondary: { label: "Explore Solutions", href: "/solutions" },
        proof_labels: ["24/7/365 Support", "Enterprise Architecture", "Managed by ICE"],
        hero_image: "/images/solutions/heroes/managed-cloud-hosting.webp",
        image_alt: `${serviceName} solution illustration`,
      },
    },
    {
      section_key: "features",
      section_type: "features",
      sort_order: 1,
      is_visible: true,
      content: {
        eyebrow: "Capabilities",
        heading: "What You Get",
        description: "Enterprise-grade capabilities included with this service.",
        items: [
          { icon: "Monitor", title: "24/7 Monitoring", description: "Proactive monitoring and rapid incident response.", proof: "Always-on coverage" },
          { icon: "Shield", title: "Enterprise Security", description: "Layered controls for mission-critical workloads.", proof: "Security-first delivery" },
          { icon: "Zap", title: "Fast Implementation", description: "A practical path from assessment to production.", proof: "Designed for momentum" },
        ],
      },
    },
    {
      section_key: "metrics",
      section_type: "metrics",
      sort_order: 2,
      is_visible: true,
      content: {
        enabled: false,
        eyebrow: "Measurable results",
        heading: "Add verified service metrics",
        description: "",
        items: [
          { type: "counter", value: 0, suffix: "", label: "Verified metric" },
        ],
      },
    },
    {
      section_key: "process",
      section_type: "process",
      sort_order: 3,
      is_visible: true,
      content: {
        eyebrow: "How We Work",
        heading: "Our Operating Model",
        description: "A proven, repeatable path from assessment to steady-state operations.",
        items: [
          { step: "01", title: "Assess", description: "Understand the current environment and requirements." },
          { step: "02", title: "Design", description: "Create a practical architecture and rollout plan." },
          { step: "03", title: "Implement", description: "Deploy with clear milestones and minimal disruption." },
          { step: "04", title: "Operate", description: "Monitor, optimize, and report against service goals." },
        ],
      },
    },
    {
      section_key: "benefits",
      section_type: "benefits",
      sort_order: 4,
      is_visible: true,
      content: {
        eyebrow: "Why It Matters",
        heading: "Business Benefits",
        description: "What this service changes for your organization.",
        items: [
          { icon: "Zap", title: "Reduce Operational Overhead", text: "Offload day-to-day management to a dedicated team." },
          { icon: "Shield", title: "Improve Reliability and Security", text: "Hardened, monitored infrastructure with clear accountability." },
          { icon: "BarChart3", title: "Scale With Demand", text: "Capacity that grows with the business." },
        ],
      },
    },
    {
      section_key: "cta",
      section_type: "cta",
      sort_order: 5,
      is_visible: true,
      content: {
        heading: "Ready to Get Started?",
        description: "Contact our enterprise architects to design a solution tailored to your needs.",
        cta_primary: { label: "Contact Us", href: "/contact" },
        cta_secondary: { label: "Explore Solutions", href: "/solutions" },
      },
    },
  ];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

async function revalidateSolutionCatalog(slug: string, publicPath?: string) {
  const response = await fetch("/api/admin/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slug,
      tags: ["solution-catalog"],
      paths: [
        "/solutions",
        "/solutions/find",
        "/sitemap.xml",
        ...(publicPath ? [publicPath] : []),
      ],
    }),
  });
  const result = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;
  if (!response.ok || result?.ok !== true) {
    throw new Error(result?.error || `Public refresh failed (${response.status}).`);
  }
}

export default function CMSPageActions({
  mode,
  page,
  canPublish = false,
  canDelete = false,
  defaultPageType = "static",
  lockPageType = false,
  createLabel = "Create Page",
}: {
  mode: "create" | "row";
  page?: PageData;
  canPublish?: boolean;
  canDelete?: boolean;
  defaultPageType?: string;
  lockPageType?: boolean;
  createLabel?: string;
}) {
  const router = useRouter();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit" | "delete">("create");
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [pageType, setPageType] = useState(defaultPageType);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const isSystemPage = Boolean(page && SYSTEM_CMS_SLUGS.has(page.slug));

  const openCreate = () => {
    setTitle("");
    setSlug("");
    setPageType(defaultPageType);
    setMetaTitle("");
    setMetaDescription("");
    setIsPublished(false);
    setError("");
    setModalType("create");
    setModalOpen(true);
  };

  const openDelete = () => {
    if (!canDelete) {
      setError("Your role cannot delete CMS pages.");
      return;
    }
    if (isSystemPage) {
      setError("System pages cannot be deleted.");
      return;
    }
    setError("");
    setModalType("delete");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      const finalSlug = slug.trim() || slugify(title);
      const publishValue = canPublish ? isPublished : (page?.is_published ?? false);

      if (modalType === "create") {
        let nextSortOrder: number | undefined;
        if (pageType === "solution") {
          const { data: lastSolution, error: orderError } = await supabase
            .from("pages")
            .select("sort_order")
            .eq("page_type", "solution")
            .order("sort_order", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (orderError) {
            setError(orderError.message);
            return;
          }
          nextSortOrder = lastSolution ? (Number(lastSolution.sort_order) || 0) + 1 : 0;
        }

        const { data: insertedPage, error: insertError } = await supabase.from("pages").insert({
          title: title.trim(),
          slug: finalSlug,
          page_type: pageType,
          meta_title: metaTitle.trim() || null,
          meta_description: metaDescription.trim() || null,
          is_published: publishValue,
          ...(nextSortOrder !== undefined ? { sort_order: nextSortOrder } : {}),
        }).select("id").single();
        if (insertError) {
          setError(insertError.message);
          return;
        }
        if (pageType === "solution" && insertedPage?.id) {
          const { error: sectionsError } = await supabase.from("page_sections").insert(
            solutionStarterSections(title).map((section) => ({
              ...section,
              page_id: insertedPage.id,
            })),
          );
          if (sectionsError) {
            const { error: rollbackError } = await supabase.from("pages").delete().eq("id", insertedPage.id);
            setError(
              rollbackError
                ? `${sectionsError.message} The empty draft page could not be removed automatically.`
                : `${sectionsError.message} No page was created.`,
            );
            return;
          }
          if (publishValue) {
            try {
              await revalidateSolutionCatalog(finalSlug);
            } catch (revalidateError) {
              const { error: rollbackError } = await supabase.from("pages").delete().eq("id", insertedPage.id);
              const reason = revalidateError instanceof Error ? revalidateError.message : "Public refresh failed.";
              setError(
                rollbackError
                  ? `${reason} The published service could not be removed automatically.`
                  : `${reason} No service was created. Please try again.`,
              );
              return;
            }
          }
        }
        await writeAuditLog(supabase, {
          action: "cms.page_created",
          entityType: "page",
          entityId: insertedPage?.id,
          summary: `Created ${title.trim()} as ${publishValue ? "published" : "a draft"}`,
          metadata: { slug: finalSlug, page_type: pageType },
        });
        setModalOpen(false);
        startTransition(() => router.push(`/admin/cms/${finalSlug}`));
        return;
      }

      if (modalType === "edit" && page) {
        const { error: updateError } = await supabase
          .from("pages")
          .update({
            title: title.trim(),
            slug: finalSlug,
            page_type: pageType,
            meta_title: metaTitle.trim() || null,
            meta_description: metaDescription.trim() || null,
            is_published: publishValue,
            updated_at: new Date().toISOString(),
          })
          .eq("id", page.id);
        if (updateError) {
          setError(updateError.message);
          return;
        }
      }

      setModalOpen(false);
      startTransition(() => router.refresh());
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!page || isSaving) return;
    if (!canDelete || SYSTEM_CMS_SLUGS.has(page.slug)) {
      setError(SYSTEM_CMS_SLUGS.has(page.slug) ? "System pages cannot be deleted." : "Your role cannot delete CMS pages.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profile } = user
        ? await supabase.from("admin_profiles").select("role").eq("id", user.id).single()
        : { data: null };
      if (!can(profile?.role, "cms.delete")) {
        setError("Your role cannot delete CMS pages.");
        return;
      }

      const { error: deleteError } = await supabase
        .from("pages")
        .delete()
        .eq("id", page.id);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      const publicPath = publicPathForCmsPage(page.slug, page.page_type);
      let postDeleteError = "";
      if (page.page_type === "solution") {
        const { error: navigationError } = await supabase
          .from("navigation_items")
          .delete()
          .eq("href", publicPath);
        if (navigationError) {
          postDeleteError = `Its navigation link could not be removed: ${navigationError.message}`;
        }
      }

      await writeAuditLog(supabase, {
        action: "cms.page_deleted",
        entityType: "page",
        entityId: page.id,
        summary: `Deleted ${page.title}`,
      });

      if (page.page_type === "solution") {
        try {
          await revalidateSolutionCatalog(page.slug, publicPath);
        } catch (revalidateError) {
          const reason = revalidateError instanceof Error ? revalidateError.message : "Public refresh failed.";
          postDeleteError = [postDeleteError, `The public solutions catalog could not be refreshed: ${reason}`]
            .filter(Boolean)
            .join(" ");
        }
      }

      if (postDeleteError) {
        setError(`The service was deleted. ${postDeleteError}`);
        return;
      }

      setModalOpen(false);
      startTransition(() => router.refresh());
    } finally {
      setIsSaving(false);
    }
  };

  const handleClone = async () => {
    if (!page || isSaving) return;
    setError("");
    setIsSaving(true);
    try {
      const supabase = createClient();
      const cloneSlug = `${page.slug}-copy-${Date.now().toString(36).slice(-4)}`;

      const { data: created, error: createError } = await supabase
        .from("pages")
        .insert({
          title: `${page.title} (Copy)`,
          slug: cloneSlug,
          page_type: page.page_type,
          meta_title: page.meta_title,
          meta_description: page.meta_description,
          is_published: false,
          sort_order: page.sort_order + 1,
        })
        .select("id")
        .single();

      if (createError || !created) {
        setError(createError?.message || "Clone failed");
        return;
      }

      const { data: sections, error: sectionsReadError } = await supabase
        .from("page_sections")
        .select("section_key, section_type, content, sort_order, is_visible")
        .eq("page_id", page.id);
      if (sectionsReadError) {
        const { error: rollbackError } = await supabase.from("pages").delete().eq("id", created.id);
        setError(
          rollbackError
            ? `${sectionsReadError.message} The empty clone could not be removed automatically.`
            : `${sectionsReadError.message} No clone was created.`,
        );
        return;
      }

      if (sections?.length) {
        const { error: secError } = await supabase.from("page_sections").insert(
          sections.map((s) => ({
            ...s,
            page_id: created.id,
          })),
        );
        if (secError) {
          const { error: rollbackError } = await supabase.from("pages").delete().eq("id", created.id);
          setError(
            rollbackError
              ? `${secError.message} The partial clone could not be removed automatically.`
              : `${secError.message} No clone was created.`,
          );
          return;
        }
      }

      await writeAuditLog(supabase, {
        action: "cms.page_cloned",
        entityType: "page",
        entityId: created.id,
        summary: `Cloned ${page.title} → ${cloneSlug}`,
        metadata: { source_id: page.id },
      });

      startTransition(() => router.push(`/admin/cms/${cloneSlug}`));
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (!page) return;
    const supabase = createClient();
    const { data: sections } = await supabase
      .from("page_sections")
      .select("section_key, section_type, content, sort_order, is_visible")
      .eq("page_id", page.id)
      .order("sort_order", { ascending: true });

    const payload = {
      exported_at: new Date().toISOString(),
      page: {
        title: page.title,
        slug: page.slug,
        page_type: page.page_type,
        meta_title: page.meta_title,
        meta_description: page.meta_description,
        is_published: page.is_published,
      },
      sections: sections ?? [],
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${page.slug}.ice-page.json`;
    a.click();
    URL.revokeObjectURL(url);

    await writeAuditLog(supabase, {
      action: "cms.page_exported",
      entityType: "page",
      entityId: page.id,
      summary: `Exported ${page.slug}`,
    });
  };

  const handleImportFile = async (file: File) => {
    if (isSaving) return;
    setError("");
    setIsSaving(true);
    try {
      const text = await file.text();
      const payload = JSON.parse(text) as {
        page?: {
          title?: string;
          slug?: string;
          page_type?: string;
          meta_title?: string | null;
          meta_description?: string | null;
        };
        sections?: Array<{
          section_key: string;
          section_type: string;
          content: Record<string, unknown>;
          sort_order?: number;
          is_visible?: boolean;
        }>;
      };
      if (!payload.page?.title) {
        setError("Invalid ICE page JSON (missing page.title).");
        return;
      }
      if (payload.page.page_type && !PAGE_TYPES.some((type) => type.value === payload.page?.page_type)) {
        setError("Invalid ICE page JSON (unsupported page.page_type).");
        return;
      }

      const supabase = createClient();
      const importSlug =
        (payload.page.slug ? slugify(payload.page.slug) : slugify(payload.page.title)) +
        `-import-${Date.now().toString(36).slice(-4)}`;

      const { data: created, error: createError } = await supabase
        .from("pages")
        .insert({
          title: payload.page.title,
          slug: importSlug,
          page_type: payload.page.page_type || "static",
          meta_title: payload.page.meta_title ?? null,
          meta_description: payload.page.meta_description ?? null,
          is_published: false,
        })
        .select("id")
        .single();

      if (createError || !created) {
        setError(createError?.message || "Import failed");
        return;
      }

      if (payload.sections?.length) {
        const { error: sectionsError } = await supabase.from("page_sections").insert(
          payload.sections.map((s, i) => ({
            page_id: created.id,
            section_key: s.section_key,
            section_type: s.section_type,
            content: s.content ?? {},
            sort_order: s.sort_order ?? i,
            is_visible: s.is_visible !== false,
          })),
        );
        if (sectionsError) {
          const { error: rollbackError } = await supabase.from("pages").delete().eq("id", created.id);
          setError(
            rollbackError
              ? `${sectionsError.message} The partial import could not be removed automatically.`
              : `${sectionsError.message} No page was imported.`,
          );
          return;
        }
      }

      await writeAuditLog(supabase, {
        action: "cms.page_created",
        entityType: "page",
        entityId: created.id,
        summary: `Imported ${payload.page.title}`,
      });

      startTransition(() => router.push(`/admin/cms/${importSlug}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not parse import file.");
    } finally {
      setIsSaving(false);
    }
  };

  // Render trigger
  if (mode === "create") {
    return (
      <>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImportFile(file);
                e.target.value = "";
              }}
            />
            <Button
              size="md"
              color="secondary"
              iconLeading={Upload01}
              isLoading={isSaving}
              isDisabled={isSaving}
              onClick={() => importInputRef.current?.click()}
            >
              {isSaving ? "Importing..." : "Import JSON"}
            </Button>
            <Button size="md" iconLeading={Plus} isDisabled={isSaving} onClick={openCreate}>
              {createLabel}
            </Button>
          </div>
          {error && <p className="text-sm text-error-primary">{error}</p>}
        </div>
        {modalOpen && renderModal()}
      </>
    );
  }

  // Row actions
  return (
    <>
      <div>
        <div className="flex items-center gap-1">
          <ButtonUtility
            size="xs"
            color="tertiary"
            icon={Pencil01}
            tooltip="Edit page"
            href={`/admin/cms/${page?.slug}`}
          />
          <ButtonUtility
            size="xs"
            color="tertiary"
            icon={Copy01}
            tooltip="Clone page"
            isDisabled={isSaving}
            onClick={() => void handleClone()}
          />
          <ButtonUtility
            size="xs"
            color="tertiary"
            icon={Download01}
            tooltip="Export JSON"
            isDisabled={isSaving}
            onClick={() => void handleExport()}
          />
          <ButtonUtility
            size="xs"
            color="tertiary"
            icon={Trash01}
            tooltip={isSystemPage ? "System pages cannot be deleted" : canDelete ? "Delete page" : "Your role cannot delete pages"}
            isDisabled={isSaving || !canDelete || isSystemPage}
            onClick={openDelete}
          />
        </div>
        {error && !modalOpen && <p className="mt-1 max-w-56 text-xs text-error-primary">{error}</p>}
      </div>
      {modalOpen && renderModal()}
    </>
  );

  function renderModal() {
    if (modalType === "delete") {
      return (
        <ModalOverlay isDismissable={!isSaving} isOpen onOpenChange={(open) => !open && !isSaving && setModalOpen(false)}>
          <Modal className="w-full max-w-sm">
            <Dialog aria-label="Delete page">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-primary">Delete Page</h2>
                <p className="mt-2 text-sm text-tertiary">
                  Are you sure you want to delete{" "}
                  <strong className="font-semibold text-primary">{page?.title}</strong>?
                  This will also remove all its sections. This cannot be undone.
                </p>
                {error && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-error-primary p-3 text-sm text-error-primary ring-1 ring-error_subtle ring-inset">
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}
                <div className="mt-6 flex items-center gap-3">
                  <Button
                    color="primary-destructive"
                    className="flex-1"
                    isLoading={isSaving}
                    showTextWhileLoading
                    onClick={handleDelete}
                  >
                    {isSaving ? "Deleting..." : "Delete"}
                  </Button>
                  <Button color="secondary" className="flex-1" isDisabled={isSaving} onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Dialog>
          </Modal>
        </ModalOverlay>
      );
    }

    return (
      <ModalOverlay isDismissable={!isSaving} isOpen onOpenChange={(open) => !open && !isSaving && setModalOpen(false)}>
        <Modal className="w-full max-w-lg">
          <Dialog aria-label={modalType === "create" ? createLabel : "Edit page"}>
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-primary">
                  {modalType === "create" ? createLabel : "Edit Page"}
                </h2>
                <ButtonUtility
                  size="sm"
                  color="tertiary"
                  icon={XClose}
                  tooltip="Close"
                  isDisabled={isSaving}
                  onClick={() => setModalOpen(false)}
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-error-primary p-3 text-sm text-error-primary ring-1 ring-error_subtle ring-inset">
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Input
                  label="Title"
                  isRequired
                  placeholder="Page Title"
                  value={title}
                  onChange={(value) => {
                    setTitle(value);
                    if (modalType === "create") setSlug(slugify(value));
                  }}
                />

                <Input
                  label="Slug"
                  placeholder="auto-generated-from-title"
                  value={slug}
                  onChange={setSlug}
                  inputClassName="font-mono text-sm"
                />

                <NativeSelect
                  label="Page Type"
                  value={pageType}
                  disabled={lockPageType}
                  onChange={(e) => setPageType(e.target.value)}
                  options={PAGE_TYPES}
                  hint={lockPageType ? "This entry will be created as a solution service." : undefined}
                />

                <Input
                  label="Meta Title"
                  placeholder="SEO title"
                  value={metaTitle}
                  onChange={setMetaTitle}
                />

                <TextArea
                  label="Meta Description"
                  placeholder="SEO description"
                  rows={2}
                  value={metaDescription}
                  onChange={setMetaDescription}
                />

                <Toggle
                  size="sm"
                  label={isPublished ? "Published" : "Draft"}
                  hint={canPublish ? "New pages start as drafts." : "Your role cannot publish pages."}
                  isSelected={isPublished}
                  isDisabled={!canPublish || isSaving}
                  onChange={setIsPublished}
                />

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={isSaving}
                    showTextWhileLoading
                  >
                    {isSaving
                      ? modalType === "create"
                        ? "Creating..."
                        : "Saving..."
                      : modalType === "create"
                        ? createLabel
                        : "Save Changes"}
                  </Button>
                  <Button color="secondary" isDisabled={isSaving} onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    );
  }
}
