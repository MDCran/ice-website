import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Activity, AlertCircle, CursorClick01 } from "@untitledui/icons";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { Badge } from "@/components/base/badges/badges";

export const metadata = { title: "Core Web Vitals | ICE Admin" };

function rating(name: string, value: number): "good" | "needs" | "poor" {
  if (name === "LCP") return value <= 2500 ? "good" : value <= 4000 ? "needs" : "poor";
  if (name === "INP") return value <= 200 ? "good" : value <= 500 ? "needs" : "poor";
  if (name === "CLS") return value <= 0.1 ? "good" : value <= 0.25 ? "needs" : "poor";
  return "needs";
}

function formatMetric(name: string, value: number) {
  if (name === "CLS") return value.toFixed(3);
  if (value >= 1000) return `${(value / 1000).toFixed(2)}s`;
  return `${Math.round(value)}ms`;
}

export default async function PerformancePage() {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data, error } = await supabase
    .from("web_vitals")
    .select("metric_name, metric_value, page_path, created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(500);

  const byMetric = new Map<string, number[]>();
  const byPath = new Map<string, { name: string; value: number }[]>();

  for (const row of data ?? []) {
    const name = String(row.metric_name);
    const value = Number(row.metric_value);
    if (!Number.isFinite(value)) continue;
    const list = byMetric.get(name) ?? [];
    list.push(value);
    byMetric.set(name, list);

    const path = String(row.page_path || "/");
    const pathList = byPath.get(path) ?? [];
    pathList.push({ name, value });
    byPath.set(path, pathList);
  }

  const cards = ["LCP", "INP", "CLS"].map((name) => {
    const values = byMetric.get(name) ?? [];
    const p75 =
      values.length === 0
        ? null
        : [...values].sort((a, b) => a - b)[Math.floor(values.length * 0.75)] ?? values[0];
    return { name, p75, samples: values.length };
  });

  const worstPaths = [...byPath.entries()]
    .map(([path, samples]) => {
      const lcps = samples.filter((s) => s.name === "LCP").map((s) => s.value);
      const avgLcp = lcps.length ? lcps.reduce((a, b) => a + b, 0) / lcps.length : null;
      return { path, samples: samples.length, avgLcp };
    })
    .sort((a, b) => (b.avgLcp ?? 0) - (a.avgLcp ?? 0))
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-display-xs font-semibold text-primary">Core Web Vitals</h1>
        <p className="mt-1 text-sm text-tertiary">
          Field data from the last 7 days (RUM via the public site). Pair with{" "}
          <Link href="/admin/seo" className="text-brand-secondary underline">
            SEO &amp; Analytics
          </Link>{" "}
          for traffic context.
        </p>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-xl bg-primary p-5 ring-1 ring-secondary">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning-primary" />
          <div className="text-sm text-tertiary">
            <p className="font-medium text-primary">Waiting for RUM table</p>
            <p className="mt-1">
              Apply <code className="text-xs">20260729_web_vitals.sql</code> and browse the public
              site to collect samples. ({error.message})
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {cards.map((card) => {
              const tone =
                card.p75 == null
                  ? "gray"
                  : rating(card.name, card.p75) === "good"
                    ? "success"
                    : rating(card.name, card.p75) === "needs"
                      ? "warning"
                      : "error";
              return (
                <div
                  key={card.name}
                  className="rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary"
                >
                  <div className="flex items-center justify-between">
                    <FeaturedIcon
                      icon={card.name === "INP" ? CursorClick01 : Activity}
                      color={tone === "gray" ? "gray" : tone}
                      theme="light"
                      size="md"
                    />
                    <Badge size="sm" color={tone === "gray" ? "gray" : tone}>
                      {card.p75 == null
                        ? "No data"
                        : rating(card.name, card.p75) === "good"
                          ? "Good"
                          : rating(card.name, card.p75) === "needs"
                            ? "Needs improvement"
                            : "Poor"}
                    </Badge>
                  </div>
                  <p className="mt-4 text-sm font-medium text-tertiary">{card.name} (p75)</p>
                  <p className="mt-1 text-display-xs font-semibold text-primary tabular-nums">
                    {card.p75 == null ? "—" : formatMetric(card.name, card.p75)}
                  </p>
                  <p className="mt-1 text-xs text-quaternary">{card.samples} samples</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
            <div className="border-b border-secondary px-5 py-4">
              <h2 className="text-md font-semibold text-primary">Slowest paths by avg LCP</h2>
            </div>
            {worstPaths.length === 0 ? (
              <p className="px-5 py-8 text-sm text-tertiary">
                No path samples yet. Open a few public pages while the reporter is mounted.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-secondary text-left text-xs text-quaternary">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Path</th>
                    <th className="px-5 py-3 font-semibold">Avg LCP</th>
                    <th className="px-5 py-3 font-semibold">Samples</th>
                  </tr>
                </thead>
                <tbody>
                  {worstPaths.map((row) => (
                    <tr key={row.path} className="border-t border-secondary">
                      <td className="px-5 py-3 font-mono text-xs text-secondary">{row.path}</td>
                      <td className="px-5 py-3 tabular-nums text-primary">
                        {row.avgLcp == null ? "—" : formatMetric("LCP", row.avgLcp)}
                      </td>
                      <td className="px-5 py-3 text-tertiary">{row.samples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
