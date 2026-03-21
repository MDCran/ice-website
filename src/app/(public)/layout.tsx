import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CursorGlow from "@/components/effects/CursorGlow";
import NoiseOverlay from "@/components/effects/NoiseOverlay";
import PageTransition from "@/components/effects/PageTransition";
import SearchModal from "@/components/ui/SearchModal";
import ContactWidget from "@/components/ui/ContactWidget";
import { getSiteSettings, getNavigation, getSearchIndex } from "@/lib/cms";
import type { FooterCMSData } from "@/components/layout/Footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch site settings + navigation for footer
  const [settings, navItems, searchItems] = await Promise.all([
    getSiteSettings(),
    getNavigation(),
    getSearchIndex(),
  ]);

  // Build footer CMS data from site settings + navigation
  const footerData: FooterCMSData = {};

  if (settings?.company_info) {
    footerData.companyInfo = settings.company_info;
  }

  // Quick links from footer_quick nav items
  const quickLinks = navItems
    .filter((i: any) => i.location === "footer_quick" && i.is_visible)
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((i: any) => ({ label: i.label, href: i.href }));
  if (quickLinks.length > 0) footerData.quickLinks = quickLinks;

  // Legal links from footer_legal nav items
  const legalLinks = navItems
    .filter((i: any) => i.location === "footer_legal" && i.is_visible)
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((i: any) => ({ label: i.label, href: i.href }));
  if (legalLinks.length > 0) footerData.legalLinks = legalLinks;

  // Mega-menu parents excluded from footer dropdown
  const megaExcludeIds = new Set(
    navItems
      .filter((i: any) => i.location === "footer_mega_exclude")
      .map((i: any) => i.href)
  );

  // Solution categories from navbar_mega items (grouped by column title)
  const megaItems = navItems
    .filter(
      (i: any) =>
        i.location === "navbar_mega" &&
        i.is_visible &&
        !megaExcludeIds.has(i.parent_id)
    )
    .sort((a: any, b: any) => a.sort_order - b.sort_order);
  if (megaItems.length > 0) {
    const columnMap = new Map<string, { label: string; href: string }[]>();
    for (const item of megaItems) {
      const col = item.mega_column_title || "Solutions";
      if (!columnMap.has(col)) columnMap.set(col, []);
      columnMap.get(col)!.push({ label: item.label, href: item.href });
    }
    footerData.solutionCategories = Array.from(columnMap.entries()).map(
      ([heading, links]) => ({ heading, links })
    );
  }

  return (
    <>
      <CursorGlow />
      <NoiseOverlay />
      <SearchModal items={searchItems} />
      <Navbar navItems={navItems} />
      <PageTransition>{children}</PageTransition>
      <Footer cmsData={footerData} />
      <ContactWidget />
    </>
  );
}
