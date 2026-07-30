import Link from "next/link";
import { ArrowRight, CheckCircle } from "@untitledui/icons";

const OPTIONS = [
  {
    name: "IBM i Managed Cloud",
    bestFor: "Modernizing Power workloads without replatforming",
    sla: "99.99% target",
    rpo: "15 min–24 hr",
    rto: "4–24 hr",
    platforms: "IBM i, AIX, Power",
    href: "/solutions/managed-cloud-hosting",
  },
  {
    name: "Managed Hybrid Cloud",
    bestFor: "One operating model across on-prem and cloud",
    sla: "Workload-specific",
    rpo: "Policy-based",
    rto: "Workload-specific",
    platforms: "IBM i, x86, Azure",
    href: "/solutions/managed-hybrid-cloud",
  },
  {
    name: "Disaster Recovery",
    bestFor: "Defined recovery targets and tested failover",
    sla: "Recovery SLA",
    rpo: "Near-zero–24 hr",
    rto: "<1–24 hr",
    platforms: "IBM i, AIX, Windows, Linux",
    href: "/solutions/disaster-recovery",
  },
];

export default function SolutionComparisonMatrix() {
  return (
    <section id="compare" className="border-y border-secondary bg-secondary py-16 md:py-24">
      <div className="mx-auto max-w-container px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">Shortlist faster</span>
          <h2 className="mt-3 text-display-sm font-semibold text-primary md:text-display-md">Compare common solution paths</h2>
          <p className="mt-4 text-lg text-tertiary">Starting ranges for planning; final commitments depend on workload discovery and design.</p>
        </div>
        <div className="mt-10 overflow-x-auto rounded-2xl bg-primary shadow-sm ring-1 ring-secondary">
          <table className="min-w-[760px] w-full text-left">
            <thead>
              <tr className="border-b border-secondary bg-secondary/70">
                <th className="px-5 py-4 text-xs font-semibold tracking-wider text-quaternary uppercase">Decision factor</th>
                {OPTIONS.map((option) => (
                  <th key={option.name} className="px-5 py-4 text-md font-semibold text-primary">{option.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Best for", "bestFor"],
                ["Availability", "sla"],
                ["Typical RPO", "rpo"],
                ["Typical RTO", "rto"],
                ["Platforms", "platforms"],
              ].map(([label, key]) => (
                <tr key={key} className="border-b border-secondary last:border-0">
                  <th className="px-5 py-4 text-sm font-semibold text-secondary">{label}</th>
                  {OPTIONS.map((option) => (
                    <td key={option.name} className="px-5 py-4 text-sm text-tertiary">
                      {key === "bestFor" && <CheckCircle className="mr-2 inline size-4 text-fg-brand-primary" />}
                      {option[key as keyof typeof option]}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th className="px-5 py-4 text-sm font-semibold text-secondary">Explore</th>
                {OPTIONS.map((option) => (
                  <td key={option.name} className="px-5 py-4">
                    <Link href={option.href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-secondary">
                      View solution <ArrowRight className="size-4" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
