import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/base/buttons/button";
import { BackgroundPattern } from "@/components/shared-assets/background-patterns";
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
      {/* Scoped entrance animation — CSS-only so this stays a server component;
          disabled automatically when the user prefers reduced motion. */}
      <style>{`
        @keyframes nf-rise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: no-preference) {
          .nf-rise { animation: nf-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
          .nf-d1 { animation-delay: 0.08s; }
          .nf-d2 { animation-delay: 0.16s; }
          .nf-d3 { animation-delay: 0.24s; }
          .nf-d4 { animation-delay: 0.32s; }
        }
      `}</style>

      <Navbar navItems={navItems} />
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary py-16 md:py-24">
        <BackgroundPattern
          pattern="grid"
          size="lg"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />

        <div className="relative mx-auto w-full max-w-container px-4 md:px-8">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <span className="nf-rise font-mono text-xs font-semibold tracking-[0.2em] text-brand-secondary uppercase md:text-sm">
              404 error
            </span>

            <span
              aria-hidden="true"
              className="nf-rise nf-d1 mt-4 bg-gradient-to-b from-brand-500 to-brand-800 bg-clip-text font-mono text-display-2xl font-semibold text-transparent md:text-[9rem] md:leading-none dark:from-brand-300 dark:to-brand-600 dark:drop-shadow-[0_0_40px_rgb(4_155_251/0.25)]"
            >
              404
            </span>

            <h1 className="nf-rise nf-d2 mt-4 text-display-sm font-semibold text-primary md:text-display-md">
              Page not found
            </h1>
            <p className="nf-rise nf-d2 mt-4 max-w-xl text-lg text-tertiary md:mt-5 md:text-xl">
              Sorry, the page you&apos;re looking for doesn&apos;t exist or has
              been moved. Check the URL, or head back to explore our solutions.
            </p>

            <div className="nf-rise nf-d3 mt-8 flex flex-col-reverse gap-3 self-stretch sm:flex-row sm:justify-center sm:self-center md:mt-12">
              <Button color="secondary" size="xl" href="/solutions">
                View solutions
              </Button>
              <Button size="xl" href="/">
                Go home
              </Button>
            </div>

            <div className="nf-rise nf-d4 mt-8 flex flex-col items-center gap-6">
              <Button color="link-color" size="lg" href="/contact">
                Contact support
              </Button>
              <div
                aria-hidden="true"
                className="h-px w-48 bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer cmsData={footerData} />
    </>
  );
}
