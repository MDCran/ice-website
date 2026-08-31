import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SkipToContent from "@/components/layout/SkipToContent";
import NotFoundContent from "@/components/marketing/NotFoundContent";
import SearchModal from "@/components/ui/SearchModal";
import ContactWidget from "@/components/ui/ContactWidget";
import {
  getSiteSettings,
  getNavigation,
  getSearchIndex,
  hasSiteSetting,
  isSiteSettingVisible,
} from "@/lib/cms";
import type { FooterCMSData } from "@/components/layout/Footer";

/**
 * Global 404 — unmatched URLs only get the root layout, so we render
 * Navbar + Footer here. Segment `(public)/not-found` stays content-only
 * to avoid double chrome when `notFound()` is called inside public routes.
 */
export default async function NotFound() {
  const [settings, navItems, searchItems] = await Promise.all([
    getSiteSettings(),
    getNavigation(),
    getSearchIndex(),
  ]);

  const footerData: FooterCMSData = {};
  if (settings?.company_info) footerData.companyInfo = settings.company_info;
  if (settings?.footer) {
    footerData.footerCopy = settings.footer;
    if (typeof settings.footer.show_get_in_touch === "boolean") {
      footerData.showGetInTouch = settings.footer.show_get_in_touch;
    }
    if (typeof settings.footer.show_contact_bar === "boolean") {
      footerData.showContactBar = settings.footer.show_contact_bar;
    }
    if (typeof settings.footer.show_solutions_accordion === "boolean") {
      footerData.showSolutionsAccordion = settings.footer.show_solutions_accordion;
    }
  }

  const hasCmsNavigation =
    (Array.isArray(navItems) && navItems.length > 0) || hasSiteSetting(settings, "navbar");
  const navbarVisible = isSiteSettingVisible(settings, "navbar");
  const footerVisible = isSiteSettingVisible(settings, "footer");
  const contactWidgetVisible = isSiteSettingVisible(settings, "contact_widget");
  const notFoundVisible = isSiteSettingVisible(settings, "not_found");

  const quickLinks = navItems
    .filter((item) => item.location === "footer_quick" && item.is_visible)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({ label: item.label, href: item.href }));
  if (hasCmsNavigation) footerData.quickLinks = quickLinks;

  const legalLinks = navItems
    .filter((item) => item.location === "footer_legal" && item.is_visible)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({ label: item.label, href: item.href }));
  if (hasCmsNavigation) footerData.legalLinks = legalLinks;

  const megaExcludeIds = new Set(
    navItems.filter((item) => item.location === "footer_mega_exclude").map((item) => item.href),
  );
  const megaItems = navItems
    .filter(
      (item) =>
        item.location === "navbar_mega" && item.is_visible && !megaExcludeIds.has(item.parent_id ?? ""),
    )
    .sort((a, b) => a.sort_order - b.sort_order);
  if (hasCmsNavigation) {
    const columnMap = new Map<string, { label: string; href: string }[]>();
    for (const item of megaItems) {
      const col = item.mega_column_title || "Solutions";
      if (!columnMap.has(col)) columnMap.set(col, []);
      columnMap.get(col)!.push({ label: item.label, href: item.href });
    }
    footerData.solutionCategories = Array.from(columnMap.entries()).map(([heading, links]) => ({
      heading,
      links,
    }));
  }

  return (
    <>
      <SkipToContent />
      <SearchModal items={searchItems} />
      {navbarVisible && (
        <Navbar
          navItems={navItems}
          companyInfo={settings?.company_info}
          content={settings?.navbar}
          cmsNavigationManaged={hasCmsNavigation}
        />
      )}
      <div id="main-content">
        {notFoundVisible && <NotFoundContent fullHeight content={settings?.not_found} />}
      </div>
      {footerVisible && <Footer cmsData={footerData} />}
      {contactWidgetVisible && <ContactWidget content={settings?.contact_widget} />}
    </>
  );
}
