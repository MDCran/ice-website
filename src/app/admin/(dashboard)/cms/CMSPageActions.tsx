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
];

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
      const { error: insertError } = await supabase.from("pages").insert({
        title: title.trim(),
        slug: finalSlug,
        page_type: pageType,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
        is_published: isPublished,
      });
      if (insertError) {
        setError(insertError.message);
        return;
      }
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
