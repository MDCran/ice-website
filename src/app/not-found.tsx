import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getSiteSettings, getNavigation } from "@/lib/cms";
import type { FooterCMSData } from "@/components/layout/Footer";

export default async function NotFound() {
  let navItems: any[] = [];
  const footerData: FooterCMSData = {};

  try {
    const [settings, nav] = await Promise.all([
      getSiteSettings(),
      getNavigation(),
    ]);
    navItems = nav;

    if (settings?.company_info) {
      footerData.companyInfo = settings.company_info;
    }

    const quickLinks = nav
      .filter((i: any) => i.location === "footer_quick" && i.is_visible)
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((i: any) => ({ label: i.label, href: i.href }));
    if (quickLinks.length > 0) footerData.quickLinks = quickLinks;

    const legalLinks = nav
      .filter((i: any) => i.location === "footer_legal" && i.is_visible)
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((i: any) => ({ label: i.label, href: i.href }));
    if (legalLinks.length > 0) footerData.legalLinks = legalLinks;

    const megaItems = nav
      .filter((i: any) => i.location === "navbar_mega" && i.is_visible)
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
  } catch {
    // CMS unavailable — render with defaults
  }

  return (
    <>
      <Navbar navItems={navItems} />
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="mb-6">
            <span className="text-8xl font-bold gradient-text">404</span>
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Page Not Found
          </h1>
          <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/" className="btn-primary">
              Go Home
            </Link>
            <Link href="/contact" className="btn-outline">
              Contact Us
            </Link>
          </div>
        </div>
      </main>
      <Footer cmsData={footerData} />
    </>
  );
}
