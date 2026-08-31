import NotFoundContent from "@/components/marketing/NotFoundContent";
import { getSiteSettings, isSiteSettingVisible } from "@/lib/cms";

/**
 * Public-route 404 — content only. Navbar/Footer come from `(public)/layout.tsx`.
 */
export default async function PublicNotFound() {
  const settings = await getSiteSettings();
  if (!isSiteSettingVisible(settings, "not_found")) return null;
  return <NotFoundContent content={settings?.not_found} />;
}
