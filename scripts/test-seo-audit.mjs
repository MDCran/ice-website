import assert from "node:assert/strict";
import { publicUrl, resolveSiteUrl, PUBLIC_SITE_URL } from "../src/lib/seo/siteUrl.ts";
import { services } from "../content/service-audit-2026-09.mjs";

for (const value of [undefined, "", "invalid", "http://localhost:3000", "https://localhost", "https://127.0.0.1", "https://[::1]", "javascript:alert(1)", "https://user:password@example.com"]) {
  assert.equal(resolveSiteUrl(value), PUBLIC_SITE_URL);
}
assert.equal(resolveSiteUrl("https://sandbox.icesales.com/path?q=1"), "https://sandbox.icesales.com");
assert.equal(resolveSiteUrl("http://localhost:3000", "https://www.icesales.com"), PUBLIC_SITE_URL);
assert.equal(publicUrl("/solutions/as400", PUBLIC_SITE_URL), `${PUBLIC_SITE_URL}/solutions/as400`);
assert.equal(publicUrl("http://localhost:3000/solutions/as400"), null);
assert.equal(publicUrl("javascript:alert(1)"), null);
assert.equal(Object.keys(services).length, 18);
assert.equal(new Set(Object.values(services).map((s) => s.description)).size, 18);
for (const [slug, copy] of Object.entries(services)) {
  assert.ok(copy.description.length <= 160, `${slug}: description too long`);
  assert.equal(copy.features.length, 4);
  assert.ok(copy.question && copy.answer && copy.intro);
  assert.ok(!/99\.99|80%|100%|zero downtime guaranteed|SOC 2 certified/i.test(copy.intro));
}
console.log("SEO URL safety and all 18 audited service profiles passed.");
