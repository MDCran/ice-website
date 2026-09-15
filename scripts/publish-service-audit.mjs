/** One-time editorial migration. Dry run by default; --apply writes with a backup.
 * Never run automatically at startup: later administrator edits remain authoritative.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { services } from "../content/service-audit-2026-09.mjs";

nextEnv.loadEnvConfig(process.cwd());
const apply = process.argv.includes("--apply");
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const snapshot = {};
for (const table of ["pages", "page_sections", "navigation_items"]) {
  const { data, error } = await client.from(table).select("*");
  if (error) throw error;
  snapshot[table] = data;
}
const changes = [];
const pageFor = (slug) => snapshot.pages.find((p) => p.slug === slug);
const sectionFor = (slug, key) => snapshot.page_sections.find((s) => s.page_id === pageFor(slug)?.id && s.section_key === key);
function update(table, row, patch) {
  if (!row) throw new Error(`Missing required ${table} record`);
  if (Object.entries(patch).every(([key, value]) => JSON.stringify(row[key]) === JSON.stringify(value))) return;
  changes.push({ table, id: row.id, before: row, patch });
}
function section(slug, key, content, visible) {
  const row = sectionFor(slug, key);
  if (!row) return; // Do not invent missing or previously removed sections.
  update("page_sections", row, { content, ...(visible === undefined ? {} : { is_visible: visible }) });
}
function mergeSection(slug, key, patch) {
  const row = sectionFor(slug, key);
  if (row) section(slug, key, { ...row.content, ...patch });
}
const scope = "Features, supported platforms, coverage hours, pricing, availability commitments, and recovery objectives are defined in your proposal and service agreement after assessment. This page is an overview, not an SLA or a compliance certification.";
const icons = ["Server", "Settings", "Shield", "CheckCircle"];
for (const [slug, copy] of Object.entries(services)) {
  const page = pageFor(slug);
  if (!page || page.page_type !== "solution") throw new Error(`Expected solution page: ${slug}`);
  update("pages", page, { title: copy.title, meta_title: copy.title, meta_description: copy.description, ...(slug === "as400" ? { sort_order: -10 } : {}) });
  mergeSection(slug, "hero", { headline: copy.title, eyebrow: "30+ years in business · ICE", subheadline: copy.intro, proof_labels: ["Serving businesses since 1990", "Workload-specific planning", "Defined service responsibilities"] });
  section(slug, "features", { eyebrow: "Service scope", heading: `${copy.title}: what to plan`, description: "Build the service around your environment. These are the areas to review with ICE.", items: copy.features.map(([title, description], i) => ({ icon: icons[i], title, description })) });
  section(slug, "process", { eyebrow: "How we work", heading: "A plan built around your business", items: [
    { step: "01", title: "Assess", description: "Review applications, platforms, dependencies, business priorities, and existing support arrangements." },
    { step: "02", title: "Agree the scope", description: "Document the selected services, costs, responsibilities, exclusions, and measurable objectives." },
    { step: "03", title: "Implement and validate", description: "Test the proposed changes and agree acceptance criteria before production handover." },
    { step: "04", title: "Review", description: "Review the agreed service and update the plan as your environment and requirements change." },
  ] });
  section(slug, "benefits", { eyebrow: "Why ICE", heading: "30+ years in business. A practical approach to your next step.", items: ["IBM-focused enterprise technology experience since 1990.", "A service plan based on your applications, priorities, and operating requirements.", "Documented responsibilities and expectations before implementation."] });
  section(slug, "faq", { heading: `${copy.title}: common questions`, items: [
    { question: copy.question, answer: copy.answer },
    { question: "What should we share for an assessment?", answer: "Share your platform and operating-system versions, application dependencies, current support arrangements, data volumes, business priorities, and preferred timing. Do not send passwords or confidential credentials through the contact form." },
    { question: "Which commitments are included?", answer: scope },
  ] });
  mergeSection(slug, "cta", { heading: `Talk to ICE about ${copy.title}`, description: "Bring your requirements to a partner with 30+ years in business. We will help define a practical next step.", support_note: scope });
  const profile = sectionFor(slug, "service_profile")?.content;
  if (profile) section(slug, "service_profile", {
    ...profile, card_description: copy.description, outcome: `Plan ${copy.title.toLowerCase()} around your workload requirements`,
    tags: slug === "as400" ? ["AS400 hosting", "AS/400", "IBM i", "iSeries", "IBM Power", "Managed hosting"] : [...new Set([copy.title, ...(profile.tags ?? [])])],
    schema: { ...profile.schema, service_type: copy.title, ...(slug === "as400" ? { aliases: ["AS400 hosting", "AS/400 hosting", "iSeries hosting", "IBM i hosting"] } : {}) },
    finder: { ...profile.finder, proof: "30+ years in business. Scope and commitments confirmed after assessment.", timeline: "Defined after assessment" },
  });
  const tools = sectionFor(slug, "buyer_tools")?.content;
  if (tools) section(slug, "buyer_tools", { ...tools,
    proof_strip: { ...tools.proof_strip, outcome: `Plan ${copy.title.toLowerCase()} around your workload requirements`, outcome_label: "Planning focus" },
    architecture: { ...tools.architecture, badges: [{ icon: "CheckCircle", label: "Scope agreed with your team" }], description: "Illustrative service layers; the implemented architecture depends on your agreed scope.", summary: "Confirm platform, connectivity, protection, operations, and reporting responsibilities during assessment." },
  });
  // Retain unsupported legacy marketing in the CMS for review, but do not publish it.
  for (const key of ["stats", "roi", "metrics", "value_props", "banner", "use_cases"]) {
    const row = sectionFor(slug, key);
    if (row) update("page_sections", row, { is_visible: false });
  }
  const related = sectionFor(slug, "related")?.content;
  if (related?.items) section(slug, "related", { ...related, items: related.items.map((item) => {
    const target = services[item.href?.split("/").pop()];
    return target ? { ...item, title: target.title, description: target.description } : item;
  }) });
}

const proof = "30+ years in business · Serving enterprise IT since 1990";
mergeSection("site-settings", "navbar", { proof_line: proof, promo_eyebrow: "Our core specialty", promo_heading: "AS400 & IBM i Hosting", promo_description: "30+ years in business. Hosting, support, backup, and recovery for your IBM i environment.", promo_primary: { href: "/solutions/as400", label: "Explore AS400 hosting" } });
mergeSection("site-settings", "footer", { ibm_partner_text: "30+ years in business. ICE has served enterprise technology customers since 1990, with AS400 and IBM i hosting, IBM Power support, cloud, security, and data protection services." });
mergeSection("home", "hero", { badge: proof, headline: "AS400 & IBM i expertise. Built over 30+ years.", subheadline: "Your business runs on more than hardware. ICE helps you host, support, and protect IBM i applications, with cloud, security, and recovery services planned around your business.", cta_primary: { href: "/solutions/as400", label: "Explore AS400 & IBM i" } });
mergeSection("solutions", "hero", { eyebrow: "30+ years in business", headline: "AS400 & IBM i at the heart of your IT.", subheadline: "Start with ICE's core specialty in IBM i hosting and support, then explore cloud, data protection, security, and managed services for the rest of your environment.", cta_primary: { href: "/solutions/as400", label: "Explore AS400 & IBM i" }, buyer_signals: [
  { value: "30+", label: "Years in business", detail: "Serving enterprise technology customers since 1990." },
  { value: "IBM i", label: "Core specialty", detail: "AS400 hosting, platform support, and recovery planning." },
  { value: "Your scope", label: "Your requirements", detail: "Services and commitments agreed after assessment." },
] });
for (const slug of ["home", "solutions", "why-ice"]) {
  const titles = { home: "AS400 & IBM i Hosting | ICE — 30+ Years in Business", solutions: "AS400, IBM i & Managed IT Solutions | ICE", "why-ice": "Why ICE? 30+ Years in Enterprise IT" };
  update("pages", pageFor(slug), { meta_title: titles[slug], meta_description: slug === "solutions" ? "Explore AS400 and IBM i hosting, cloud, backup, recovery, security, and managed IT services from ICE, with 30+ years in business." : "ICE brings 30+ years in business to AS400 and IBM i hosting, IBM Power support, cloud services, security, backup, and disaster recovery planning." });
}
mergeSection("why-ice", "hero", { headline: "30+ years in business. Focused on your next chapter.", subheadline: "Since 1990, ICE has helped businesses plan and support enterprise technology, with IBM i and IBM Power at the heart of our expertise." });
for (const slug of ["home", "why-ice"]) {
  mergeSection(slug, "stats", { items: [{ value: 30, suffix: "+", label: "Years in Business" }] });
}
const homeMetrics = sectionFor("home", "metrics");
if (homeMetrics) update("page_sections", homeMetrics, { is_visible: false });
mergeSection("home", "timeline", { heading: "30+ years in business", items: [
  { year: "1990", title: "Our beginning", description: "ICE began serving enterprise technology customers with an IBM-focused approach." },
  { year: "Today", title: "Your next chapter", description: "AS400 and IBM i hosting, platform support, cloud, security, and data protection planning for today's business requirements." },
] });
mergeSection("home", "trust_badges", { heading: "Experience with a practical focus", items: [
  { icon: "Server", title: "IBM i expertise", description: "AS400 hosting and IBM Power platform support" },
  { icon: "Award", title: "30+ years in business", description: "Enterprise technology experience since 1990" },
  { icon: "Database", title: "Recovery planning", description: "Backup and recovery options matched to your needs" },
  { icon: "Users", title: "Defined responsibilities", description: "Service scope agreed with your team" },
] });
mergeSection("home", "data_centers", { heading: "Infrastructure built around your requirements", badge_label: "Infrastructure", badge_value: "Workload-specific design", description: "Review the proposed hosting location, resilience, security controls, and available assurance reports with ICE before selecting a service.", features: ["Capacity and connectivity planning", "Power and cooling requirements", "Physical access controls", "Backup and recovery arrangements", "Current facility reports available for scope review"] });
const differences = sectionFor("why-ice", "differentiators")?.content;
if (differences?.items) section("why-ice", "differentiators", { ...differences, items: differences.items.map((item) => item.title === "Enterprise-Grade Infrastructure" ? { ...item, description: "Review hosting facilities, resilience, access controls, and current assurance reports as part of the service design. Compliance depends on the agreed scope and your own processes." } : item) });
const whyFaq = sectionFor("why-ice", "faqs")?.content;
if (whyFaq?.items) section("why-ice", "faqs", { ...whyFaq, items: whyFaq.items.map((item) => item.question === "Where is ICE's infrastructure hosted?" ? { ...item, answer: "Hosting locations and facility controls depend on the selected service. Ask ICE for the locations, current assurance reports, contractual requirements, and responsibilities relevant to your proposed environment." } : item) });
const definitions = sectionFor("solutions", "categories")?.content;
if (definitions?.items) {
  const items = structuredClone(definitions.items);
  const managed = items.find((item) => item.title === "Managed Services");
  if (managed) {
    managed.services = [{ href: "/solutions/as400", title: services.as400.title, icon: "Server", description: services.as400.description }, ...managed.services.filter((s) => s.href !== "/solutions/as400")];
    items.sort((a, b) => Number(b === managed) - Number(a === managed));
  }
  for (const category of items) for (const item of category.services ?? []) {
    const copy = services[item.href?.split("/").pop()];
    if (copy) Object.assign(item, { title: copy.title, description: copy.description });
  }
  section("solutions", "categories", { ...definitions, items });
}
const comparison = sectionFor("solutions", "comparison")?.content;
if (comparison?.items) section("solutions", "comparison", { ...comparison, description: "Compare service purposes. Availability and recovery objectives are agreed after assessment, not implied by this comparison.", items: comparison.items.map((item, i) => ({ ...item, ...(i === 0 ? { href: "/solutions/as400", name: "AS400 & IBM i Hosting" } : {}), sla: "Defined in agreement", rpo: "Workload-specific", rto: "Workload-specific" })) });

const nav = snapshot.navigation_items;
const as400Nav = nav.find((n) => n.location === "navbar_mega" && n.href === "/solutions/as400");
const as400Fields = { label: services.as400.title, href: "/solutions/as400", location: "navbar_mega", parent_id: nav.find((n) => n.href === "/solutions" && n.location === "navbar")?.id, mega_column_title: "Managed Services", mega_column_icon: "Server", sort_order: -10, is_visible: true };
if (as400Nav) update("navigation_items", as400Nav, as400Fields);
else changes.push({ table: "navigation_items", insert: as400Fields });
for (const row of nav.filter((n) => n.href === "/solutions/ibm-power-vs")) update("navigation_items", row, { label: services["ibm-power-vs"].title });

const directory = `.vercel/audit-${new Date().toISOString().replace(/[:.]/g, "-")}`;
mkdirSync(directory, { recursive: true });
writeFileSync(`${directory}/before.json`, JSON.stringify(snapshot, null, 2));
writeFileSync(`${directory}/plan.json`, JSON.stringify(changes, null, 2));
console.log(`${apply ? "Publishing" : "DRY RUN"}: ${Object.keys(services).length} services, ${changes.length} targeted changes. Backup: ${directory}`);
if (apply) {
  for (const change of changes) {
    let result;
    if (change.insert) result = await client.from(change.table).insert(change.insert).select("id");
    else {
      let query = client.from(change.table).update(change.patch).eq("id", change.id);
      if (change.before.updated_at) query = query.eq("updated_at", change.before.updated_at);
      result = await query.select("id");
    }
    if (result.error || result.data?.length !== 1) throw new Error(`Stopped at ${change.table}/${change.id}: ${result.error?.message ?? "Record changed concurrently; inspect backup before retrying"}`);
  }
  console.log("CMS content published. Existing page caches may take up to five minutes to refresh.");
}
