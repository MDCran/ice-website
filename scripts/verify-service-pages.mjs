import { services } from "../content/service-audit-2026-09.mjs";

const base = process.argv[2] || "http://localhost:3100";
const allowOldSeo = process.argv.includes("--content-only");
const results = [];
for (const slug of Object.keys(services)) {
  const response = await fetch(`${base}/solutions/${slug}`, { headers: { "User-Agent": "Googlebot" }, signal: AbortSignal.timeout(30000) });
  const html = await response.text();
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
  const description = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/)?.[1];
  const jsonLd = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
  const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ");
  const failures = [];
  if (response.status !== 200 || new URL(response.url).pathname !== `/solutions/${slug}`) failures.push("status/redirect");
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) failures.push("H1 count");
  if (!description) failures.push("description");
  if (!allowOldSeo && (!canonical?.startsWith("https://") || canonical.includes("localhost"))) failures.push("canonical");
  if (!jsonLd.some((d) => d["@type"] === "Service")) failures.push("service schema");
  if (!jsonLd.some((d) => d["@type"] === "FAQPage")) failures.push("FAQ schema");
  if (!visible.includes("30+ years in business") || !visible.includes("Which commitments are included?")) failures.push("stale content");
  if (/ACTIVE SLA|GUARANTEED|99\.99%|80% lower|Threats Blocked \(30d\)/.test(visible)) failures.push("legacy claim visible");
  results.push({ slug, status: response.status, canonical, failures });
}
console.log(JSON.stringify(results, null, 2));
const failed = results.filter((r) => r.failures.length);
console.log(`${results.length - failed.length}/${results.length} service pages passed${allowOldSeo ? " content checks (SEO deployment excluded)" : ""}.`);
if (failed.length) process.exitCode = 1;
