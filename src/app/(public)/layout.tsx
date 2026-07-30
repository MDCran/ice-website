import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SkipToContent from "@/components/layout/SkipToContent";
import PageTransition from "@/components/effects/PageTransition";
import SmoothScroll from "@/components/effects/SmoothScroll";
import SearchModal from "@/components/ui/SearchModal";
import ContactWidget from "@/components/ui/ContactWidget";
import AnnouncementBanner from "@/components/marketing/AnnouncementBanner";
import SoftLeadCapture from "@/components/marketing/SoftLeadCapture";
import Analytics from "@/components/analytics/Analytics";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import WebVitalsReporter from "@/components/analytics/WebVitalsReporter";
import { getSiteSettings, getNavigation, getSearchIndex } from "@/lib/cms";
import { getSeoConfig } from "@/lib/seo/config";
import { JsonLd, organization, webSite } from "@/lib/seo/jsonld";
import type { FooterCMSData } from "@/components/layout/Footer";
import type { AnnouncementBannerContent } from "@/components/marketing/AnnouncementBanner";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch site settings + navigation for footer
  const [settings, navItems, searchItems, seo] = await Promise.all([
    getSiteSettings(),
    getNavigation(),
    getSearchIndex(),
    getSeoConfig(),
  ]);

  // Build footer CMS data from site settings + navigation
  const footerData: FooterCMSData = {};

  if (settings?.company_info) {
    footerData.companyInfo = settings.company_info;
  }

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

  const announcement = (settings?.announcement_banner ?? null) as AnnouncementBannerContent | null;

  return (
    <>
      <JsonLd data={organization(seo)} />
      <JsonLd data={webSite(seo)} />
      <Analytics gtmId={seo.analytics.gtmId} ga4Id={seo.analytics.ga4Id} />
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <WebVitalsReporter />
      <SmoothScroll />
      <SkipToContent />
      <AnnouncementBanner content={announcement} />
      <SearchModal items={searchItems} />
      <Navbar navItems={navItems} companyInfo={settings?.company_info} />
      <PageTransition>
        <div id="main-content">{children}</div>
      </PageTransition>
      <Footer cmsData={footerData} />
      <ContactWidget />
      <SoftLeadCapture />
    </>
  );
}
