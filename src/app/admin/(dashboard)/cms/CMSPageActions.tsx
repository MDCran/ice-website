"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, Pencil01, Plus, Trash01, XClose } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { NativeSelect } from "@/components/base/select/select-native";
import { Toggle } from "@/components/base/toggle/toggle";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";

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
      section_key: "stats",
      section_type: "stats",
      sort_order: 2,
      is_visible: true,
      content: {
        eyebrow: "By The Numbers",
        heading: "Proof Points",
        description: "Update these metrics to match the offer.",
        items: [
          { value: 35, suffix: "+", label: "Years of Experience", source_note: "" },
          { value: 24, suffix: "/7", label: "US-Based Support", source_note: "" },
          { value: 15, suffix: " min", label: "Response Target", source_note: "Example placeholder" },
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

export default function CMSPageActions({
  mode,
  page,
}: {
  mode: "create" | "row";
  page?: PageData;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit" | "delete">("create");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [pageType, setPageType] = useState("static");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const openCreate = () => {
    setTitle("");
    setSlug("");
    setPageType("static");
    setMetaTitle("");
    setMetaDescription("");
    setIsPublished(true);
    setError("");
    setModalType("create");
    setModalOpen(true);
  };

  const openEdit = () => {
    if (!page) return;
    setTitle(page.title);
    setSlug(page.slug);
    setPageType(page.page_type);
    setMetaTitle(page.meta_title ?? "");
    setMetaDescription(page.meta_description ?? "");
    setIsPublished(page.is_published);
    setError("");
    setModalType("edit");
    setModalOpen(true);
  };

  const openDelete = () => {
    setError("");
    setModalType("delete");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    const supabase = createClient();
    const finalSlug = slug.trim() || slugify(title);

    if (modalType === "create") {
      const { data: insertedPage, error: insertError } = await supabase.from("pages").insert({
        title: title.trim(),
        slug: finalSlug,
        page_type: pageType,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
        is_published: isPublished,
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
          setError(sectionsError.message);
          return;
        }
      }
      setModalOpen(false);
      startTransition(() => router.push(`/admin/cms/${finalSlug}`));
      return;
    } else if (modalType === "edit" && page) {
      const { error: updateError } = await supabase
        .from("pages")
        .update({
          title: title.trim(),
          slug: finalSlug,
          page_type: pageType,
          meta_title: metaTitle.trim() || null,
          meta_description: metaDescription.trim() || null,
          is_published: isPublished,
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
  };

  const handleDelete = async () => {
    if (!page) return;
    setError("");
    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("pages")
      .delete()
      .eq("id", page.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setModalOpen(false);
    startTransition(() => router.refresh());
  };

  // Render trigger
  if (mode === "create") {
    return (
      <>
        <Button size="md" iconLeading={Plus} onClick={openCreate}>
          Create Page
        </Button>
        {modalOpen && renderModal()}
      </>
    );
  }

  // Row actions
  return (
    <>
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
          icon={Trash01}
          tooltip="Delete page"
          onClick={openDelete}
        />
      </div>
      {modalOpen && renderModal()}
    </>
  );

  function renderModal() {
    if (modalType === "delete") {
      return (
        <ModalOverlay isDismissable isOpen onOpenChange={(open) => !open && setModalOpen(false)}>
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
                    isLoading={isPending}
                    showTextWhileLoading
                    onClick={handleDelete}
                  >
                    {isPending ? "Deleting..." : "Delete"}
                  </Button>
                  <Button color="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
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
      <ModalOverlay isDismissable isOpen onOpenChange={(open) => !open && setModalOpen(false)}>
        <Modal className="w-full max-w-lg">
          <Dialog aria-label={modalType === "create" ? "Create page" : "Edit page"}>
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-primary">
                  {modalType === "create" ? "Create Page" : "Edit Page"}
                </h2>
                <ButtonUtility
                  size="sm"
                  color="tertiary"
                  icon={XClose}
                  tooltip="Close"
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
                  onChange={(e) => setPageType(e.target.value)}
                  options={PAGE_TYPES}
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
                  label="Published"
                  isSelected={isPublished}
                  onChange={setIsPublished}
                />

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={isPending}
                    showTextWhileLoading
                  >
                    {isPending
                      ? modalType === "create"
                        ? "Creating..."
                        : "Saving..."
                      : modalType === "create"
                        ? "Create Page"
                        : "Save Changes"}
                  </Button>
                  <Button color="secondary" onClick={() => setModalOpen(false)}>
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
