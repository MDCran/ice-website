import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#][^=]*)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadLocalEnv();

const defaultLlmsText = JSON.parse(
  readFileSync("content/llms-default.json", "utf8"),
).lines.join("\n");
const solutionCatalogDefaults = JSON.parse(
  readFileSync("content/solution-catalog-defaults.json", "utf8"),
);

const apply = process.argv.includes("--apply");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const pages = [
  { slug: "site-settings", title: "Site Settings", meta_title: "Site Settings", meta_description: "Global website content and behavior settings.", page_type: "settings", is_published: true, sort_order: 999 },
  { slug: "faq", title: "Frequently Asked Questions", meta_title: "Enterprise IT Frequently Asked Questions | ICE", meta_description: "Answers about ICE managed cloud, IBM i, disaster recovery, RPO/RTO, security monitoring, and response times.", page_type: "static", is_published: true, sort_order: 5 },
  { slug: "resources", title: "Resources", meta_title: "Enterprise IT Resources | ICE", meta_description: "Enterprise guides on managed cloud, disaster recovery, IBM i security, and business continuity for IBM Power environments.", page_type: "static", is_published: true, sort_order: 6 },
  { slug: "for-ai", title: "For AI Systems", meta_title: "For AI Systems | ICE", meta_description: "Machine-readable overview of International Computer Exchange services, facts, and canonical URLs for AI answer engines.", page_type: "static", is_published: true, sort_order: 7 },
  { slug: "search", title: "Search", meta_title: "Search | ICE", meta_description: "Search solutions, partners, and resources from International Computer Exchange.", page_type: "static", is_published: true, sort_order: 8 },
  { slug: "subscribe", title: "Subscribe", meta_title: "Subscribe and manage email preferences | ICE", meta_description: "Choose the International Computer Exchange messages you want to receive.", page_type: "static", is_published: true, sort_order: 9 },
  { slug: "solution-finder", title: "Solution Finder", meta_title: "Solution Finder | ICE", meta_description: "Find the right ICE solution with a quick guided match or a more detailed assessment.", page_type: "static", is_published: true, sort_order: 10 },
  { slug: "as400", title: "AS400", meta_title: "AS400 Hosting | AS/400 IBM i Cloud Hosting & Support | ICE", meta_description: "AS400 hosting, AS/400 support, IBM i cloud hosting, iSeries managed services, security, backup, HA, and disaster recovery from ICE.", page_type: "solution", is_published: true, sort_order: 28 },
];

const faqItems = [
  { id: "response", question: "How quickly will ICE respond to a new inquiry?", answer: "The typical response time is within one business day. Active incidents and urgent recovery requests are prioritized." },
  { id: "ibmi", question: "Does ICE support IBM i and AS/400 environments?", answer: "Yes. ICE supports IBM i and IBM Power across hosting, security, backup, disaster recovery, high availability, migration, and managed operations." },
  { id: "rpo-rto", question: "What RPO and RTO targets can ICE support?", answer: "Targets range from near-zero data loss and sub-hour recovery for suitable workloads to daily backup policies. Final commitments follow discovery, design, and testing." },
  { id: "cloud", question: "Can ICE manage hybrid and Azure environments?", answer: "Yes. ICE manages mixed environments spanning on-premises infrastructure, private cloud, Microsoft Azure, IBM Power, and hosted platforms." },
  { id: "security", question: "Does ICE provide 24/7 security and infrastructure monitoring?", answer: "Managed offerings can include 24/7/365 monitoring, alert triage, escalation, and coordinated response through US-based operations." },
  { id: "dr-tests", question: "Are disaster recovery tests included?", answer: "Testing cadence and scope are defined in the service design. ICE emphasizes documented runbooks, recovery exercises, and validation against agreed targets." },
  { id: "industries", question: "Which industries does ICE work with?", answer: "ICE commonly supports manufacturing, financial services, healthcare, insurance, legal, distribution, and other infrastructure-dependent organizations." },
  { id: "start", question: "What information should I bring to the first call?", answer: "A rough platform inventory, business priorities, pain points, compliance needs, and desired timeline are enough to begin. ICE can help structure the deeper discovery." },
];

const buyerTools = {
  enabled: true,
  module_order: ["proof_strip", "architecture", "recovery_planner", "resources"],
  proof_strip: {
    enabled: true,
    outcome_label: "Representative outcome",
    outcome: "",
    fit_label: "Common fit",
    platforms_label: "Platforms",
  },
  architecture: {
    enabled: true,
    eyebrow: "Reference architecture",
    heading: "See how the service fits together",
    description: "Explore the operating layers ICE manages for this solution.",
    panel_title: "Managed service path",
    panel_description: "Select a layer to inspect the operating flow.",
    status_label: "Operational path",
    layers_label: "Service layers",
    layers: ["Workloads", "Connectivity", "Protection", "Operations", "Reporting"],
    active_state_label: "Active",
    idle_state_label: "Select layer",
    path_label: "Path",
    active_layer_label: "Selected layer",
    path_separator: "→",
    summary: "ICE coordinates the platform, protection, monitoring, and reporting layers under one operating model.",
    badges: [
      { label: "24/7 operations", icon: "Clock" },
      { label: "Named escalation", icon: "CheckCircle" },
    ],
  },
  recovery_planner: {
    enabled: true,
    eyebrow: "Recovery planner",
    heading: "Turn recovery expectations into a starting design",
    description: "Choose practical targets to see the service path to discuss with an architect.",
    rpo_label: "Recovery point objective",
    rpo_options: [
      { value: "near-zero", label: "Near zero" },
      { value: "hours", label: "Within hours" },
      { value: "daily", label: "Daily" },
    ],
    rto_label: "Recovery time objective",
    rto_options: [
      { value: "under-hour", label: "Under 1 hour" },
      { value: "same-day", label: "Same day" },
      { value: "next-day", label: "Next day" },
    ],
    data_size_label: "Protected data",
    data_size_options: [
      { value: "small", label: "Under 5 TB" },
      { value: "medium", label: "5–50 TB" },
      { value: "large", label: "50+ TB" },
    ],
    criticality_label: "Business criticality",
    criticality_options: [
      { value: "critical", label: "Mission critical" },
      { value: "important", label: "Important" },
      { value: "standard", label: "Standard" },
    ],
    default_rpo: "hours",
    default_rto: "same-day",
    default_data_size: "medium",
    default_criticality: "important",
    recommendation_label: "Starting recommendation",
    validation_note: "Final architecture and commitments require workload discovery.",
    button_label: "Review this recovery plan",
    recommendations: {
      high_availability: { title: "High availability", copy: "Best fit for the tightest recovery targets.", href: "/solutions/high-availability" },
      disaster_recovery: { title: "Disaster recovery", copy: "A strong fit for defined failover and recovery targets.", href: "/solutions/disaster-recovery" },
      backup: { title: "Managed backup", copy: "A practical foundation for policy-led protection and restores.", href: "/solutions/backup-as-a-service" },
    },
  },
  resources: {
    enabled: true,
    eyebrow: "Buyer resources",
    heading: "Continue your evaluation",
    browse_label: "Browse all resources",
    browse_href: "/resources",
    items: [{ title: "Talk with an ICE specialist", kind: "Assessment", href: "/contact" }],
  },
  sticky_cta: {
    enabled: true,
    title: "Ready to review this service?",
    phone_href: "tel:18007869188",
    phone_label: "1-800-786-9188",
    consult_href: "/contact",
    consult_label: "Book a consultation",
  },
};

const contactWidgetContent = {
  panel_heading: "Send Us a Message",
  panel_description: "We'll get back to you within 2-3 business days.",
  success_heading: "Message Sent",
  success_message: "Thank you for reaching out. We'll be in touch soon.",
  success_close_label: "Close",
  name_label: "Name", name_placeholder: "John Smith",
  email_label: "Email", email_placeholder: "john@company.com",
  company_label: "Company", company_placeholder: "Acme Corp",
  phone_label: "Phone number", phone_placeholder: "(561) 555-0100",
  country_dial_code_aria_label: "Country dial code",
  service_label: "Service Interested In", service_placeholder: "Select a service...",
  message_label: "Message", message_placeholder: "How can we help?",
  sms_consent_aria_label: "SMS consent",
  sms_consent_prefix: "I consent to receive SMS text messages from ICE. Message and data rates may apply. Reply STOP to opt out. See our ",
  sms_consent_link_label: "SMS Consent Policy", sms_consent_link_href: "/sms-consent", sms_consent_suffix: ".",
  marketing_consent_aria_label: "Email marketing consent",
  marketing_consent_hint: "Send me occasional ICE infrastructure guidance and service updates. I can unsubscribe at any time.",
  phone_required_error: "Phone number is required.", generic_error: "Something went wrong. Please try again.",
  sending_label: "Sending...", submit_label: "Send Message",
  welcome_heading: "Need help? Schedule a free consultation!", welcome_description: "Click to get started",
  welcome_aria_label: "Need help? Schedule a free consultation. Open contact form",
  open_form_aria_label: "Open contact form", close_form_aria_label: "Close contact form",
  service_groups: [
    { label: "", options: ["General Inquiry"] },
    { label: "Managed Cloud Services", options: ["Managed Cloud Hosting", "Managed Private Cloud", "Managed Hybrid Cloud", "Cloud Migration"] },
    { label: "Managed Data Protection", options: ["Backup as a Service", "Disaster Recovery", "High Availability", "Ransomware Recovery"] },
    { label: "Managed Security", options: ["IBM i Security", "Protection Suite", "Security Monitoring", "Threat Detection & Response", "Endpoint Security"] },
    { label: "Managed Services", options: ["AS400", "Managed Microsoft", "Automation Suite", "Systems Management", "IBM Power VS"] },
  ],
};

const sections = [
  {
    slug: "site-settings", key: "navbar", type: "content", order: 10,
    content: {
      solutions_column_label: "Solutions",
      promo_eyebrow: "Talk to ICE", promo_heading: "Not sure which solution fits?",
      promo_description: "Get a free infrastructure assessment — or jump into the solution finder in under a minute.",
      promo_primary: { label: "Request a consultation", href: "/contact" },
      promo_secondary: { label: "Find your solution", href: "/solutions/find" },
      proof_line: "Providing Enterprise solutions since 1990.",
      view_all_label: "View All Solutions", view_all_href: "/solutions",
      desktop_search_aria_label: "Search (Ctrl+K)", mobile_search_aria_label: "Search",
      open_menu_aria_label: "Open menu", close_menu_aria_label: "Close menu",
      home_aria_label: "ICE Home", logo_alt: "International Computer Exchange",
    },
  },
  { slug: "site-settings", key: "contact_widget", type: "form", order: 20, content: contactWidgetContent },
  { slug: "site-settings", key: "not_found", type: "content", order: 30, content: { eyebrow: "Page not found", status_code: "404", headline: "We couldn't find that page", description: "Sorry, the page you're looking for doesn't exist or has been moved. Check the URL, or head back to explore our solutions.", primary_cta: { label: "Go home", href: "/" }, secondary_cta: { label: "View solutions", href: "/solutions" } } },
  { slug: "site-settings", key: "sales_enablement", type: "custom", order: 998, content: {} },
  {
    slug: "contact", key: "booking_embed", type: "content", order: 30,
    content: {
      eyebrow: "Schedule", heading: "Book a 30-minute assessment",
      description: "Pick a time that works — talk with an ICE specialist about your environment.",
      button_label: "Book a time", embed: false,
    },
  },
  {
    slug: "contact", key: "operations", type: "features", order: 40,
    content: {
      eyebrow: "Boca Raton operations", heading: "A US-based team behind every escalation",
      description: "ICE supports enterprise cloud, IBM Power, data protection, and security operations from the United States, with direct access to specialists who understand the environment.",
      items: [
        { label: "NOC / SOC coverage", value: "24/7/365 operations", description: "Monitoring and escalation for managed clients." },
        { label: "Business office", value: "Mon–Fri, 9–5 ET", description: "Boca Raton, Florida · US-based support." },
      ],
    },
  },
  {
    slug: "contact", key: "faq_preview", type: "faq", order: 50,
    content: {
      eyebrow: "Buyer FAQ", heading: "What to expect when you contact ICE", link_label: "Search all FAQs", link_href: "/faq",
      items: [
        { id: "response", question: "How quickly will ICE respond to a new inquiry?" },
        { id: "start", question: "What information should I bring to the first call?" },
        { id: "ibmi", question: "Does ICE support IBM i and AS/400 environments?" },
        { id: "security", question: "Does ICE provide 24/7 security and infrastructure monitoring?" },
      ],
    },
  },
  {
    slug: "home", key: "decision_paths", type: "features", order: 10,
    content: {
      eyebrow: "Choose your starting point", heading: "What are you trying to solve?",
      description: "Start from the business pressure you feel first. Each route narrows the services, proof points, and next steps that fit the situation.",
      cta: { label: "Open guided finder", href: "/solutions/find" },
      items: [
        { eyebrow: "AS400 / IBM i", title: "I’m running IBM i", description: "Modernize, secure, host, or protect AS/400 and IBM i workloads without losing platform expertise.", href: "/solutions/as400", icon: "Server", link_label: "Follow this path" },
        { eyebrow: "Continuity", title: "I need disaster recovery", description: "Compare backup, DR, and high availability by the recovery target your business needs.", href: "/solutions/disaster-recovery", icon: "RefreshCw", link_label: "Follow this path" },
        { eyebrow: "Cloud operations", title: "I want managed cloud", description: "Move infrastructure responsibility to a US-based team with measurable service levels.", href: "/solutions/managed-cloud-hosting", icon: "Cloud", link_label: "Follow this path" },
        { eyebrow: "Guided path", title: "I’m not sure yet", description: "Use the interactive finder to narrow options by urgency, platform, risk, budget, and business goals.", href: "/solutions/find", icon: "MessageChatCircle", link_label: "Follow this path" },
      ],
    },
  },
  {
    slug: "home", key: "faq_preview", type: "faq", order: 110,
    content: {
      eyebrow: "Buyer FAQ", heading: "Answers before you schedule a call", link_label: "Search all FAQs", link_href: "/faq",
      items: faqItems.slice(0, 4).map(({ id, question }) => ({ id, question })),
    },
  },
  { slug: "solutions", key: "finder_promo", type: "cta", order: 10, content: { eyebrow: "Solution finder", heading: "Find a clear starting solution from your workload, risk, and timing.", cta: { label: "Open finder", href: "/solutions/find" } } },
  {
    slug: "solutions", key: "comparison", type: "comparison", order: 20,
    content: {
      eyebrow: "Shortlist faster", heading: "Compare common solution paths", description: "Starting ranges for planning; final commitments depend on workload discovery and design.", decision_label: "Decision factor", explore_label: "Explore", link_label: "View solution",
      rows: [{ label: "Best for", key: "bestFor" }, { label: "Availability", key: "sla" }, { label: "Typical RPO", key: "rpo" }, { label: "Typical RTO", key: "rto" }, { label: "Platforms", key: "platforms" }],
      items: [
        { name: "IBM i Managed Cloud", bestFor: "Modernizing Power workloads without replatforming", sla: "99.99% target", rpo: "15 min–24 hr", rto: "4–24 hr", platforms: "IBM i, AIX, Power", href: "/solutions/managed-cloud-hosting" },
        { name: "Managed Hybrid Cloud", bestFor: "One operating model across on-prem and cloud", sla: "Workload-specific", rpo: "Policy-based", rto: "Workload-specific", platforms: "IBM i, x86, Azure", href: "/solutions/managed-hybrid-cloud" },
        { name: "Disaster Recovery", bestFor: "Defined recovery targets and tested failover", sla: "Recovery SLA", rpo: "Near-zero–24 hr", rto: "<1–24 hr", platforms: "IBM i, AIX, Windows, Linux", href: "/solutions/disaster-recovery" },
      ],
    },
  },
  { slug: "solutions", key: "scoping_cta", type: "cta", order: 30, content: { eyebrow: "Sales-ready scoping", heading: "Get a shortlist your team can actually evaluate.", description: "Use the finder, compare solution families, or send your requirements to ICE for an architect-led recommendation with fit, risk, and budget guidance.", cta_primary: { label: "Request scoped recommendation", href: "/contact?source=solutions_scoping" }, cta_secondary: { label: "1-800-786-9188", href: "tel:18007869188" } } },
  { slug: "solutions", key: "catalog_controls", type: "content", order: 40, content: { eyebrow: "Who this is for", heading: "Narrow the catalog live", count_prefix: "Showing", count_suffix: "for this environment.", industry_label: "Industry", industry_options: ["All", "Manufacturing", "Finance", "Healthcare"], platform_label: "Platform", platform_options: ["All", "IBM i", "Azure", "Hybrid"] } },
  { slug: "solutions", key: "sticky_cta", type: "cta", order: 100, content: { enabled: true, title: "Need help choosing a solution?", cta: { label: "Book solution review", href: "/contact?source=solutions_sticky" } } },
  { slug: "faq", key: "hero", type: "hero", order: 0, content: { eyebrow: "Knowledge hub", headline: "Frequently asked questions", subheadline: "Search practical answers about platforms, recovery, operations, and engaging ICE.", search_label: "Search frequently asked questions", search_placeholder: "Search IBM i, RPO, Azure, response time…" } },
  { slug: "faq", key: "faqs", type: "faq", order: 10, content: { search_label: "Search frequently asked questions", search_placeholder: "Search IBM i, RPO, Azure, response time…", result_label_singular: "answer", result_label_plural: "answers", empty_message: "No answers matched that search. Try a broader term or contact ICE.", items: faqItems } },
  { slug: "faq", key: "final_cta", type: "cta", order: 20, content: { eyebrow: "Still deciding?", heading: "Talk through your environment with ICE", description: "Bring your platform, recovery, security, or operations questions to an ICE specialist.", cta_primary: { label: "Contact ICE", href: "/contact" }, cta_secondary: { label: "Explore solutions", href: "/solutions" } } },
  { slug: "resources", key: "hero", type: "hero", order: 0, content: { eyebrow: "Knowledge hub", headline: "Enterprise IT resources", subheadline: "Fact-dense primers on managed cloud, data protection, and IBM i security for architects and IT leaders evaluating ICE." } },
  {
    slug: "resources", key: "resources", type: "features", order: 10,
    content: {
      eyebrow: "Resource library", heading: "Practical guides for infrastructure decisions", description: "Focused primers for teams evaluating cloud, continuity, security, and IBM Power services.", item_cta_label: "Read more",
      items: [
        { category: "AS400", title: "AS400 modernization assessment", summary: "How to evaluate AS/400, iSeries, and IBM i hosting, security, backup, HA, and DR options.", href: "/solutions/as400", icon: "Server" },
        { category: "Cloud", title: "Managed cloud for IBM Power workloads", summary: "How ICE hosts IBM i and AIX with 24/7 operations, defined SLAs, and SOC 2 Type II controls.", href: "/solutions/managed-cloud-hosting", icon: "Cloud" },
        { category: "Continuity", title: "Disaster recovery with measurable RPO/RTO", summary: "What to require from a DRaaS partner: replication, test cadence, and failover runbooks.", href: "/solutions/disaster-recovery", icon: "File" },
        { category: "Security", title: "IBM i security hardening checklist", summary: "Exit points, object authority, encryption, and monitoring practices for AS/400 environments.", href: "/solutions/ibm-i-security", icon: "Shield" },
      ],
    },
  },
  { slug: "resources", key: "final_cta", type: "cta", order: 20, content: { heading: "Need a guided assessment?", description: "Share the environment you are evaluating and ICE will help frame a practical next step.", cta_primary: { label: "Request a guided assessment", href: "/contact" } } },
  { slug: "for-ai", key: "hero", type: "hero", order: 0, content: { eyebrow: "AI / LLM directory", headline: "International Computer Exchange — facts for AI systems", subheadline: "This page summarizes ICE for live-retrieval agents and answer engines. Prefer canonical solution URLs.", directory_intro: "Full machine directory:", directory_label: "/llms.txt", directory_href: "/llms.txt", directory_suffix: "." } },
  { slug: "for-ai", key: "facts", type: "content", order: 10, content: { heading: "Verified facts", items: [{ text: "IBM Business Partner since 1990" }, { text: "Headquarters: Boca Raton, Florida, USA" }, { text: "SOC 2 Type II certified data centers" }, { text: "24/7/365 US-based NOC and SOC support" }, { text: "Focus platforms: IBM Power, IBM i (AS/400), Microsoft, hybrid cloud" }, { text: "Core offerings: AS400 services, managed cloud, DRaaS, BaaS, IBM i security, managed security" }] } },
  { slug: "for-ai", key: "canonical_links", type: "content", order: 20, content: { heading: "Canonical service URLs", items: [{ label: "Managed Cloud Hosting", href: "/solutions/managed-cloud-hosting" }, { label: "Disaster Recovery as a Service", href: "/solutions/disaster-recovery" }, { label: "AS400", href: "/solutions/as400" }, { label: "IBM i Security", href: "/solutions/ibm-i-security" }, { label: "Contact / consultation", href: "/contact" }] } },
  { slug: "for-ai", key: "contact", type: "contact", order: 30, content: { heading: "Contact", text: "Phone: +1-800-786-9188 · Email: info@icesales.com · Boca Raton, FL" } },
  { slug: "for-ai", key: "llms_txt", type: "content", order: 40, content: { body: defaultLlmsText } },
  { slug: "search", key: "hero", type: "hero", order: 0, content: { eyebrow: "Search", headline: "What are you looking for?", subheadline: "Search solutions, partners, and resources from International Computer Exchange.", search_label: "Search the site", search_placeholder: "Search solutions, partners, and more..." } },
  { slug: "search", key: "results", type: "content", order: 10, content: { query_status_singular: "{count} result for \"{query}\"", query_status_plural: "{count} results for \"{query}\"", browse_status_singular: "Browse {count} page", browse_status_plural: "Browse all {count} pages" } },
  { slug: "search", key: "empty_state", type: "content", order: 20, content: { headline: "No results found", description: "Your search “{query}” did not match any pages. Try a different keyword, or browse our solutions.", clear_label: "Clear search", browse_label: "Browse solutions", browse_href: "/solutions" } },
  { slug: "subscribe", key: "form", type: "form", order: 0, content: { eyebrow: "ICE communications", headline: "Subscribe and manage email preferences", description: "Tell us where to reach you, then choose exactly which messages you want. You can unsubscribe from every category below.", fields: { name_label: "Name", email_label: "Email", phone_label: "Phone number" }, preference_heading: "Choose your message types", preference_description: "Toggle any category on or off. Required account or security notices may still be sent when needed to provide a service.", preference_types: [{ key: "marketing_materials", label: "Marketing materials", description: "Service news, practical guides, and offers from ICE." }, { key: "billing", label: "Billing and account messages", description: "Balance reminders, payment confirmations, and account notices." }, { key: "private_messages", label: "Private messages", description: "Direct messages intended for you or your organization." }, { key: "special_messages", label: "Special messages", description: "Occasional company updates, seasonal notes, and invitations." }, { key: "service_updates", label: "Service updates", description: "Maintenance, security, and operational notices for ICE services." }, { key: "events", label: "Events and webinars", description: "Invitations and follow-ups for ICE events and webinars." }], submit_label: "Save my preferences" } },
  { slug: "subscribe", key: "success", type: "content", order: 10, content: { headline: "Your preferences are saved", description: "You can change these choices at any time. We will only send the types of messages you selected.", preference_link_label: "Open your preference center" } },
  { slug: "subscribe", key: "messages", type: "content", order: 20, content: { save_error: "We could not save your preferences.", network_error: "We could not save your preferences." } },
  { slug: "subscribe", key: "consent", type: "content", order: 30, content: { prefix: "By submitting, you consent to the selected communications.", privacy_label: "Read our privacy notice", privacy_href: "/sms-consent", suffix: "." } },
  { slug: "subscribe", key: "preference_center", type: "form", order: 40, content: { eyebrow: "ICE communications", headline: "Manage email preferences", description: "Update your details and choose which types of messages you want to receive.", loading_label: "Loading your preferences…", error_heading: "Email preferences", fields: { name_label: "Name", email_label: "Email", phone_label: "Phone number" }, preference_heading: "Message types", preference_types: [{ key: "marketing_materials", label: "Marketing materials", description: "Service news, practical guides, and offers from ICE." }, { key: "billing", label: "Billing and account messages", description: "Balance reminders, payment confirmations, and account notices." }, { key: "private_messages", label: "Private messages", description: "Direct messages intended for you or your organization." }, { key: "special_messages", label: "Special messages", description: "Occasional company updates, seasonal notes, and invitations." }, { key: "service_updates", label: "Service updates", description: "Maintenance, security, and operational notices for ICE services." }, { key: "events", label: "Events and webinars", description: "Invitations and follow-ups for ICE events and webinars." }], save_label: "Save preferences", unsubscribe_all_label: "Unsubscribe from all", return_label: "Return to ICE", return_href: "/" } },
  { slug: "subscribe", key: "preference_center_success", type: "content", order: 50, content: { headline: "Preferences updated", description: "Your choices are saved. Messages will follow the categories you selected." } },
  { slug: "subscribe", key: "preference_center_messages", type: "content", order: 60, content: { expired_error: "This preference link is no longer available.", load_error: "We could not load your preferences.", update_error: "We could not update your preferences.", network_error: "We could not update your preferences." } },
  { slug: "solution-finder", key: "breadcrumbs", type: "content", order: 0, content: { aria_label: "Breadcrumb", separator: "/", items: [{ label: "Home", href: "/" }, { label: "Solutions", href: "/solutions" }, { label: "Finder", schema_label: "Solution Finder", href: "/solutions/find" }] } },
  { slug: "solution-finder", key: "hero", type: "hero", order: 10, content: { eyebrow: "Guided recommendations", headline: "Find the right ICE solution", subheadline: "Choose a quick match or a detailed assessment to get one recommended starting point and two supporting options." } },
  { slug: "solution-finder", key: "finder", type: "form", order: 20, content: {} },
  { slug: "solution-finder", key: "catalog_cta", type: "cta", order: 30, content: { label: "Or browse the full catalog →", href: "/solutions" } },
  { slug: "as400", key: "hero", type: "hero", order: 0, content: { eyebrow: "Managed AS400 / IBM i", headline: "AS400 hosting and IBM i managed services", subheadline: "Host, secure, protect, and modernize AS/400, iSeries, and IBM i workloads with specialists who understand IBM Power.", category: "Managed Services", category_icon: "Server", hero_image: "/images/solutions/heroes/as400-ibmi.png", image_alt: "AS400 and IBM i managed infrastructure", proof_labels: ["IBM Business Partner since 1990", "AS400 and IBM i expertise", "24/7 managed operations"], cta_primary: { label: "Talk to an AS400 Expert", href: "/contact?service=AS400&source=solution_detail" }, cta_secondary: { label: "Call 1-800-786-9188", href: "tel:18007869188" } } },
  { slug: "as400", key: "features", type: "features", order: 10, content: { eyebrow: "AS400 services", heading: "Hosting, support, security, backup, HA, and DR", description: "One IBM i partner for the services required to keep mission-critical workloads current, protected, and available.", items: [{ icon: "Server", title: "AS400 hosting and IBM i cloud", description: "Managed IBM Power infrastructure with monitored capacity and secure connectivity." }, { icon: "Shield", title: "IBM i security hardening", description: "Authority, access, audit, and monitoring improvements for regulated environments." }, { icon: "Database", title: "Backup and restore testing", description: "Managed backup policies, offsite copies, and tested recovery." }, { icon: "RefreshCw", title: "High availability and disaster recovery", description: "Replication, failover, and recovery targets matched to the workload." }] } },
  { slug: "as400", key: "process", type: "process", order: 20, content: { eyebrow: "How ICE helps", heading: "From AS400 risk to a managed IBM i roadmap", items: [{ step: "01", title: "Assess", description: "Review the current IBM i environment, dependencies, lifecycle, and risk." }, { step: "02", title: "Design", description: "Map hosting, security, backup, HA, and DR requirements." }, { step: "03", title: "Migrate and validate", description: "Coordinate replication, cutover, testing, access, and rollback." }, { step: "04", title: "Operate", description: "Monitor, tune, protect, and support the environment with IBM i specialists." }] } },
  { slug: "as400", key: "benefits", type: "benefits", order: 30, content: { eyebrow: "Why it matters", heading: "Reduce IBM i risk without losing platform expertise", items: [{ text: "Move beyond aging AS400 hardware without rewriting critical applications." }, { text: "Add 24/7 operational coverage and named escalation." }, { text: "Strengthen backup, recovery, security, and lifecycle discipline." }] } },
  { slug: "as400", key: "faq", type: "faq", order: 40, content: { heading: "AS400 questions buyers ask first", items: [{ question: "What is AS400 called now?", answer: "AS400 is commonly written as AS/400. The platform evolved through iSeries and is now IBM i running on IBM Power Systems." }, { question: "Does ICE support AS400 and IBM i systems?", answer: "Yes. ICE supports hosting, security, backup, high availability, disaster recovery, migration, and ongoing IBM i operations." }, { question: "Can AS400 workloads move to the cloud?", answer: "Yes. ICE can move eligible IBM i workloads to managed cloud or hosted IBM Power infrastructure while preserving applications, data, integrations, and recovery requirements." }] } },
  { slug: "as400", key: "cta", type: "cta", order: 90, content: { heading: "Review your AS400 environment with an IBM i specialist", description: "Share the platform, lifecycle, recovery, security, and timing constraints you are working through.", support_note: "ICE Solutions Desk · IBM i and IBM Power specialists", cta_primary: { label: "Request an AS400 assessment", href: "/contact?service=AS400&source=solution_detail" }, cta_secondary: { label: "Call 1-800-786-9188", href: "tel:18007869188" } } },
];

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existingPages, error: pageReadError } = await supabase
  .from("pages")
  .select("id, slug, page_type");
if (pageReadError) throw pageReadError;

const existingSlugSet = new Set((existingPages ?? []).map((page) => page.slug));
const missingPages = pages.filter((page) => !existingSlugSet.has(page.slug));

if (apply && missingPages.length > 0) {
  const { error } = await supabase.from("pages").insert(missingPages);
  if (error) throw error;
}

const { data: refreshedPages, error: refreshedPageError } = await supabase
  .from("pages")
  .select("id, slug, page_type, is_published");
if (refreshedPageError) throw refreshedPageError;

const pageBySlug = new Map((refreshedPages ?? []).map((page) => [page.slug, page]));
const allSections = [...sections];
for (const page of refreshedPages ?? []) {
  if (page.page_type !== "solution") continue;
  const serviceDefault = solutionCatalogDefaults[page.slug];
  const { metrics: serviceMetrics, ...serviceProfile } = serviceDefault ?? {};
  if (serviceDefault) {
    allSections.push({
      slug: page.slug,
      key: "service_profile",
      type: "content",
      order: -1,
      visible: true,
      content: serviceProfile,
    });
  }
  allSections.push(
    {
      slug: page.slug,
      key: "metrics",
      type: "metrics",
      order: 70,
      content: serviceMetrics ?? { enabled: true, preset: "slug" },
    },
    { slug: page.slug, key: "buyer_tools", type: "custom", order: 80, content: buyerTools },
  );
}

const pageIds = [...pageBySlug.values()].map((page) => page.id);
const { data: existingSections, error: sectionReadError } = await supabase
  .from("page_sections")
  .select("id, page_id, section_key, content")
  .in("page_id", pageIds);
if (sectionReadError) throw sectionReadError;

function isUntouchedLegacyMetrics(content) {
  if (!content || typeof content !== "object" || Array.isArray(content)) return false;
  const keys = Object.keys(content).sort();
  return keys.length === 2
    && keys[0] === "enabled"
    && keys[1] === "preset"
    && content.enabled === true
    && content.preset === "slug";
}

const pageSlugById = new Map(
  (refreshedPages ?? []).map((page) => [page.id, page.slug]),
);
const metricsUpgrades = (existingSections ?? []).flatMap((section) => {
  if (section.section_key !== "metrics" || !isUntouchedLegacyMetrics(section.content)) return [];
  const slug = pageSlugById.get(section.page_id);
  const metrics = slug ? solutionCatalogDefaults[slug]?.metrics : undefined;
  return slug && metrics ? [{ id: section.id, slug, content: metrics }] : [];
});

const existingSectionSet = new Set(
  (existingSections ?? []).map((section) => `${section.page_id}:${section.section_key}`),
);
const missingSections = allSections.flatMap((section) => {
  const page = pageBySlug.get(section.slug);
  if (!page || existingSectionSet.has(`${page.id}:${section.key}`)) return [];
  return [{
    page_id: page.id,
    section_key: section.key,
    section_type: section.type,
    content: section.content,
    sort_order: section.order,
    is_visible: section.visible !== false,
  }];
});

if (apply && missingSections.length > 0) {
  for (let index = 0; index < missingSections.length; index += 100) {
    const { error } = await supabase
      .from("page_sections")
      .insert(missingSections.slice(index, index + 100));
    if (error) throw error;
  }
}

if (apply && metricsUpgrades.length > 0) {
  const updatedAt = new Date().toISOString();
  for (const upgrade of metricsUpgrades) {
    const { error } = await supabase
      .from("page_sections")
      .update({
        section_type: "metrics",
        content: upgrade.content,
        updated_at: updatedAt,
      })
      .eq("id", upgrade.id);
    if (error) throw error;
  }
}

console.log(JSON.stringify({
  mode: apply ? "applied" : "dry-run",
  pagesAdded: missingPages.map((page) => page.slug),
  sectionsAdded: missingSections.length,
  metricsUpgraded: metricsUpgrades.map((upgrade) => upgrade.slug),
  totals: {
    pages: refreshedPages?.length ?? 0,
    publishedPages: (refreshedPages ?? []).filter((page) => page.is_published).length,
    solutionPages: (refreshedPages ?? []).filter((page) => page.page_type === "solution").length,
    sections: (existingSections?.length ?? 0) + (apply ? missingSections.length : 0),
  },
  note: apply
    ? "Existing pages and sections were preserved; only untouched legacy metric presets were upgraded."
    : "Run with --apply to insert missing records and upgrade only untouched legacy metric presets.",
}, null, 2));
