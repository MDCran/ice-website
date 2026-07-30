import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SkipToContent from "@/components/layout/SkipToContent";
import NotFoundContent from "@/components/marketing/NotFoundContent";
import { getSiteSettings, getNavigation } from "@/lib/cms";
import type { FooterCMSData } from "@/components/layout/Footer";

/**
 * Global 404 — unmatched URLs only get the root layout, so we render
 * Navbar + Footer here. Segment `(public)/not-found` stays content-only
 * to avoid double chrome when `notFound()` is called inside public routes.
 */
export default async function NotFound() {
  const [settings, navItems] = await Promise.all([getSiteSettings(), getNavigation()]);

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

  const quickLinks = navItems
    .filter((i: any) => i.location === "footer_quick" && i.is_visible)
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((i: any) => ({ label: i.label, href: i.href }));
  if (quickLinks.length > 0) footerData.quickLinks = quickLinks;

  const legalLinks = navItems
    .filter((i: any) => i.location === "footer_legal" && i.is_visible)
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((i: any) => ({ label: i.label, href: i.href }));
  if (legalLinks.length > 0) footerData.legalLinks = legalLinks;

  const megaExcludeIds = new Set(
    navItems.filter((i: any) => i.location === "footer_mega_exclude").map((i: any) => i.href),
  );
  const megaItems = navItems
    .filter(
      (i: any) =>
        i.location === "navbar_mega" && i.is_visible && !megaExcludeIds.has(i.parent_id),
    )
    .sort((a: any, b: any) => a.sort_order - b.sort_order);
  if (megaItems.length > 0) {
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
      <Navbar navItems={navItems} companyInfo={settings?.company_info} />
      <div id="main-content">
        <NotFoundContent fullHeight />
      </div>
      <Footer cmsData={footerData} />
    </>
  );
}
