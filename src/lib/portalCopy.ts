export const PORTAL_COPY_DEFAULTS = {
  dashboard: "Dashboard",
  company_contacts: "Company & Contacts",
  resources: "Resources",
  surveys: "Surveys",
  portal: "Portal",
  back_to_site: "Back to Site",
  sign_out: "Sign Out",
  settings: "Settings",
  documents_title: "Documents",
  documents_available_singular: "document available",
  documents_available_plural: "documents available",
  search_documents: "Search documents...",
  search_documents_accessible: "Search documents",
  filter_all: "All",
  grid_view: "Grid view",
  list_view: "List view",
  no_documents_title: "No documents available",
  no_documents_description: "Documents shared with your account will appear here after your ICE team publishes them.",
  preview_only: "Preview Only",
  table_title: "Title",
  table_category: "Category",
  table_author: "Author",
  table_date: "Date",
  table_access: "Access",
  table_actions: "Actions",
  download: "Download",
  view: "View",
} as const;

export type PortalCopy = { [Key in keyof typeof PORTAL_COPY_DEFAULTS]: string };

export function resolvePortalCopy(value: unknown): PortalCopy {
  const copy = { ...PORTAL_COPY_DEFAULTS } as Record<string, string>;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const key of Object.keys(PORTAL_COPY_DEFAULTS) as (keyof PortalCopy)[]) {
      const candidate = (value as Record<string, unknown>)[key];
      if (typeof candidate === "string" && candidate.trim()) copy[key] = candidate;
    }
  }
  return copy as PortalCopy;
}
