import type { Metadata } from "next";
import Link from "next/link";
import SolutionFinder from "@/components/marketing/SolutionFinder";
import AtmosphericBand from "@/components/marketing/AtmosphericBand";
import { JsonLd, breadcrumbs } from "@/lib/seo/jsonld";
import { getSeoConfig } from "@/lib/seo/config";

export const metadata: Metadata = {
  title: "Solution Finder",
  description:
    "Find the right ICE solution with a quick guided match or a more detailed assessment.",
  alternates: { canonical: "/solutions/find" },
  openGraph: {
    title: "Solution Finder | International Computer Exchange",
    description:
      "Get tailored ICE recommendations for managed cloud, DR, security, IBM Power, Microsoft, and managed operations.",
  },
};

export default async function SolutionFinderPage() {
  const seo = await getSeoConfig();

  return (
    <>
      <JsonLd
        data={breadcrumbs(seo, [
          { name: "Home", url: "/" },
          { name: "Solutions", url: "/solutions" },
          { name: "Solution Finder", url: "/solutions/find" },
        ])}
      />
      <main className="bg-primary">
        <AtmosphericBand tone="muted" className="border-b border-secondary py-16 md:py-24">
          <div className="mx-auto w-full max-w-container px-4 md:px-8">
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1.5 text-sm">
              <Link href="/" className="font-medium text-tertiary hover:text-brand-secondary">
                Home
              </Link>
              <span className="text-fg-quaternary">/</span>
              <Link href="/solutions" className="font-medium text-tertiary hover:text-brand-secondary">
                Solutions
              </Link>
              <span className="text-fg-quaternary">/</span>
              <span className="font-medium text-secondary">Finder</span>
            </nav>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
                Guided recommendations
              </p>
              <h1 className="mt-3 text-display-md font-semibold text-primary md:text-display-lg">
                Find the right ICE solution
              </h1>
              <p className="mt-4 text-lg text-tertiary">
                Choose a quick match or a detailed assessment to get one recommended starting point and two supporting options.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-6xl md:mt-12">
              <SolutionFinder />
            </div>
            <div className="mx-auto mt-8 flex max-w-6xl justify-center">
              <Link
                href="/solutions"
                className="text-sm font-semibold text-brand-secondary underline-offset-2 hover:underline"
              >
                Or browse the full catalog →
              </Link>
            </div>
          </div>
        </AtmosphericBand>
      </main>
    </>
  );
}
