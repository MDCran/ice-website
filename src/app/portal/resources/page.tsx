"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Folder,
  Grid01,
  List,
  Download01,
  Eye,
  File02,
  Calendar,
  User01,
  Lock01,
  SearchLg,
} from "@untitledui/icons";
import { Badge, BadgeWithIcon } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { CloseButton } from "@/components/base/buttons/close-button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { Table, TableCard } from "@/components/application/table/table";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { cx } from "@/utils/cx";
import type { ClientResource } from "@/lib/types/database";

type ViewMode = "grid" | "list";

export default function ResourcesPage() {
  const [resources, setResources] = useState<ClientResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("portal_resources_view") as ViewMode) || "grid";
    }
    return "grid";
  });
  const [previewResource, setPreviewResource] = useState<ClientResource | null>(
    null
  );

  useEffect(() => {
    async function fetchResources() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setResources([]);
          return;
        }

        const { data: clientUser } = await supabase
          .from("client_users")
          .select("client_account_id")
          .eq("id", user.id)
          .single();
        if (!clientUser) {
          setResources([]);
          return;
        }

        const { data } = await supabase
          .from("client_resources")
          .select("*")
          .eq("client_account_id", clientUser.client_account_id)
          .eq("visibility", "published")
          .order("created_at", { ascending: false });

        setResources(data ?? []);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, []);

  const toggleView = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("portal_resources_view", mode);
  };

  const handleDownload = (resource: ClientResource) => {
    if (!resource.allow_download) return;
    window.open(resource.file_url, "_blank");
  };

  const categories = Array.from(
    new Set(
      resources
        .map((r) => r.category?.trim())
        .filter((c): c is string => Boolean(c)),
    ),
  ).sort();

  const visibleResources = resources.filter((resource) => {
    const matchesCategory =
      category === "all" || (resource.category?.trim() || "Uncategorized") === category;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [resource.title, resource.description, resource.author, resource.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingIndicator type="line-spinner" size="md" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display-xs font-semibold text-primary">Documents</h1>
          <p className="mt-1 text-md text-tertiary">
            {visibleResources.length} document{visibleResources.length !== 1 ? "s" : ""}{" "}
            available
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative block w-full sm:w-64">
            <span className="sr-only">Search documents</span>
            <SearchLg aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-quaternary" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search documents..."
              className="h-10 w-full rounded-lg border-0 bg-primary py-2 pr-3 pl-9 text-sm text-primary outline-none ring-1 ring-secondary placeholder:text-placeholder focus:ring-2 focus:ring-brand"
            />
          </label>
          {(categories.length > 0 || resources.some((r) => r.version_label)) && (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCategory("all")}
                className={cx(
                  "rounded-full px-3 py-1 text-xs font-semibold ring-1 transition",
                  category === "all"
                    ? "bg-brand-solid text-white ring-brand-solid"
                    : "bg-primary text-tertiary ring-secondary hover:text-primary",
                )}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cx(
                    "rounded-full px-3 py-1 text-xs font-semibold ring-1 transition",
                    category === c
                      ? "bg-brand-solid text-white ring-brand-solid"
                      : "bg-primary text-tertiary ring-secondary hover:text-primary",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        <div
          role="group"
          aria-label="View mode"
          className="flex items-center gap-0.5 rounded-lg bg-primary p-0.5 shadow-xs ring-1 ring-primary ring-inset"
        >
          <ButtonUtility
            size="sm"
            color="tertiary"
            icon={Grid01}
            tooltip="Grid view"
            aria-pressed={viewMode === "grid"}
            className={cx(viewMode === "grid" && "bg-active text-fg-quaternary_hover")}
            onClick={() => toggleView("grid")}
          />
          <ButtonUtility
            size="sm"
            color="tertiary"
            icon={List}
            tooltip="List view"
            aria-pressed={viewMode === "list"}
            className={cx(viewMode === "list" && "bg-active text-fg-quaternary_hover")}
            onClick={() => toggleView("list")}
          />
        </div>
        </div>
      </div>

      {visibleResources.length === 0 ? (
        <div className="rounded-xl bg-primary py-12 shadow-xs ring-1 ring-secondary">
          <EmptyState size="sm">
            <EmptyState.Header>
              <EmptyState.FeaturedIcon color="gray" icon={Folder} />
            </EmptyState.Header>
            <EmptyState.Content>
              <EmptyState.Title>No documents available</EmptyState.Title>
              <EmptyState.Description>
                Documents shared with your account will appear here after your ICE team publishes them.
              </EmptyState.Description>
            </EmptyState.Content>
          </EmptyState>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleResources.map((resource) => (
            <button
              key={resource.id}
              type="button"
              onClick={() => setPreviewResource(resource)}
              className="cursor-pointer rounded-xl bg-primary p-5 text-left shadow-xs ring-1 ring-secondary outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <div className="mb-3 flex items-start justify-between">
                <FeaturedIcon color="brand" theme="light" size="md" icon={File02} />
                {!resource.allow_download && (
                  <BadgeWithIcon type="pill-color" size="sm" color="warning" iconLeading={Lock01}>
                    Preview Only
                  </BadgeWithIcon>
                )}
              </div>
              <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-primary">
                {resource.title}
              </h3>
              {(resource.category || resource.version_label) && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {resource.category && (
                    <Badge size="sm" color="gray">
                      {resource.category}
                    </Badge>
                  )}
                  {resource.version_label && (
                    <Badge size="sm" color="brand">
                      {resource.version_label}
                    </Badge>
                  )}
                </div>
              )}
              {resource.description && (
                <p className="mb-3 line-clamp-2 text-sm text-tertiary">
                  {resource.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-quaternary">
                {resource.author && (
                  <span className="flex items-center gap-1">
                    <User01 aria-hidden="true" className="size-3" />
                    {resource.author}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar aria-hidden="true" className="size-3" />
                  {new Date(resource.created_at).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <TableCard.Root>
          <Table aria-label="Resources">
            <Table.Header>
              <Table.Head id="title" isRowHeader label="Title" className="w-full" />
              <Table.Head id="category" label="Category" />
              <Table.Head id="author" label="Author" />
              <Table.Head id="date" label="Date" />
              <Table.Head id="access" label="Access" />
              <Table.Head id="actions" aria-label="Actions" />
            </Table.Header>
            <Table.Body items={visibleResources}>
              {(resource) => (
                <Table.Row
                  id={resource.id}
                  onAction={() => setPreviewResource(resource)}
                  className="cursor-pointer"
                >
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <File02 aria-hidden="true" className="size-4 shrink-0 text-fg-quaternary" />
                      <div>
                        <span className="text-sm font-medium text-primary">
                          {resource.title}
                        </span>
                        {resource.version_label && (
                          <p className="text-xs text-brand-secondary">{resource.version_label}</p>
                        )}
                        {resource.description && (
                          <p className="line-clamp-1 text-xs text-quaternary">
                            {resource.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {resource.category ? (
                      <Badge size="sm" color="gray">
                        {resource.category}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                  <Table.Cell>{resource.author || "-"}</Table.Cell>
                  <Table.Cell>
                    <span className="whitespace-nowrap">
                      {new Date(resource.created_at).toLocaleDateString()}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    {resource.allow_download ? (
                      <Badge type="pill-color" size="sm" color="success">
                        Download
                      </Badge>
                    ) : (
                      <BadgeWithIcon type="pill-color" size="sm" color="warning" iconLeading={Lock01}>
                        Preview Only
                      </BadgeWithIcon>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      size="sm"
                      color="link-color"
                      onClick={() => setPreviewResource(resource)}
                    >
                      View
                    </Button>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </TableCard.Root>
      )}

      {/* Preview Modal */}
      <ModalOverlay
        isDismissable
        isOpen={!!previewResource}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPreviewResource(null);
        }}
      >
        <Modal className="h-[80vh] w-full max-w-4xl">
          <Dialog className="flex h-full flex-col">
            {previewResource && (
              <>
                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-secondary px-6 py-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-primary">
                      {previewResource.title}
                    </h2>
                    {previewResource.description && (
                      <p className="mt-0.5 truncate text-sm text-tertiary">
                        {previewResource.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {previewResource.allow_download ? (
                      <Button
                        size="sm"
                        color="primary"
                        iconLeading={Download01}
                        onClick={() => handleDownload(previewResource)}
                      >
                        Download
                      </Button>
                    ) : (
                      <BadgeWithIcon type="pill-color" size="md" color="warning" iconLeading={Eye}>
                        Preview Only
                      </BadgeWithIcon>
                    )}
                    <CloseButton size="sm" onClick={() => setPreviewResource(null)} />
                  </div>
                </div>
                <div
                  className="flex-1 overflow-hidden p-4"
                  onContextMenu={
                    !previewResource.allow_download
                      ? (e) => e.preventDefault()
                      : undefined
                  }
                >
                  {previewResource.mime_type === "application/pdf" ||
                  previewResource.file_url.endsWith(".pdf") ? (
                    <object
                      data={previewResource.file_url}
                      type="application/pdf"
                      className="h-full w-full rounded-lg"
                    >
                      <iframe
                        src={previewResource.file_url}
                        className="h-full w-full rounded-lg"
                        title={previewResource.title}
                      />
                    </object>
                  ) : (
                    <iframe
                      src={previewResource.file_url}
                      className="h-full w-full rounded-lg bg-white"
                      title={previewResource.title}
                    />
                  )}
                </div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}
