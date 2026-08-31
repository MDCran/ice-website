import Link from "next/link";
import { redirect } from "next/navigation";
import { Image01, Server01 } from "@untitledui/icons";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { can } from "@/lib/admin/permissions";
import { publicPathForCmsPage } from "@/lib/cms/pageRegistry";
import { createClient } from "@/lib/supabase/server";
import CMSPageActions from "../cms/CMSPageActions";
import SolutionOrderControls, { type OrderedSolution } from "./SolutionOrderControls";

export const metadata = { title: "Solutions | ICE Admin" };

interface SolutionPageRow {
  id: string;
  title: string;
  slug: string;
  page_type: string;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  sort_order: number;
  updated_at: string | null;
}

interface SolutionSectionRow {
  page_id: string;
  section_key: string;
  content: Record<string, unknown>;
  is_visible: boolean | null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

export default async function AdminSolutionsPage() {
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

  const { data: pages, error: pagesError } = await supabase
    .from("pages")
    .select("id, title, slug, page_type, meta_title, meta_description, is_published, sort_order, updated_at")
    .eq("page_type", "solution")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (pagesError) {
    return <div className="text-sm text-error-primary">Failed to load services: {pagesError.message}</div>;
  }

  const solutionPages = (pages ?? []) as SolutionPageRow[];
  const pageIds = solutionPages.map((page) => page.id);
  const { data: sectionData, error: sectionsError } = pageIds.length
    ? await supabase
        .from("page_sections")
        .select("page_id, section_key, content, is_visible")
        .in("page_id", pageIds)
        .in("section_key", ["service_profile", "hero"])
    : { data: [] as SolutionSectionRow[], error: null };

  if (sectionsError) {
    return <div className="text-sm text-error-primary">Failed to load service profiles: {sectionsError.message}</div>;
  }

  const sectionsByPage = new Map<string, Map<string, SolutionSectionRow>>();
  for (const section of (sectionData ?? []) as SolutionSectionRow[]) {
    const sections = sectionsByPage.get(section.page_id) ?? new Map<string, SolutionSectionRow>();
    sections.set(section.section_key, section);
    sectionsByPage.set(section.page_id, sections);
  }

  const publishedCount = solutionPages.filter((page) => page.is_published).length;
  const listedCount = solutionPages.filter((page) => {
    const serviceProfile = sectionsByPage.get(page.id)?.get("service_profile");
    return page.is_published && serviceProfile !== undefined && serviceProfile.is_visible !== false && serviceProfile.content.listed !== false;
  }).length;
  const canDelete = can(profile.role, "cms.delete");
  const canPublish = can(profile.role, "cms.publish");
  const canEdit = can(profile.role, "cms.edit");
  const orderedSolutionsByCategory = new Map<string, OrderedSolution[]>();
  for (const page of solutionPages) {
    const sections = sectionsByPage.get(page.id);
    const category = (
      text(sections?.get("service_profile")?.content.category)
      || text(sections?.get("hero")?.content.category)
      || "Uncategorized"
    ).toLocaleLowerCase();
    const group = orderedSolutionsByCategory.get(category) ?? [];
    group.push({ id: page.id, sortOrder: page.sort_order });
    orderedSolutionsByCategory.set(category, group);
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-brand-secondary uppercase">Service catalog</p>
          <h1 className="mt-1 text-display-xs font-semibold text-primary">Solutions &amp; services</h1>
          <p className="mt-2 max-w-2xl text-sm text-tertiary">
            Add services and manage their catalog details, page copy, imagery, publishing, and search information.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-tertiary">
            <span className="rounded-full bg-primary px-3 py-1.5 ring-1 ring-secondary">{solutionPages.length} services</span>
            <span className="rounded-full bg-primary px-3 py-1.5 ring-1 ring-secondary">{publishedCount} published</span>
            <span className="rounded-full bg-primary px-3 py-1.5 ring-1 ring-secondary">{listedCount} live in catalog</span>
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <Link
            href="/admin/cms/solutions"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-3.5 text-sm font-semibold text-secondary shadow-xs ring-1 ring-secondary transition hover:bg-secondary"
          >
            Edit /solutions landing &amp; categories
          </Link>
          <CMSPageActions
            mode="create"
            canPublish={canPublish}
            defaultPageType="solution"
            lockPageType
            createLabel="Add service"
          />
        </div>
      </div>

      {solutionPages.length === 0 ? (
        <div className="rounded-xl bg-primary px-6 py-16 text-center ring-1 ring-secondary">
          <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-secondary ring-1 ring-secondary">
            <Server01 className="size-6 text-fg-quaternary" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-primary">No services yet</h2>
          <p className="mt-1 text-sm text-tertiary">Use Add service to create the first catalog entry and page.</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {solutionPages.map((page) => {
            const sections = sectionsByPage.get(page.id);
            const profileSection = sections?.get("service_profile");
            const serviceProfile = profileSection?.content ?? {};
            const hero = sections?.get("hero")?.content ?? {};
            const hasServiceProfile = profileSection !== undefined;
            const profileVisible = hasServiceProfile && profileSection.is_visible !== false;
            const listed = profileVisible && serviceProfile.listed !== false;
            const category = text(serviceProfile.category) || text(hero.category) || "Uncategorized";
            const description =
              text(serviceProfile.card_description) ||
              page.meta_description ||
              text(hero.subheadline) ||
              "Add a concise catalog description for this service.";
            const thumbnail = text(serviceProfile.card_image) || text(hero.hero_image);
            const thumbnailAlt = text(serviceProfile.card_image_alt) || `${page.title} service image`;
            const tags = stringList(serviceProfile.tags);
            const publicPath = publicPathForCmsPage(page.slug, page.page_type);

            return (
              <article key={page.id} className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
                <div className="grid min-h-56 sm:grid-cols-[11rem_minmax(0,1fr)]">
                  <div className="relative flex min-h-44 items-center justify-center overflow-hidden bg-secondary sm:min-h-full">
                    {thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumbnail} alt={thumbnailAlt} className="absolute inset-0 size-full object-cover" />
                    ) : (
                      <Image01 className="size-8 text-fg-quaternary" aria-hidden="true" />
                    )}
                    <span className="absolute top-3 left-3 rounded-md bg-primary/90 px-2 py-1 font-mono text-[10px] text-tertiary shadow-xs ring-1 ring-secondary backdrop-blur">
                      #{page.sort_order}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-col p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      {page.is_published ? (
                        <BadgeWithDot size="sm" color="success">Published</BadgeWithDot>
                      ) : (
                        <BadgeWithDot size="sm" color="gray">Draft</BadgeWithDot>
                      )}
                      {hasServiceProfile && (
                        <Badge size="sm" color={listed ? "blue" : "gray"}>
                          {listed ? "Listed" : profileVisible ? "Unlisted" : "Profile hidden"}
                        </Badge>
                      )}
                      {!hasServiceProfile && <Badge size="sm" color="warning">Profile needed</Badge>}
                    </div>

                    <h2 className="mt-3 truncate text-lg font-semibold text-primary">{page.title}</h2>
                    <p className="mt-1 text-xs font-medium text-brand-secondary">{category}</p>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-tertiary">{description}</p>

                    <div className="mt-3 flex min-h-6 flex-wrap gap-1.5">
                      {tags.slice(0, 5).map((tag) => (
                        <span key={tag} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-tertiary ring-1 ring-secondary">
                          {tag}
                        </span>
                      ))}
                      {tags.length > 5 && <span className="px-1 py-1 text-[11px] text-quaternary">+{tags.length - 5}</span>}
                      {tags.length === 0 && <span className="text-xs text-quaternary">No search tags yet</span>}
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-secondary pt-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/cms/${page.slug}`} className="rounded-lg bg-brand-solid px-3 py-2 text-xs font-semibold text-white transition hover:brightness-105">
                          Edit service
                        </Link>
                        {page.is_published ? (
                          <Link href={publicPath} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-secondary ring-1 ring-secondary hover:ring-brand">
                            View live
                          </Link>
                        ) : (
                          <span className="px-2 py-2 text-xs text-quaternary">Publish to view live</span>
                        )}
                      </div>
                      <div className="flex items-start gap-1">
                        <SolutionOrderControls
                          pageId={page.id}
                          orderedSolutions={orderedSolutionsByCategory.get(category.toLocaleLowerCase()) ?? []}
                          canEdit={canEdit}
                        />
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
                          canDelete={canDelete}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
