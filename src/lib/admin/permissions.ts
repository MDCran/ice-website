/**
 * Role-based admin permissions (#39).
 * Roles: super_admin | admin | editor | marketer | sales_ops
 */

export type AdminRole = "super_admin" | "admin" | "editor" | "marketer" | "sales_ops" | string;

export type AdminCapability =
  | "cms.edit"
  | "cms.publish"
  | "cms.delete"
  | "cms.bulk"
  | "nav.edit"
  | "seo.edit"
  | "media.manage"
  | "clients.manage"
  | "clients.provision"
  | "surveys.manage"
  | "leads.manage"
  | "settings.manage"
  | "audit.view"
  | "performance.view"
  | "admins.manage";

const ROLE_CAPS: Record<string, AdminCapability[]> = {
  super_admin: [
    "cms.edit",
    "cms.publish",
    "cms.delete",
    "cms.bulk",
    "nav.edit",
    "seo.edit",
    "media.manage",
    "clients.manage",
    "clients.provision",
    "surveys.manage",
    "leads.manage",
    "settings.manage",
    "audit.view",
    "performance.view",
    "admins.manage",
  ],
  admin: [
    "cms.edit",
    "cms.publish",
    "cms.delete",
    "cms.bulk",
    "nav.edit",
    "seo.edit",
    "media.manage",
    "clients.manage",
    "clients.provision",
    "surveys.manage",
    "leads.manage",
    "settings.manage",
    "audit.view",
    "performance.view",
  ],
  editor: [
    "cms.edit",
    "cms.publish",
    "nav.edit",
    "media.manage",
    "performance.view",
  ],
  marketer: [
    "cms.edit",
    "seo.edit",
    "media.manage",
    "nav.edit",
    "performance.view",
    "leads.manage",
  ],
  sales_ops: [
    "leads.manage",
    "clients.manage",
    "clients.provision",
    "surveys.manage",
    "audit.view",
  ],
};

export function normalizeAdminRole(role: string | null | undefined): string {
  return (role || "editor").toLowerCase();
}

export function can(role: string | null | undefined, capability: AdminCapability): boolean {
  const key = normalizeAdminRole(role);
  const caps = ROLE_CAPS[key] ?? ROLE_CAPS.editor;
  return caps.includes(capability);
}

export function capabilitiesFor(role: string | null | undefined): AdminCapability[] {
  const key = normalizeAdminRole(role);
  return ROLE_CAPS[key] ?? ROLE_CAPS.editor;
}

/** Sidebar href → required capability (omit = always visible to admins). */
export const NAV_CAPABILITY: Record<string, AdminCapability | undefined> = {
  "/admin": undefined,
  "/admin/cms": "cms.edit",
  "/admin/sales": "cms.edit",
  "/admin/navigation": "nav.edit",
  "/admin/seo": "seo.edit",
  "/admin/performance": "performance.view",
  "/admin/audit": "audit.view",
  "/admin/templates": "cms.edit",
  "/admin/files": "media.manage",
  "/admin/illustrations": "media.manage",
  "/admin/clients": "clients.manage",
  "/admin/contacts": "leads.manage",
  "/admin/settings": "settings.manage",
};
