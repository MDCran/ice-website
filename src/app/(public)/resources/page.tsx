import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Cloud01, File02, Server01, Shield01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { BrandOrbs } from "@/components/effects/AmbientMotion";
import { JsonLd, breadcrumbs } from "@/lib/seo/jsonld";
import { getSeoConfig } from "@/lib/seo/config";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "ICE resource hub: enterprise guides on managed cloud, disaster recovery, IBM i security, and business continuity for IBM Power environments.",
  alternates: { canonical: "/resources" },
};

const RESOURCES = [
  {
    category: "AS400",
    title: "AS400 modernization assessment",
    summary:
      "How to evaluate AS/400, iSeries, and IBM i hosting, security, backup, HA, and DR options.",
    href: "/solutions/as400",
    icon: Server01,
  },
  {
    category: "Cloud",
    title: "Managed cloud for IBM Power workloads",
    summary:
      "How ICE hosts IBM i and AIX with 24/7 operations, defined SLAs, and SOC 2 Type II controls.",
    href: "/solutions/managed-cloud-hosting",
    icon: Cloud01,
  },
  {
    category: "Continuity",
    title: "Disaster recovery with measurable RPO/RTO",
    summary:
      "What to require from a DRaaS partner: replication, test cadence, and failover runbooks.",
    href: "/solutions/disaster-recovery",
    icon: File02,
  },
  {
    category: "Security",
    title: "IBM i security hardening checklist",
    summary:
      "Exit points, object authority, encryption, and monitoring practices for AS/400 environments.",
    href: "/solutions/ibm-i-security",
    icon: Shield01,
  },
];

export default async function ResourcesPage() {
  const seo = await getSeoConfig();

  return (
    <>
      <JsonLd
        data={breadcrumbs(seo, [
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources" },
        ])}
      />
      <main className="bg-primary">
        <section className="relative isolate overflow-hidden border-b border-secondary bg-gradient-to-b from-[var(--color-bg-secondary)] via-[var(--color-bg-primary)] to-[var(--color-bg-primary)] py-20 md:py-28 lg:py-32">
          <div
            aria-hidden="true"
            className="texture-grid pointer-events-none absolute inset-0 opacity-[0.5] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
          />
          <div
            aria-hidden="true"
            className="texture-noise pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          />
          <BrandOrbs />

          <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 text-center md:px-8">
            <h1 className="text-display-md font-semibold tracking-tight text-primary md:text-display-lg">
              Knowledge Hub
            </h1>
            <p className="mt-4 text-lg text-tertiary md:mt-6 md:text-xl">
              Fact-dense primers on managed cloud, data protection, and IBM i security — written for
              architects and IT leaders evaluating ICE.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto grid w-full max-w-container gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4 md:px-8">
            {RESOURCES.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col rounded-2xl bg-primary p-6 ring-1 ring-secondary transition hover:ring-brand"
              >
                <item.icon className="size-6 text-fg-brand-primary" />
                <span className="mt-4 text-xs font-medium tracking-[0.16em] text-brand-secondary uppercase">
                  {item.category}
                </span>
                <h2 className="mt-2 text-lg font-semibold text-primary group-hover:text-brand-secondary">
                  {item.title}
                </h2>
                <p className="mt-2 flex-1 text-sm text-tertiary">{item.summary}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-secondary">
                  Read more <ArrowRight className="size-4" />
                </span>
              </Link>
            ))}
          </div>
          <div className="mx-auto mt-12 flex max-w-container justify-center px-4 md:px-8">
            <Button href="/contact" size="xl">
              Request a guided assessment
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
