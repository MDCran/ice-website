import type { ComponentType } from "react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { File02, Globe01, LayersTwo01, Scales01 } from "@untitledui/icons";
import { Badge, BadgeWithDot, type BadgeColor } from "@/components/base/badges/badges";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { can } from "@/lib/admin/permissions";
import { publicPathForCmsPage } from "@/lib/cms/pageRegistry";
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

export default async function CMSPagesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || !can(profile.role, "cms.edit")) redirect("/admin");

  const { q = "", status = "all" } = (await searchParams) ?? {};
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

  const query = q.trim().toLowerCase();
  const filteredPages = (pages ?? []).filter((page) => {
    const matchesQuery = !query || [page.title, page.slug, page.page_type].some((value) =>
      String(value ?? "").toLowerCase().includes(query),
    );
    const matchesStatus = status === "all" || (status === "published" ? page.is_published : !page.is_published);
    return matchesQuery && matchesStatus;
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-display-xs font-semibold text-primary">CMS Pages</h1>
          <p className="mt-1 text-sm text-tertiary">
            Manage website pages and their content sections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-tertiary sm:inline">{filteredPages.length} of {pages?.length ?? 0} pages</span>
          <CMSPageActions mode="create" canPublish={can(profile.role, "cms.publish")} />
        </div>
      </div>

      <form method="get" className="mb-5 flex flex-col gap-2 rounded-xl bg-primary p-3 shadow-xs ring-1 ring-secondary sm:flex-row">
        <label className="sr-only" htmlFor="cms-search">Search pages</label>
        <input
          id="cms-search"
          name="q"
          defaultValue={q}
          placeholder="Search by page title, slug, or type..."
          className="h-10 flex-1 rounded-lg border-0 bg-secondary px-3 text-sm text-primary outline-none ring-1 ring-secondary placeholder:text-placeholder focus:ring-2 focus:ring-brand"
        />
        <label className="sr-only" htmlFor="cms-status">Filter by status</label>
        <select
          id="cms-status"
          name="status"
          defaultValue={status}
          className="h-10 rounded-lg border-0 bg-secondary px-3 text-sm font-medium text-primary outline-none ring-1 ring-secondary focus:ring-2 focus:ring-brand"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
        <button type="submit" className="h-10 rounded-lg bg-brand-solid px-4 text-sm font-semibold text-white transition hover:brightness-105">
          Search
        </button>
        {(q || status !== "all") && <Link href="/admin/cms" className="inline-flex h-10 items-center justify-center rounded-lg px-3 text-sm font-semibold text-tertiary hover:bg-secondary">Clear</Link>}
      </form>

      {!pages || pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-primary px-6 py-16 text-center ring-1 ring-secondary">
          <FeaturedIcon icon={File02} color="gray" theme="modern" size="lg" />
          <p className="mt-4 text-md font-semibold text-primary">No pages yet</p>
          <p className="mt-1 text-sm text-tertiary">
            Create your first page to get started.
          </p>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="rounded-xl bg-primary px-6 py-12 text-center ring-1 ring-secondary">
          <p className="text-md font-semibold text-primary">No matching pages</p>
          <p className="mt-1 text-sm text-tertiary">Try a different search term or clear the filters.</p>
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
                    Public path
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
                {filteredPages.map((page) => {
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
                        {publicPathForCmsPage(page.slug, page.page_type)}
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
                          canDelete={can(profile.role, "cms.delete")}
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
