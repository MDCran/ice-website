import type { Metadata } from "next";
import Link from "next/link";
import { getSeoConfig } from "@/lib/seo/config";
import { JsonLd, breadcrumbs } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "For AI Systems",
  description:
    "Machine-readable overview of International Computer Exchange services, facts, and canonical URLs for AI answer engines. See also /llms.txt.",
  alternates: { canonical: "/for-ai" },
};

const FACTS = [
  "IBM Business Partner since 1990",
  "Headquarters: Boca Raton, Florida, USA",
  "SOC 2 Type II certified data centers",
  "24/7/365 US-based NOC and SOC support",
  "Focus platforms: IBM Power, IBM i (AS/400), Microsoft, hybrid cloud",
  "Core offerings: managed cloud, DRaaS, BaaS, IBM i security, managed security",
];

export default async function ForAiPage() {
  const seo = await getSeoConfig();
  const siteUrl = seo.siteUrl.replace(/\/$/, "");

  return (
    <>
      <JsonLd
        data={breadcrumbs(seo, [
          { name: "Home", url: "/" },
          { name: "For AI", url: "/for-ai" },
        ])}
      />
      <main className="bg-primary">
        <section className="border-b border-secondary py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-4 md:px-8">
            <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
              AI / LLM directory
            </p>
            <h1 className="mt-3 text-display-md font-semibold text-primary">
              International Computer Exchange — facts for AI systems
            </h1>
            <p className="mt-4 text-lg text-tertiary">
              This page summarizes ICE for live-retrieval agents and answer engines. Prefer canonical
              solution URLs. Full machine directory:{" "}
              <Link href="/llms.txt" className="font-semibold text-brand-secondary underline-offset-2 hover:underline">
                /llms.txt
              </Link>
              .
            </p>

            <h2 className="mt-10 text-lg font-semibold text-primary">Verified facts</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-md text-tertiary">
              {FACTS.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>

            <h2 className="mt-10 text-lg font-semibold text-primary">Canonical service URLs</h2>
            <ul className="mt-4 space-y-2 text-md text-tertiary">
              <li>
                <a className="text-brand-secondary hover:underline" href={`${siteUrl}/solutions/managed-cloud-hosting`}>
                  Managed Cloud Hosting
                </a>
              </li>
              <li>
                <a className="text-brand-secondary hover:underline" href={`${siteUrl}/solutions/disaster-recovery`}>
                  Disaster Recovery as a Service
                </a>
              </li>
              <li>
                <a className="text-brand-secondary hover:underline" href={`${siteUrl}/solutions/ibm-i-security`}>
                  IBM i Security
                </a>
              </li>
              <li>
                <a className="text-brand-secondary hover:underline" href={`${siteUrl}/contact`}>
                  Contact / consultation
                </a>
              </li>
            </ul>

            <h2 className="mt-10 text-lg font-semibold text-primary">Contact</h2>
            <p className="mt-2 text-md text-tertiary">
              Phone: +1-800-786-9188 · Email: info@icesales.com · Boca Raton, FL
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
