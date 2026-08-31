import { connection } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

export const SERVICE_PROFILE_SECTION_KEY = "service_profile";

type JsonObject = Record<string, unknown>;

export interface SolutionSchemaProfile {
  service_type: string;
  aliases: string[];
  offer_names: string[];
}

export interface SolutionCatalogSchema extends SolutionSchemaProfile {
  serviceType: string;
  offerNames: string[];
}

export interface SolutionFinderProfile {
  enabled: boolean;
  proof: string;
  outcomes: string[];
  complexity: string;
  timeline: string;
  role: string;
  cta_label: string;
  next_step: string;
}

/**
 * Reserved `page_sections.content` shape for `section_key=service_profile`.
 *
 * The page row remains authoritative for identity, title, slug, publication,
 * and ordering. This profile owns how a published solution participates in
 * catalog/discovery surfaces without duplicating its URL or page title.
 */
export interface ServiceProfileContent {
  listed: boolean;
  category: string;
  category_description: string;
  category_icon: string;
  icon: string;
  card_description: string;
  card_image: string;
  card_image_alt: string;
  tags: string[];
  industries: string[];
  platforms: string[];
  outcome: string;
  workloads: string[];
  link_label: string;
  schema: SolutionSchemaProfile;
  finder?: SolutionFinderProfile;
}

export interface SolutionCatalogItem extends ServiceProfileContent {
  schema: SolutionCatalogSchema;
  page_id: string;
  slug: string;
  title: string;
  href: string;
  sort_order: number;
  sortOrder: number;
  meta_title: string;
  meta_description: string;
  updated_at: string | null;
  description: string;
  image: string;
  imageAlt: string;
  categoryDescription: string;
  categoryIcon: string;
  linkLabel: string;
  hero_headline: string;
  hero_description: string;
  hero_image: string;
  hero_image_alt: string;
}

export interface RelatedCatalogCmsItem {
  title: string;
  description: string;
  href: string;
  link_label: string;
  icon: string;
  image: string;
  image_alt: string;
}

interface SolutionPageRow {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  sort_order: number | null;
  updated_at: string | null;
}

interface SolutionSectionRow {
  page_id: string;
  section_key: string;
  content: unknown;
  is_visible: boolean | null;
}

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(source: JsonObject, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(source, key);
}

/**
 * Read an owned CMS string without treating an explicit empty string as
 * missing. This is important for image fields: `""` means the editor chose
 * no image and must not reactivate a code or hero fallback.
 */
function ownedString(
  source: JsonObject,
  key: string,
  fallback: string,
): string {
  if (!hasOwn(source, key)) return fallback;
  return typeof source[key] === "string" ? source[key] : fallback;
}

/** Preserve an explicit empty array while tolerating malformed CMS values. */
function ownedStringList(
  source: JsonObject,
  key: string,
  fallback: string[] = [],
): string[] {
  if (!hasOwn(source, key)) return [...fallback];
  const value = source[key];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [...fallback];
}

function ownedBoolean(
  source: JsonObject,
  key: string,
  fallback: boolean,
): boolean {
  if (!hasOwn(source, key)) return fallback;
  return typeof source[key] === "boolean" ? source[key] : fallback;
}

/**
 * Return the first owned string, including `""`. Aliased legacy fields later
 * in the list must not override an explicit blank in the preferred field.
 */
function firstOwnedString(
  source: JsonObject,
  keys: readonly string[],
  fallback = "",
): string {
  for (const key of keys) {
    if (!hasOwn(source, key)) continue;
    return typeof source[key] === "string" ? source[key] : fallback;
  }
  return fallback;
}

function normalizeFinder(value: unknown): SolutionFinderProfile | undefined {
  if (!isObject(value)) return undefined;
  return {
    enabled: ownedBoolean(value, "enabled", true),
    proof: ownedString(value, "proof", ""),
    outcomes: ownedStringList(value, "outcomes"),
    complexity: ownedString(value, "complexity", ""),
    timeline: ownedString(value, "timeline", ""),
    role: ownedString(value, "role", ""),
    cta_label: ownedString(value, "cta_label", ""),
    next_step: ownedString(value, "next_step", ""),
  };
}

export function normalizeServiceProfile(
  value: unknown,
  {
    hero: heroValue,
    metaDescription = "",
  }: {
    hero?: unknown;
    metaDescription?: string;
  } = {},
): ServiceProfileContent {
  const profile = isObject(value) ? value : {};
  const hero = isObject(heroValue) ? heroValue : {};

  const heroCategory = firstOwnedString(
    hero,
    ["category", "category_label", "categoryLabel", "eyebrow"],
  );
  const category = ownedString(profile, "category", heroCategory);
  const categoryIcon = ownedString(
    profile,
    "category_icon",
    firstOwnedString(hero, ["category_icon", "categoryIcon"]),
  );
  const heroDescription = firstOwnedString(
    hero,
    ["subheadline", "description"],
    metaDescription,
  );
  const heroImage = firstOwnedString(
    hero,
    ["hero_image", "heroImage", "image", "visual_image", "visualImage"],
  );
  const heroImageAlt = firstOwnedString(
    hero,
    ["image_alt", "imageAlt", "hero_image_alt", "heroImageAlt"],
  );
  const rawSchema = isObject(profile.schema) ? profile.schema : {};

  return {
    listed: ownedBoolean(profile, "listed", true),
    category,
    category_description: ownedString(profile, "category_description", ""),
    category_icon: categoryIcon,
    icon: ownedString(profile, "icon", categoryIcon),
    card_description: ownedString(
      profile,
      "card_description",
      metaDescription || heroDescription,
    ),
    card_image: ownedString(profile, "card_image", heroImage),
    card_image_alt: ownedString(profile, "card_image_alt", heroImageAlt),
    tags: ownedStringList(profile, "tags"),
    industries: ownedStringList(profile, "industries"),
    platforms: ownedStringList(profile, "platforms"),
    outcome: ownedString(profile, "outcome", ""),
    workloads: ownedStringList(profile, "workloads"),
    link_label: ownedString(profile, "link_label", "Learn more"),
    schema: {
      service_type: ownedString(rawSchema, "service_type", category),
      aliases: ownedStringList(rawSchema, "aliases"),
      offer_names: ownedStringList(rawSchema, "offer_names"),
    },
    finder: normalizeFinder(profile.finder),
  };
}

export function buildSolutionCatalogItem(
  page: SolutionPageRow,
  profileContent: unknown,
  heroContent?: unknown,
): SolutionCatalogItem {
  const hero = isObject(heroContent) ? heroContent : {};
  const profile = normalizeServiceProfile(profileContent, {
    hero,
    metaDescription: page.meta_description ?? "",
  });

  return {
    ...profile,
    page_id: page.id,
    slug: page.slug,
    title: page.title,
    href: `/solutions/${page.slug}`,
    sort_order: page.sort_order ?? 0,
    sortOrder: page.sort_order ?? 0,
    meta_title: page.meta_title ?? "",
    meta_description: page.meta_description ?? "",
    updated_at: page.updated_at,
    description: profile.card_description,
    image: profile.card_image,
    imageAlt: profile.card_image_alt,
    categoryDescription: profile.category_description,
    categoryIcon: profile.category_icon,
    linkLabel: profile.link_label,
    schema: {
      ...profile.schema,
      serviceType: profile.schema.service_type,
      offerNames: profile.schema.offer_names,
    },
    hero_headline: firstOwnedString(hero, ["headline"], page.title),
    hero_description: firstOwnedString(
      hero,
      ["subheadline", "description"],
      page.meta_description ?? "",
    ),
    hero_image: firstOwnedString(
      hero,
      ["hero_image", "heroImage", "image", "visual_image", "visualImage"],
    ),
    hero_image_alt: firstOwnedString(
      hero,
      ["image_alt", "imageAlt", "hero_image_alt", "heroImageAlt"],
    ),
  };
}

/**
 * Load the live, published and catalog-listed solution inventory.
 *
 * `null` means the CMS could not be read; an empty array is a successful read
 * with no listed profiles. The solution renderer suppresses the reserved
 * section key; its ordinary section visibility toggle and `listed` field both
 * control catalog membership. This prevents hardcoded services from
 * reappearing after an administrator removes or unpublishes them.
 */
export async function getPublishedSolutionCatalog(): Promise<
  SolutionCatalogItem[] | null
> {
  try {
    await connection();
    const supabase = createPublicClient();
    const { data: pageData, error: pageError } = await supabase
      .from("pages")
      .select(
        "id, slug, title, meta_title, meta_description, sort_order, updated_at",
      )
      .eq("page_type", "solution")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });

    if (pageError) return null;
    const pages = (pageData ?? []) as SolutionPageRow[];
    if (pages.length === 0) return [];

    const pageIds = pages.map((page) => page.id);
    const { data: sectionData, error: sectionError } = await supabase
      .from("page_sections")
      .select("page_id, section_key, content, is_visible")
      .in("page_id", pageIds)
      .in("section_key", [SERVICE_PROFILE_SECTION_KEY, "hero"]);

    if (sectionError) return null;
    const sections = (sectionData ?? []) as SolutionSectionRow[];
    const profileByPage = new Map<string, SolutionSectionRow>();
    const heroByPage = new Map<string, SolutionSectionRow>();

    for (const section of sections) {
      if (section.section_key === SERVICE_PROFILE_SECTION_KEY) {
        profileByPage.set(section.page_id, section);
      } else if (section.section_key === "hero") {
        heroByPage.set(section.page_id, section);
      }
    }

    return pages
      .flatMap((page) => {
        const profile = profileByPage.get(page.id);
        if (!profile || profile.is_visible === false) return [];
        const item = buildSolutionCatalogItem(
          page,
          profile.content,
          heroByPage.get(page.id)?.content,
        );
        return item.listed ? [item] : [];
      })
      .sort(
        (a, b) =>
          a.sort_order - b.sort_order || a.title.localeCompare(b.title),
      );
  } catch {
    return null;
  }
}

function normalizedTokens(values: readonly string[]): Set<string> {
  return new Set(
    values
      .map((value) => value.trim().toLocaleLowerCase())
      .filter(Boolean),
  );
}

/** Build the existing generic-CMS related-card shape from canonical profiles. */
export function relatedCatalogItemsForCms(
  currentSlug: string,
  catalog: readonly SolutionCatalogItem[],
  limit?: number,
): RelatedCatalogCmsItem[];
export function relatedCatalogItemsForCms(
  catalog: readonly SolutionCatalogItem[],
  currentSlug: string,
  limit?: number,
): RelatedCatalogCmsItem[];
export function relatedCatalogItemsForCms(
  first: string | readonly SolutionCatalogItem[],
  second: string | readonly SolutionCatalogItem[],
  limit = 3,
): RelatedCatalogCmsItem[] {
  const currentSlug = typeof first === "string" ? first : (second as string);
  const catalog = typeof first === "string"
    ? (second as readonly SolutionCatalogItem[])
    : first;
  const current = catalog.find((item) => item.slug === currentSlug);
  const currentTags = normalizedTokens(current?.tags ?? []);

  return catalog
    .filter((item) => item.slug !== currentSlug && item.listed)
    .map((item) => {
      const tags = normalizedTokens(item.tags);
      let score = current && item.category === current.category ? 10 : 0;
      for (const tag of currentTags) {
        if (tags.has(tag)) score += 2;
      }
      return { item, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.item.sort_order - b.item.sort_order ||
        a.item.title.localeCompare(b.item.title),
    )
    .slice(0, Math.max(0, limit))
    .map(({ item }) => ({
      title: item.title,
      description: item.card_description,
      href: item.href,
      link_label: item.link_label,
      icon: item.icon,
      image: item.card_image,
      image_alt: item.card_image_alt,
    }));
}
