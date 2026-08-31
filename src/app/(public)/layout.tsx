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
import { EnterpriseStickyCta } from "@/components/marketing/EnterpriseSalesWidgets";
import Analytics from "@/components/analytics/Analytics";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import WebVitalsReporter from "@/components/analytics/WebVitalsReporter";
import {
  getSiteSettings,
  getNavigation,
  getSearchIndex,
  hasSiteSetting,
  isSiteSettingVisible,
} from "@/lib/cms";
import { resolveSalesEnablement } from "@/lib/salesEnablement";
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

  const hasCmsNavigation =
    (Array.isArray(navItems) && navItems.length > 0) || hasSiteSetting(settings, "navbar");
  const navbarVisible = isSiteSettingVisible(settings, "navbar");
  const footerVisible = isSiteSettingVisible(settings, "footer");
  const contactWidgetVisible = isSiteSettingVisible(settings, "contact_widget");
  const salesEnablementVisible = isSiteSettingVisible(settings, "sales_enablement");

  // Quick links from footer_quick nav items. Once navigation rows exist,
  // an empty visible group is intentional and must not resurrect defaults.
  const quickLinks = navItems
    .filter((item) => item.location === "footer_quick" && item.is_visible)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({ label: item.label, href: item.href }));
  if (hasCmsNavigation) footerData.quickLinks = quickLinks;

  // Legal links from footer_legal nav items
  const legalLinks = navItems
    .filter((item) => item.location === "footer_legal" && item.is_visible)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({ label: item.label, href: item.href }));
  if (hasCmsNavigation) footerData.legalLinks = legalLinks;

  // Mega-menu parents excluded from footer dropdown
  const megaExcludeIds = new Set(
    navItems
      .filter((item) => item.location === "footer_mega_exclude")
      .map((item) => item.href)
  );

  // Solution categories from navbar_mega items (grouped by column title)
  const megaItems = navItems
    .filter(
      (item) =>
        item.location === "navbar_mega" &&
        item.is_visible &&
        !megaExcludeIds.has(item.parent_id ?? "")
    )
    .sort((a, b) => a.sort_order - b.sort_order);
  if (hasCmsNavigation) {
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
  const salesConfig = resolveSalesEnablement(settings.sales_enablement);

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
      {navbarVisible && (
        <Navbar
          navItems={navItems}
          companyInfo={settings?.company_info}
          content={settings?.navbar}
          cmsNavigationManaged={hasCmsNavigation}
        />
      )}
      <PageTransition>
        <div id="main-content">{children}</div>
      </PageTransition>
      {footerVisible && <Footer cmsData={footerData} />}
      {contactWidgetVisible && <ContactWidget content={settings?.contact_widget} />}
      {salesEnablementVisible && salesConfig.enabled && salesConfig.visibility.showStickyCta && (
        <EnterpriseStickyCta config={salesConfig} />
      )}
      <SoftLeadCapture
        enabled={
          salesEnablementVisible &&
          salesConfig.enabled &&
          salesConfig.visibility.showSoftLeadCapture
        }
        headline={salesConfig.global.softLeadHeadline}
        description={salesConfig.global.softLeadDescription}
        content={salesConfig.global.softLead}
      />
    </>
  );
}
