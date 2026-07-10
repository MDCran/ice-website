import type { ComponentType } from "react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { File02, Globe01, LayersTwo01, Scales01 } from "@untitledui/icons";
import { Badge, BadgeWithDot, type BadgeColor } from "@/components/base/badges/badges";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import CMSPageActions from "./CMSPageActions";

const typeConfig: Record<
  string,
  { label: string; color: BadgeColor<"pill-color">; icon: ComponentType<{ className?: string }> }
> = {
  static: { label: "Generic", color: "blue", icon: Globe01 },
  solution: { label: "Solution", color: "success", icon: LayersTwo01 },
  legal: { label: "Legal", color: "warning", icon: Scales01 },
  settings: { label: "Settings", color: "gray", icon: File02 },
};

/** Human-readable hint shown under a page title so admins know what it controls. */
function pageSubtitle(page: { slug: string; page_type: string }): string | null {
  if (page.slug === "site-settings") return "Footer, navbar & company info";
  if (page.page_type === "legal") return "Legal / policy content";
  return null;
}

export default async function CMSPagesPage() {
  const supabase = await createClient();
  const { data: pages, error } = await supabase
    .from("pages")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div className="text-sm text-error-primary">
        Failed to load pages: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-display-xs font-semibold text-primary">CMS Pages</h1>
          <p className="mt-1 text-sm text-tertiary">
            Manage website pages and their content sections
          </p>
        </div>
        <CMSPageActions mode="create" />
      </div>

      {!pages || pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-primary px-6 py-16 text-center ring-1 ring-secondary">
          <FeaturedIcon icon={File02} color="gray" theme="modern" size="lg" />
          <p className="mt-4 text-md font-semibold text-primary">No pages yet</p>
          <p className="mt-1 text-sm text-tertiary">
            Create your first page to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr className="text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-quaternary">
                    Title
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-quaternary">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-quaternary">
                    Type
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-quaternary">
                    Published
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-quaternary">
                    Last Updated
                  </th>
                  <th className="w-24 px-6 py-3 text-xs font-semibold text-quaternary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => {
                  const config =
                    page.slug === "site-settings"
                      ? typeConfig.settings
                      : (typeConfig[page.page_type] ?? typeConfig.static);
                  const TypeIcon = config.icon;
                  return (
                    <tr
                      key={page.id}
                      className="border-t border-secondary transition-colors hover:bg-secondary"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/cms/${page.slug}`}
                          className="font-medium text-primary transition-colors hover:text-brand-secondary"
                        >
                          {page.title}
                        </Link>
                        {pageSubtitle(page) && (
                          <p className="mt-0.5 text-xs text-tertiary">{pageSubtitle(page)}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-tertiary">
                        /{page.slug}
                      </td>
                      <td className="px-6 py-4">
                        <Badge size="sm" color={config.color}>
                          <span className="flex items-center gap-1">
                            <TypeIcon className="size-3" />
                            {config.label}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {page.is_published ? (
                          <BadgeWithDot size="sm" color="success">
                            Published
                          </BadgeWithDot>
                        ) : (
                          <BadgeWithDot size="sm" color="gray">
                            Draft
                          </BadgeWithDot>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-tertiary">
                        {page.updated_at
                          ? new Date(page.updated_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <CMSPageActions
                          mode="row"
                          page={{
                            id: page.id,
                            title: page.title,
                            slug: page.slug,
                            page_type: page.page_type,
                            meta_title: page.meta_title,
                            meta_description: page.meta_description,
                            is_published: page.is_published,
                            sort_order: page.sort_order,
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
