type SectionManifestRow = {
  section_key: string;
  is_visible?: boolean;
};

/**
 * Bespoke pages often retain code fallbacks for older CMS datasets. This
 * helper makes an explicit CMS visibility toggle authoritative without making
 * a genuinely missing legacy row disappear.
 */
export function isCmsSectionVisible(
  orderedSections: SectionManifestRow[] | undefined,
  ...keys: string[]
): boolean {
  const rows = orderedSections?.filter((section) => keys.includes(section.section_key)) ?? [];
  return rows.length > 0 ? rows.every((row) => row.is_visible !== false) : true;
}

export function visibleCmsSections<T extends SectionManifestRow>(orderedSections: T[] | undefined): T[] {
  return (orderedSections ?? []).filter((section) => section.is_visible !== false);
}
