"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  AlertCircle,
  ChevronDown,
  File02,
  Image01,
  LayersTwo01,
  LinkExternal01,
  Monitor01,
  Pencil01,
  Plus,
  Save01,
  Trash01,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Badge, type BadgeColor } from "@/components/base/badges/badges";
import { Input, InputBase } from "@/components/base/input/input";
import { TextArea, TextAreaBase } from "@/components/base/textarea/textarea";
import { NativeSelect } from "@/components/base/select/select-native";
import { Toggle } from "@/components/base/toggle/toggle";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { cx } from "@/utils/cx";
import MediaBrowserModal from "@/components/admin/MediaBrowserModal";
import IllustrationPickerModal from "@/components/admin/IllustrationPickerModal";
import { IllustrationRenderer } from "@/components/illustrations/IllustrationRenderer";
import GenericCMSSections from "@/components/cms/GenericCMSSections";
import { getIllustration } from "@/lib/illustrations";
import { getIconNames } from "@/lib/iconMap";
import { presetsForPageType, type CompositionPreset } from "@/lib/cms/compositionPresets";
import { writeAuditLog } from "@/lib/auditLog";
import SectionCanvasBuilder from "@/components/admin/SectionCanvasBuilder";
import { publicPathForCmsPage, SYSTEM_CMS_SLUGS } from "@/lib/cms/pageRegistry";
import { getDefaultSolutionFinderContent } from "@/components/marketing/SolutionFinder";
import { getDefaultConsultWizardContent } from "@/components/marketing/ConsultWizard";
import { getDefaultContactWidgetContent } from "@/components/ui/ContactWidget";
import llmsDefault from "../../../../../../content/llms-default.json";

const PAGE_SEO_KEY = "page_seo";
type JsonObject = Record<string, unknown>;

function isJsonObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateJsonShape(value: unknown, schema: unknown, path = "content"): string | null {
  if (schema === null || schema === undefined) return null;
  if (Array.isArray(schema)) {
    if (!Array.isArray(value)) return `${path} must be an array.`;
    if (schema.length === 0) return null;
    for (let index = 0; index < value.length; index += 1) {
      const issue = validateJsonShape(value[index], schema[0], `${path}[${index}]`);
      if (issue) return issue;
    }
    return null;
  }
  if (isJsonObject(schema)) {
    if (!isJsonObject(value)) return `${path} must be an object.`;
    for (const [key, childSchema] of Object.entries(schema)) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
      const issue = validateJsonShape(value[key], childSchema, `${path}.${key}`);
      if (issue) return issue;
    }
    return null;
  }
  if (typeof value !== typeof schema) {
    return `${path} must be ${typeof schema}, not ${Array.isArray(value) ? "array" : typeof value}.`;
  }
  return null;
}

function validateSectionContent(value: unknown, schema?: JsonObject): string | null {
  if (!isJsonObject(value)) return "Section content must be a JSON object.";
  return schema ? validateJsonShape(value, schema) : null;
}

function toLocalDateTimeInput(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

/* ═══════════════════════════════════════════════════════════════════════ */

interface PageMeta {
  id: string;
  title: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  page_type: string;
  is_published: boolean;
  updated_at?: string | null;
  publish_status?: string | null;
  scheduled_publish_at?: string | null;
  published_at?: string | null;
  og_image_url?: string | null;
  twitter_image_url?: string | null;
  canonical_url?: string | null;
  favicon_url?: string | null;
  sort_order: number;
}

interface Section {
  id: string;
  section_key: string;
  section_type: string;
  content: JsonObject;
  sort_order: number;
  is_visible: boolean;
  _isNew?: boolean;
  _deleted?: boolean;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface SectionTemplate {
  id: string;
  label: string;
  description: string;
  key: string;
  type: string;
  content: JsonObject;
  slugs?: string[];
  excludeSlugs?: string[];
  pageTypes?: string[];
  excludePageTypes?: string[];
  required?: boolean;
}

const SECTION_TYPES = [
  { value: "hero", label: "Hero Banner" },
  { value: "content", label: "Content Block" },
  { value: "features", label: "Features Grid" },
  { value: "value_props", label: "Value Props" },
  { value: "roi", label: "ROI / Payoff" },
  { value: "banner", label: "Statement Banner" },
  { value: "process", label: "Process / Steps" },
  { value: "benefits", label: "Benefits List" },
  { value: "stats", label: "Statistics" },
  { value: "metrics", label: "Metrics / Gauges" },
  { value: "use_cases", label: "Use Cases Grid" },
  { value: "related", label: "Related Services" },
  { value: "cta", label: "Call to Action" },
  { value: "faq", label: "FAQ Accordion" },
  { value: "gallery", label: "Gallery / Logos" },
  { value: "timeline", label: "Timeline" },
  { value: "partners", label: "Partners Grid" },
  { value: "industries", label: "Industries" },
  { value: "contact", label: "Contact Info" },
  { value: "form", label: "Form / Options" },
  { value: "illustration", label: "Illustration / Graphic" },
  { value: "quote", label: "Quote / Testimonial" },
  { value: "split_media", label: "Split Media" },
  { value: "sla_table", label: "SLA / Spec Table" },
  { value: "comparison", label: "Comparison" },
  { value: "case_study", label: "Case Study / Outcome" },
  { value: "custom", label: "Custom" },
];

const TYPE_COLORS: Record<string, BadgeColor<"pill-color">> = {
  hero: "brand",
  content: "success",
  features: "purple",
  value_props: "brand",
  roi: "success",
  banner: "warning",
  process: "blue",
  benefits: "sky",
  stats: "blue",
  metrics: "blue",
  use_cases: "indigo",
  related: "success",
  cta: "warning",
  faq: "indigo",
  gallery: "orange",
  timeline: "purple",
  partners: "pink",
  industries: "pink",
  contact: "brand",
  form: "gray",
  illustration: "purple",
  quote: "indigo",
  split_media: "sky",
  sla_table: "blue",
  comparison: "warning",
  case_study: "success",
  custom: "gray",
};

const ICON_NAMES = getIconNames();

const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: "solution-service-profile",
    label: "Service Profile",
    description: "Controls this service's /solutions card, category, discovery tags, finder details, image, related-service matching, and structured data.",
    key: "service_profile",
    type: "content",
    pageTypes: ["solution"],
    required: true,
    content: {
      listed: true,
      category: "Managed Services",
      category_description: "Managed technology services backed by ICE specialists.",
      category_icon: "Server",
      icon: "Server",
      card_description: "A concise description shown on the solutions catalog and related-service cards.",
      card_image: "",
      card_image_alt: "",
      tags: ["managed service"],
      industries: ["Manufacturing", "Financial Services", "Healthcare"],
      platforms: ["Hybrid"],
      workloads: ["business-critical applications"],
      outcome: "Simplify operations with an accountable managed service.",
      link_label: "View service",
      finder: {
        enabled: true,
        proof: "Scoped to your environment and operating requirements.",
        outcomes: [],
        timeline: "Assessment-led",
        complexity: "Medium",
        role: "A managed service aligned to the selected priorities.",
        cta_label: "Review this service",
        next_step: "Schedule a discovery call with an ICE specialist.",
      },
      schema: {
        service_type: "Managed IT Service",
        aliases: [],
        offer_names: [],
      },
    },
  },
  {
    id: "hero",
    label: "Hero",
    description: "Top page headline, supporting copy, calls to action, and proof-label trust bar.",
    key: "hero",
    type: "hero",
    pageTypes: ["solution"],
    required: true,
    content: {
      category: "Managed Cloud Services",
      category_icon: "Cloud",
      eyebrow: "Managed Cloud Services",
      headline: "Managed Cloud Hosting",
      subheadline:
        "Enterprise cloud hosting with 24/7 management, monitoring, and support for mission-critical workloads.",
      cta_primary: { label: "Speak to an Expert", href: "/contact" },
      cta_secondary: { label: "Call 1-800-786-9188", href: "tel:18007869188" },
      proof_labels: ["35+ Years in Business", "SOC 2 Type II", "24/7/365 US-Based Support"],
      hero_image: "/images/solutions/heroes/managed-cloud-hosting.webp",
      image_alt: "Enterprise technology solution illustration",
      demo_video_url: "",
      demo_poster: "",
      demo_caption: "Product walkthrough (muted)",
      experiment_id: "",
      headline_b: "",
    },
  },
  {
    id: "solutions-overview-hero",
    label: "Solutions Overview Hero",
    description: "Catalog headline, proof cards, calls to action, and buyer next-step panel.",
    key: "hero",
    type: "hero",
    slugs: ["solutions"],
    required: true,
    content: {
      eyebrow: "Our Solutions",
      headline: "Enterprise Technology Solutions",
      subheadline:
        "From cloud infrastructure to cybersecurity, we deliver end-to-end solutions engineered for reliability, performance, and scale.",
      cta_primary: { label: "Talk to an architect", href: "/contact?service=Solution%20Architecture%20Review&source=solutions_index" },
      cta_secondary: { label: "Use guided finder", href: "/solutions/find" },
      buyer_signals: [
        { value: "35+", label: "years in enterprise IT", detail: "IBM Business Partner since 1990" },
        { value: "24/7", label: "operations coverage", detail: "NOC, SOC, escalation, and managed service ownership" },
        { value: "99.99%", label: "target uptime SLA", detail: "Validated per service scope and architecture" },
      ],
      next_steps: ["Current-state and risk review", "Recommended service path", "Budgetary scope and next actions"],
      buyer_panel: {
        eyebrow: "Buyer-ready next step",
        heading: "Turn requirements into a scoped service plan.",
        description: "ICE architects help qualify the best-fit solution, deployment path, risk profile, and budgetary next step.",
        cta_primary: { label: "Book review", href: "/contact?service=Solution%20Architecture%20Review&source=solutions_index" },
        cta_secondary: { label: "Call ICE", href: "tel:18007869188" },
      },
    },
  },
  {
    id: "contact-hero",
    label: "Contact Hero",
    description: "Contact-page eyebrow, headline, lead copy, and phone/SMS action labels.",
    key: "hero",
    type: "hero",
    slugs: ["contact"],
    required: true,
    content: {
      eyebrow: "Contact us",
      headline: "Contact Us",
      subheadline: "Talk with our enterprise architects about cloud, security, data protection, and managed services.",
      call_label: "Call 1-800-786-9188",
      text_label: "Text us",
    },
  },
  {
    id: "partners-hero",
    label: "Partners Hero",
    description: "Partners-page headline, lead copy, and calls to action.",
    key: "hero",
    type: "hero",
    slugs: ["partners"],
    required: true,
    content: {
      headline: "Technology Partners",
      subheadline: "We partner with the world's leading technology companies to deliver best-in-class enterprise solutions.",
      cta_primary: { label: "Get In Touch", href: "/contact" },
      cta_secondary: { label: "Explore Solutions", href: "/solutions" },
    },
  },
  {
    id: "why-ice-hero",
    label: "Why ICE Hero",
    description: "Why ICE headline, lead copy, and trust proof chips.",
    key: "hero",
    type: "hero",
    slugs: ["why-ice"],
    required: true,
    content: {
      headline: "Why ICE",
      subheadline: "Enterprise infrastructure expertise, accountable operations, and direct access to specialists who understand mission-critical environments.",
      proof_points: [
        "IBM Business Partner Since 1990",
        "SOC 2 Type II Data Centers",
        "Tier-3 Infrastructure",
        "24/7/365 U.S. Support",
      ],
    },
  },
  {
    id: "hero-generic",
    label: "Hero (generic)",
    description: "Top page headline for non-solution pages.",
    key: "hero",
    type: "hero",
    excludePageTypes: ["legal", "settings", "solution"],
    excludeSlugs: ["site-settings", "solutions", "contact", "partners", "why-ice", "for-ai", "search", "subscribe", "solution-finder"],
    required: true,
    content: {
      eyebrow: "Trusted IBM Business Partner for over 35 years",
      badge: "Trusted IBM Business Partner for over 35 years",
      headline: "You Know Your Business.",
      headline_highlight: "",
      subheadline:
        "Together, we create innovative solutions. We support IBM Power environments, cloud infrastructure, cybersecurity, data protection, and managed services.",
      cta_primary: { label: "Call 1-800-786-9188", href: "tel:18007869188" },
      cta_secondary: { label: "Explore Solutions", href: "/solutions" },
      proof_labels: [
        "35+ Years Enterprise IT",
        "SOC 2 Type II Certified",
        "99.99% Uptime SLA",
        "24/7/365 NOC + SOC",
        "IBM Business Partner Since 1990",
        "US-Based Support Team",
        "IBM Power & IBM i Specialists",
        "Hybrid & Private Cloud",
        "Defined RPO / RTO Targets",
        "Tier-3 Data Centers",
        "Zero-Trust Security",
        "500+ Enterprise Clients",
        "Flash Systems Storage",
        "Boca Raton Headquarters",
        "PCI & HIPAA Ready Environments",
        "Dedicated Account Management",
      ],
      scroll_label: "Scroll",
      scroll_aria_label: "Scroll to explore",
      experiment_id: "",
      headline_b: "",
      headline_highlight_b: "",
      subheadline_b: "",
      cta_primary_b: { label: "", href: "" },
    },
  },
  {
    id: "home-services",
    label: "Popular Solutions",
    description: "Image-backed home-page links to the services buyers request first.",
    key: "services_grid",
    type: "features",
    slugs: ["home"],
    required: true,
    content: {
      eyebrow: "Most Popular",
      heading: "Solutions Teams Ask For First",
      description: "High-demand services that keep enterprise workloads available, recoverable, and secure.",
      items: [
        { title: "Managed Cloud Services", description: "Scalable cloud, private, hybrid, and migration services for enterprise workloads.", href: "/solutions/managed-cloud-hosting", icon: "Cloud", image: "/images/solutions/heroes/managed-cloud-hosting.webp", link_label: "Learn more" },
        { title: "Data Protection", description: "Backup, disaster recovery, high availability, and ransomware recovery.", href: "/solutions/backup-as-a-service", icon: "Shield", image: "/images/solutions/heroes/backup-as-a-service.webp", link_label: "Learn more" },
        { title: "Managed Security", description: "IBM i security, endpoint protection, threat detection, and monitoring.", href: "/solutions/ibm-i-security", icon: "Lock", image: "/images/solutions/heroes/ibm-i-security.webp", link_label: "Learn more" },
        { title: "Managed Services", description: "Microsoft services, automation, systems management, and IBM Power VS.", href: "/solutions/managed-microsoft", icon: "Server", image: "/images/solutions/heroes/managed-microsoft.webp", link_label: "Learn more" },
      ],
      view_all: { title: "View All Solutions", description: "Browse the full catalog of managed cloud, security, and data protection services.", label: "Explore solutions", href: "/solutions" },
    },
  },
  {
    id: "home-decision-paths",
    label: "Decision Paths",
    description: "Home-page starting points that route buyers by problem or platform.",
    key: "decision_paths",
    type: "features",
    slugs: ["home"],
    required: true,
    content: {
      eyebrow: "Choose your starting point",
      heading: "What are you trying to solve?",
      description:
        "Start from the business pressure you feel first. Each route narrows the services, proof points, and next steps that fit the situation.",
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
    id: "home-faq-preview",
    label: "FAQ Preview",
    description: "Home-page FAQ links and the link to the full FAQ hub.",
    key: "faq_preview",
    type: "faq",
    slugs: ["home"],
    required: true,
    content: {
      eyebrow: "Buyer FAQ",
      heading: "Answers before you schedule a call",
      link_label: "Search all FAQs",
      link_href: "/faq",
      items: [
        { id: "ibmi", question: "Does ICE support IBM i and AS/400 environments?" },
        { id: "rpo-rto", question: "What RPO and RTO targets can ICE support?" },
        { id: "security", question: "Does ICE provide 24/7 security and infrastructure monitoring?" },
        { id: "start", question: "What information should I bring to the first call?" },
      ],
    },
  },
  {
    id: "stats",
    label: "Stats",
    description: "Number cards for proof points and performance claims.",
    key: "stats",
    type: "stats",
    excludePageTypes: ["solution", "legal", "settings"],
    excludeSlugs: ["site-settings", "for-ai", "search", "subscribe", "solution-finder"],
    required: true,
    content: {
      eyebrow: "By The Numbers",
      heading: "Proven Enterprise Track Record",
      description: "Measured results across three decades of enterprise infrastructure work.",
      items: [
        { value: 35, suffix: "+", label: "Years of Experience", source_note: "" },
        { value: 1200, suffix: "+", label: "Successful Projects", source_note: "" },
        { value: 500, suffix: "+", label: "Enterprise Clients", source_note: "" },
        { value: 100, suffix: "%", label: "Uptime SLA", source_note: "Contractual SLA target" },
      ],
    },
  },
  {
    id: "data-centers",
    label: "Data Centers",
    description: "Image/text section for data center credibility.",
    key: "data_centers",
    type: "content",
    slugs: ["home"],
    required: true,
    content: {
      eyebrow: "Infrastructure",
      heading: "High-Security Data Centers",
      description: "SOC 2 Type II certified data centers for mission-critical workloads.",
      image: "/images/service/data_center.jpg",
      image_alt: "ICE high-security data center",
      features: ["Tier-3 data centers", "PCI, HIPAA, SOX, and GDPR compliant", "Geographically separated backup data centers"],
      badge_label: "Certified",
      badge_value: "SOC 2 Type II",
      cta: { label: "Learn More", href: "/solutions/managed-cloud-hosting" },
    },
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "Company milestones or implementation sequence.",
    key: "timeline",
    type: "timeline",
    slugs: ["home"],
    required: true,
    content: {
      eyebrow: "Our Journey",
      heading: "35+ Years of Innovation",
      items: [
        { year: "1990", title: "Founded", description: "Established as an IBM Business Partner." },
        { year: "2025", title: "35 Years Strong", description: "Serving enterprise clients across critical industries." },
      ],
    },
  },
  {
    id: "partners-marquee",
    label: "Partner Marquee",
    description: "Simple partner logo/name carousel data.",
    key: "partners_marquee",
    type: "gallery",
    slugs: ["home"],
    required: true,
    content: {
      eyebrow: "Technology Partners",
      heading: "Trusted Partners",
      partners: [
        { name: "IBM", logo_src: "/images/v3/b_1.png", capability: "Power & IBM i since 1990" },
        { name: "Lenovo", logo_src: "/images/v3/b_2.png", capability: "Enterprise compute" },
        { name: "Cisco", logo_src: "/images/v3/b_3.png", capability: "Secure networking" },
        { name: "Dell", logo_src: "/images/v3/b_4.png", capability: "Servers & storage" },
        { name: "Printronix", logo_src: "/images/v3/b_5.png", capability: "Industrial printing" },
        { name: "Acronis", logo_src: "/images/v3/b_6.png", capability: "Cyber protection" },
        { name: "Cybernetics", logo_src: "/images/v3/b_7.png", capability: "Backup & archive" },
        { name: "DASCOM", logo_src: "/images/v3/b_8.png", capability: "Document infrastructure" },
      ],
    },
  },
  {
    id: "industries-cta",
    label: "Industries CTA",
    description: "Home page callout with industries and two buttons.",
    key: "industries_cta",
    type: "industries",
    slugs: ["home"],
    required: true,
    content: {
      eyebrow: "Why Choose ICE",
      heading: "Ready to Modernize Your IT Infrastructure?",
      description: "Let our experts assess your current environment and recommend a path forward.",
      items: [
        { name: "Manufacturing", icon: "Factory" },
        { name: "Financial Services", icon: "Landmark" },
        { name: "Healthcare", icon: "HeartPulse" },
      ],
      cta_primary: { label: "Get Free Assessment", href: "/contact" },
      cta_secondary: { label: "Why ICE", href: "/why-ice" },
      badge_note: "Proud IBM Business Partner, delivering enterprise solutions since 1990.",
      items_heading: "Industries We Serve",
      partner_logo_alt: "IBM Business Partner",
    },
  },
  {
    id: "trust-badges",
    label: "Trust Badges",
    description: "Reliability and security proof cards.",
    key: "trust_badges",
    type: "features",
    slugs: ["home"],
    content: {
      eyebrow: "Enterprise Trust",
      heading: "Built for Reliability",
      items: [
        { icon: "Shield", title: "SOC 2 Certified", description: "SSAE 18 Type II audited data centers" },
        { icon: "Lock", title: "Zero-Trust Security", description: "Multi-layered threat detection and response" },
      ],
    },
  },
  {
    id: "solutions-categories",
    label: "Solutions Categories",
    description: "Category names, descriptions, icons, and order. Service cards come automatically from each published solution's Service Profile.",
    key: "categories",
    type: "features",
    slugs: ["solutions"],
    required: true,
    content: {
      items: [
        {
          title: "Managed Cloud Services",
          description: "Scalable cloud infrastructure tailored to enterprise workloads.",
          icon: "Cloud",
        },
      ],
    },
  },
  {
    id: "solutions-finder-promo",
    label: "Finder Promo",
    description: "Compact guided-finder prompt on the solutions catalog.",
    key: "finder_promo",
    type: "cta",
    slugs: ["solutions"],
    required: true,
    content: {
      eyebrow: "Solution finder",
      heading: "Find a clear starting solution from your workload, risk, and timing.",
      cta: { label: "Open finder", href: "/solutions/find" },
    },
  },
  {
    id: "solutions-comparison",
    label: "Solution Comparison",
    description: "Editable solution-path comparison table on the catalog page.",
    key: "comparison",
    type: "comparison",
    slugs: ["solutions"],
    required: true,
    content: {
      eyebrow: "Shortlist faster",
      heading: "Compare common solution paths",
      description: "Starting ranges for planning; final commitments depend on workload discovery and design.",
      decision_label: "Decision factor",
      explore_label: "Explore",
      link_label: "View solution",
      rows: [
        { label: "Best for", key: "bestFor" },
        { label: "Availability", key: "sla" },
        { label: "Typical RPO", key: "rpo" },
        { label: "Typical RTO", key: "rto" },
        { label: "Platforms", key: "platforms" },
      ],
      items: [
        { name: "IBM i Managed Cloud", bestFor: "Modernizing Power workloads without replatforming", sla: "99.99% target", rpo: "15 min–24 hr", rto: "4–24 hr", platforms: "IBM i, AIX, Power", href: "/solutions/managed-cloud-hosting" },
        { name: "Managed Hybrid Cloud", bestFor: "One operating model across on-prem and cloud", sla: "Workload-specific", rpo: "Policy-based", rto: "Workload-specific", platforms: "IBM i, x86, Azure", href: "/solutions/managed-hybrid-cloud" },
        { name: "Disaster Recovery", bestFor: "Defined recovery targets and tested failover", sla: "Recovery SLA", rpo: "Near-zero–24 hr", rto: "<1–24 hr", platforms: "IBM i, AIX, Windows, Linux", href: "/solutions/disaster-recovery" },
      ],
    },
  },
  {
    id: "solutions-scoping-cta",
    label: "Scoping CTA",
    description: "Architect-led recommendation prompt below the comparison table.",
    key: "scoping_cta",
    type: "cta",
    slugs: ["solutions"],
    required: true,
    content: {
      eyebrow: "Sales-ready scoping",
      heading: "Get a shortlist your team can actually evaluate.",
      description: "Use the finder, compare solution families, or send your requirements to ICE for an architect-led recommendation with fit, risk, and budget guidance.",
      cta_primary: { label: "Request scoped recommendation", href: "/contact?source=solutions_scoping" },
      cta_secondary: { label: "1-800-786-9188", href: "tel:18007869188" },
    },
  },
  {
    id: "solutions-catalog-controls",
    label: "Catalog Controls",
    description: "Labels and filter options above the live solutions catalog.",
    key: "catalog_controls",
    type: "content",
    slugs: ["solutions"],
    required: true,
    content: {
      eyebrow: "Who this is for",
      heading: "Narrow the catalog live",
      count_prefix: "Showing",
      count_suffix: "for this environment.",
      industry_label: "Industry",
      industry_options: ["All", "Manufacturing", "Finance", "Healthcare"],
      platform_label: "Platform",
      platform_options: ["All", "IBM i", "Azure", "Hybrid"],
    },
  },
  {
    id: "solutions-sticky-cta",
    label: "Sticky Catalog CTA",
    description: "Optional sticky contact prompt after the solutions hero scrolls away.",
    key: "sticky_cta",
    type: "cta",
    slugs: ["solutions"],
    required: true,
    content: {
      enabled: true,
      title: "Need help choosing a solution?",
      cta: { label: "Book solution review", href: "/contact?source=solutions_sticky" },
    },
  },
  {
    id: "intro",
    label: "Intro / Lead-in",
    description: "Short intro heading and copy for the top of a page section.",
    key: "intro",
    type: "content",
    slugs: ["partners", "why-ice", "solutions", "home"],
    content: {
      heading: "Technology Partners We Work With",
      description: "Introductory copy for this page section.",
    },
  },
  {
    id: "partners-grid",
    label: "Partners Grid",
    description: "Editable partner cards with logos and specializations.",
    key: "partners_grid",
    type: "partners",
    slugs: ["partners"],
    required: true,
    content: {
      partners: [
        { name: "IBM", description: "World leader in enterprise technology.", logo_src: "/images/v3/b_1.png", specializations: ["Power Systems", "IBM i"], partner_since: "1990" },
      ],
    },
  },
  {
    id: "differentiators",
    label: "Differentiators",
    description: "Why ICE feature cards.",
    key: "differentiators",
    type: "features",
    slugs: ["why-ice"],
    required: true,
    content: {
      heading: "What Sets Us Apart",
      items: [
        { icon: "Award", title: "IBM Business Partner Since 1990", description: "Decades of trusted enterprise expertise." },
      ],
    },
  },
  {
    id: "industries",
    label: "Industries",
    description: "Industry cards for Why ICE or generic pages.",
    key: "industries",
    type: "industries",
    slugs: ["why-ice"],
    required: true,
    content: {
      heading: "Industries We Serve",
      description: "Critical industries that depend on reliable technology infrastructure.",
      items: [
        { icon: "Factory", title: "Manufacturing & Logistics", description: "Reliable IBM infrastructure and cloud solutions." },
      ],
    },
  },
  {
    id: "faqs",
    label: "FAQs",
    description: "Question and answer accordion content.",
    key: "faqs",
    type: "faq",
    slugs: ["why-ice"],
    required: true,
    content: {
      heading: "Frequently Asked Questions",
      description: "Answers to common questions.",
      items: [
        { question: "How do I get started?", answer: "Contact our team to schedule a consultation." },
      ],
    },
  },
  {
    id: "contact-info",
    label: "Contact Info",
    description: "Address, email, phone, and hours cards.",
    key: "contact_info",
    type: "contact",
    slugs: ["contact"],
    required: true,
    content: {
      items: [
        { icon: "MapPin", label: "Address", value: "1279 W Palmetto Park Rd #272415", sub_value: "Boca Raton, FL 33427" },
        { icon: "Mail", label: "Email", value: "info@icesales.com", href: "mailto:info@icesales.com" },
      ],
    },
  },
  {
    id: "service-options",
    label: "Contact Service Options",
    description: "Dropdown options for the contact form.",
    key: "service_options",
    type: "form",
    slugs: ["contact"],
    required: true,
    content: {
      options: ["Managed Cloud Services", "Managed Data Protection", "Managed Security", "Managed Services", "Other"],
      wizard: getDefaultConsultWizardContent(),
    },
  },
  {
    id: "contact-booking",
    label: "Contact Booking",
    description: "Optional scheduling panel shown when a booking URL is configured.",
    key: "booking_embed",
    type: "content",
    slugs: ["contact"],
    required: true,
    content: {
      eyebrow: "Schedule",
      heading: "Book a 30-minute assessment",
      description: "Pick a time that works — talk with an ICE specialist about your environment.",
      button_label: "Book a time",
      embed: false,
    },
  },
  {
    id: "contact-operations",
    label: "Contact Operations",
    description: "US operations overview and editable proof cards.",
    key: "operations",
    type: "features",
    slugs: ["contact"],
    required: true,
    content: {
      eyebrow: "Boca Raton operations",
      heading: "A US-based team behind every escalation",
      description: "ICE supports enterprise cloud, IBM Power, data protection, and security operations from the United States, with direct access to specialists who understand the environment.",
      items: [
        { label: "NOC / SOC coverage", value: "24/7/365 operations", description: "Monitoring and escalation for managed clients." },
        { label: "Business office", value: "Mon–Fri, 9–5 ET", description: "Boca Raton, Florida · US-based support." },
      ],
    },
  },
  {
    id: "contact-faq-preview",
    label: "Contact FAQ Preview",
    description: "Question links and FAQ-hub action at the bottom of the contact page.",
    key: "faq_preview",
    type: "faq",
    slugs: ["contact"],
    required: true,
    content: {
      eyebrow: "Buyer FAQ",
      heading: "What to expect when you contact ICE",
      link_label: "Search all FAQs",
      link_href: "/faq",
      items: [
        { id: "response", question: "How quickly will ICE respond to a new inquiry?" },
        { id: "start", question: "What information should I bring to the first call?" },
        { id: "ibmi", question: "Does ICE support IBM i and AS/400 environments?" },
        { id: "security", question: "Does ICE provide 24/7 security and infrastructure monitoring?" },
      ],
    },
  },
  /* ── Solution page spine (ordered: hero, features, banner, stats, benefits,
        process, use_cases, faq, cta, related — hero template above applies too) ── */
  {
    id: "solution-features",
    label: "Solution Features",
    description: "Capability cards with optional proof lines for solution detail pages.",
    key: "features",
    type: "features",
    pageTypes: ["solution"],
    required: true,
    content: {
      eyebrow: "Capabilities",
      heading: "What You Get",
      description: "Enterprise-grade capabilities included with this service.",
      items: [
        { icon: "Monitor", title: "24/7 Monitoring", description: "Proactive monitoring and rapid incident response.", proof: "Sub-15-minute response SLA" },
        { icon: "Shield", title: "Enterprise Security", description: "Layered controls for mission-critical workloads.", proof: "" },
      ],
    },
  },
  {
    id: "value-props",
    label: "Value Props",
    description: "Scannable outcome band — 3-4 payoff pillars with icons for the message that sells.",
    key: "value_props",
    type: "value_props",
    excludePageTypes: ["legal", "settings"],
    excludeSlugs: ["site-settings"],
    content: {
      eyebrow: "Why It Pays Off",
      heading: "Enterprise Power, Without the Headaches",
      description: "Offload the infrastructure burden and get back time, money, and peace of mind.",
      items: [
        { icon: "Clock", title: "Save Time", outcome: "Free your IT team from firefighting to focus on the business." },
        { icon: "BarChart3", title: "Save Money", outcome: "Predictable costs and no capital sunk into aging hardware." },
        { icon: "Zap", title: "Enterprise Performance", outcome: "Power and speed that scale with demand, engineered for reliability." },
        { icon: "Shield", title: "Always On", outcome: "Contractual uptime SLAs keep your business running around the clock." },
      ],
    },
  },
  {
    id: "roi",
    label: "ROI / Payoff",
    description: "The conversion money-band — count-up ROI metrics, a before/after comparison, and a decisive CTA.",
    key: "roi",
    type: "roi",
    excludePageTypes: ["legal", "settings"],
    excludeSlugs: ["site-settings"],
    content: {
      eyebrow: "The Payoff",
      heading: "Clear, Provable ROI",
      description: "The measurable difference of moving to managed infrastructure.",
      metrics: [
        { value: 40, suffix: "%", label: "Lower IT Costs", note: "vs. in-house infrastructure" },
        { value: 100, suffix: "%", label: "Uptime SLA", note: "Contractual target" },
        { value: 15, suffix: " min", label: "Incident Response", note: "Average first response" },
        { value: 60, suffix: "%", label: "Less Time on Ops", note: "IT team hours reclaimed" },
      ],
      comparison: {
        before_label: "In-House",
        after_label: "With ICE",
        rows: [
          { label: "Hardware refresh cycles", before: "Every 3-5 years", after: "Never — we handle it" },
          { label: "After-hours support", before: "On-call staff", after: "24/7/365 US-based" },
          { label: "Uptime accountability", before: "Your team", after: "Contractual SLA" },
          { label: "Time to scale", before: "Weeks of procurement", after: "On demand" },
        ],
      },
      cta: { label: "Get Your Free Assessment", href: "/contact" },
    },
  },
  {
    id: "solution-banner",
    label: "Statement Banner",
    description: "Full-width brand statement band with an optional call to action.",
    key: "banner",
    type: "banner",
    pageTypes: ["solution"],
    required: true,
    content: {
      text: "Mission-critical infrastructure, managed end to end.",
      description: "One partner accountable for uptime, security, and performance.",
      cta: { label: "Talk to an Architect", href: "/contact" },
    },
  },
  {
    id: "solution-stats",
    label: "Solution Stats",
    description: "Proof-point numbers with optional source footnotes.",
    key: "stats",
    type: "stats",
    pageTypes: ["solution"],
    required: true,
    content: {
      eyebrow: "By The Numbers",
      heading: "Proven Results",
      description: "Outcomes our clients measure this service by.",
      items: [
        { value: 100, suffix: "%", label: "Uptime SLA", source_note: "Contractual SLA target" },
        { value: 35, suffix: "+", label: "Years of Experience", source_note: "" },
        { value: 24, suffix: "/7", label: "US-Based Support", source_note: "" },
        { value: 15, suffix: " min", label: "Incident Response", source_note: "Average first response" },
      ],
    },
  },
  {
    id: "solution-benefits",
    label: "Solution Benefits",
    description: "Measurable benefits with icons, titles, and supporting text.",
    key: "benefits",
    type: "benefits",
    pageTypes: ["solution"],
    required: true,
    content: {
      eyebrow: "Why It Matters",
      heading: "Business Benefits",
      description: "What this service changes for your organization.",
      items: [
        { icon: "Zap", title: "Reduce Operational Overhead", text: "Offload day-to-day management to a dedicated team." },
        { icon: "Shield", title: "Improve Reliability & Security", text: "Hardened, monitored infrastructure with clear SLAs." },
        { icon: "BarChart3", title: "Scale With Demand", text: "Capacity that grows with the business, not ahead of it." },
      ],
    },
  },
  {
    id: "solution-process",
    label: "Solution Process",
    description: "Numbered operating-model steps for solution detail pages.",
    key: "process",
    type: "process",
    pageTypes: ["solution"],
    required: true,
    content: {
      eyebrow: "How We Work",
      heading: "Our Operating Model",
      description: "A proven, repeatable path from assessment to steady-state operations.",
      items: [
        { step: "01", title: "Assess", description: "Understand the current environment and requirements." },
        { step: "02", title: "Design", description: "Create a practical architecture and rollout plan." },
        { step: "03", title: "Implement", description: "Migrate and deploy with zero-surprise cutovers." },
        { step: "04", title: "Operate", description: "Monitor, optimize, and report against SLAs." },
      ],
    },
  },
  {
    id: "solution-use-cases",
    label: "Use Cases",
    description: "Icon cards describing who this service is for.",
    key: "use_cases",
    type: "use_cases",
    pageTypes: ["solution"],
    required: true,
    content: {
      heading: "Common Use Cases",
      description: "Where this service delivers the most value.",
      items: [
        { icon: "Factory", title: "Manufacturing & Logistics", description: "Keep production systems online around the clock." },
        { icon: "Landmark", title: "Financial Services", description: "Meet compliance and availability requirements." },
        { icon: "HeartPulse", title: "Healthcare", description: "Protect patient-facing systems and sensitive data." },
      ],
    },
  },
  {
    id: "solution-faq",
    label: "Solution FAQs",
    description: "Question and answer accordion for this solution.",
    key: "faq",
    type: "faq",
    pageTypes: ["solution"],
    required: true,
    content: {
      heading: "Frequently Asked Questions",
      description: "Answers to common questions about this service.",
      items: [
        { question: "How quickly can we get started?", answer: "Most engagements begin with an assessment within one week of first contact." },
        { question: "Do you support hybrid environments?", answer: "Yes — we manage on-premises, cloud, and hybrid infrastructure." },
      ],
    },
  },
  {
    id: "solution-cta",
    label: "Solution CTA",
    description: "Closing call to action rendered in the solution page layout.",
    key: "cta",
    type: "cta",
    pageTypes: ["solution"],
    required: true,
    content: {
      heading: "Ready to Get Started?",
      description: "Contact our enterprise architects to design a solution tailored to your needs.",
      support_note: "ICE Solutions Desk · US-based platform and recovery specialists",
      cta_primary: { label: "Contact Us", href: "/contact" },
      cta_secondary: { label: "Explore Solutions", href: "/solutions" },
      proof_labels: ["30-minute discovery", "Budgetary fit guidance", "Clear next steps"],
    },
  },
  {
    id: "solution-metrics",
    label: "Solution Metrics",
    description: "Optional, fully editable metric gauges. Keep disabled until each public claim has been verified.",
    key: "metrics",
    type: "metrics",
    pageTypes: ["solution"],
    content: {
      enabled: false,
      eyebrow: "Measurable results",
      heading: "Add verified service metrics",
      description: "",
      items: [
        { type: "counter", value: 0, suffix: "", label: "Verified metric" },
      ],
    },
  },
  {
    id: "faq-hub",
    label: "FAQ Hub",
    description: "Search labels, result copy, and questions shown on the FAQ page.",
    key: "faqs",
    type: "faq",
    slugs: ["faq"],
    required: true,
    content: {
      search_label: "Search frequently asked questions",
      search_placeholder: "Search IBM i, RPO, Azure, response time…",
      result_label_singular: "answer",
      result_label_plural: "answers",
      empty_message: "No answers matched that search. Try a broader term or contact ICE.",
      items: [
        { id: "response", question: "How quickly will ICE respond to a new inquiry?", answer: "The typical response time is within one business day. Active incidents and urgent recovery requests are prioritized." },
        { id: "ibmi", question: "Does ICE support IBM i and AS/400 environments?", answer: "Yes. ICE supports IBM i and IBM Power across hosting, security, backup, disaster recovery, high availability, migration, and managed operations." },
        { id: "rpo-rto", question: "What RPO and RTO targets can ICE support?", answer: "Targets range from near-zero data loss and sub-hour recovery for suitable workloads to daily backup policies. Final commitments follow discovery, design, and testing." },
        { id: "cloud", question: "Can ICE manage hybrid and Azure environments?", answer: "Yes. ICE manages mixed environments spanning on-premises infrastructure, private cloud, Microsoft Azure, IBM Power, and hosted platforms." },
        { id: "security", question: "Does ICE provide 24/7 security and infrastructure monitoring?", answer: "Managed offerings can include 24/7/365 monitoring, alert triage, escalation, and coordinated response through US-based operations." },
        { id: "dr-tests", question: "Are disaster recovery tests included?", answer: "Testing cadence and scope are defined in the service design. ICE emphasizes documented runbooks, recovery exercises, and validation against agreed targets." },
        { id: "industries", question: "Which industries does ICE work with?", answer: "ICE commonly supports manufacturing, financial services, healthcare, insurance, legal, distribution, and other infrastructure-dependent organizations." },
        { id: "start", question: "What information should I bring to the first call?", answer: "A rough platform inventory, business priorities, pain points, compliance needs, and desired timeline are enough to begin. ICE can help structure the deeper discovery." },
      ],
    },
  },
  {
    id: "resources-grid",
    label: "Resource Cards",
    description: "Resource-hub intro, cards, links, and per-card call-to-action label.",
    key: "resources",
    type: "features",
    slugs: ["resources"],
    required: true,
    content: {
      eyebrow: "Resource library",
      heading: "Practical guides for infrastructure decisions",
      description: "Focused primers for teams evaluating cloud, continuity, security, and IBM Power services.",
      item_cta_label: "Read more",
      items: [
        { category: "AS400", title: "AS400 modernization assessment", summary: "How to evaluate AS/400, iSeries, and IBM i hosting, security, backup, HA, and DR options.", href: "/solutions/as400", icon: "Server" },
        { category: "Cloud", title: "Managed cloud for IBM Power workloads", summary: "How ICE hosts IBM i and AIX with 24/7 operations, defined SLAs, and SOC 2 Type II controls.", href: "/solutions/managed-cloud-hosting", icon: "Cloud" },
        { category: "Continuity", title: "Disaster recovery with measurable RPO/RTO", summary: "What to require from a DRaaS partner: replication, test cadence, and failover runbooks.", href: "/solutions/disaster-recovery", icon: "File" },
        { category: "Security", title: "IBM i security hardening checklist", summary: "Exit points, object authority, encryption, and monitoring practices for AS/400 environments.", href: "/solutions/ibm-i-security", icon: "Shield" },
      ],
    },
  },
  {
    id: "solution-buyer-tools",
    label: "Buyer Tools",
    description: "Proof, architecture, recovery planner, resources, and sticky CTA for a service page.",
    key: "buyer_tools",
    type: "custom",
    pageTypes: ["solution"],
    content: {
      enabled: true,
      module_order: ["proof_strip", "architecture", "recovery_planner", "resources", "sticky_cta"],
      proof_strip: {
        enabled: true,
        outcome_label: "Representative outcome",
        outcome: "Edit this service-specific outcome.",
        fit_label: "Common fit",
        fit_items: ["Manufacturing", "Financial services", "Healthcare"],
        platforms_label: "Platforms",
        platforms: ["IBM i", "AIX", "Windows", "Linux"],
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
        badges: [{ label: "24/7 operations", icon: "Clock" }, { label: "Named escalation", icon: "CheckCircle" }],
      },
      recovery_planner: {
        enabled: true,
        eyebrow: "Recovery planner",
        heading: "Turn recovery expectations into a starting design",
        description: "Choose practical targets to see the service path to discuss with an architect.",
        rpo_label: "Recovery point objective",
        rpo_options: [{ value: "near-zero", label: "Near zero" }, { value: "hours", label: "Within hours" }, { value: "daily", label: "Daily" }],
        rto_label: "Recovery time objective",
        rto_options: [{ value: "under-hour", label: "Under 1 hour" }, { value: "same-day", label: "Same day" }, { value: "next-day", label: "Next day" }],
        data_size_label: "Protected data",
        data_size_options: [{ value: "small", label: "Under 5 TB" }, { value: "medium", label: "5–50 TB" }, { value: "large", label: "50+ TB" }],
        criticality_label: "Business criticality",
        criticality_options: [{ value: "critical", label: "Mission critical" }, { value: "important", label: "Important" }, { value: "standard", label: "Standard" }],
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
    },
  },
  {
    id: "solution-related",
    label: "Related Services",
    description: "Automatically recommends published services using category and shared tags. Turn off auto to curate cards manually.",
    key: "related",
    type: "related",
    pageTypes: ["solution"],
    required: true,
    content: {
      auto: true,
      heading: "Related Services",
      description: "Adjacent ICE services commonly evaluated with this offer.",
      items: [],
    },
  },
  {
    id: "final-cta",
    label: "Final CTA",
    description: "Closing call to action with one or two buttons.",
    key: "final_cta",
    type: "cta",
    excludePageTypes: ["solution", "legal", "settings"],
    excludeSlugs: ["site-settings", "for-ai", "search", "subscribe", "solution-finder"],
    required: true,
    content: {
      heading: "Ready to Get Started?",
      description: "Talk with our team about your goals and requirements.",
      cta_primary: { label: "Contact Us", href: "/contact" },
      cta_secondary: { label: "Explore Solutions", href: "/solutions" },
    },
  },
  {
    id: "quote",
    label: "Quote / Testimonial",
    description: "Large pull-quote with attribution.",
    key: "quote",
    type: "quote",
    excludePageTypes: ["legal", "settings"],
    excludeSlugs: ["site-settings"],
    content: {
      quote:
        "ICE keeps our IBM Power workloads available and secure so our team can focus on the business.",
      attribution: "IT Director",
      role: "Mid-market manufacturer",
    },
  },
  {
    id: "split-media",
    label: "Split Media",
    description: "Image + copy split band for storytelling without another card grid.",
    key: "split_media",
    type: "split_media",
    excludePageTypes: ["legal", "settings"],
    excludeSlugs: ["site-settings"],
    content: {
      eyebrow: "Infrastructure",
      heading: "Built for mission-critical workloads",
      description:
        "Tier-3 data centers with geographic separation, redundant power, and SOC 2 Type II controls.",
      image: "/images/service/data_center.jpg",
      image_alt: "ICE data center",
      media_position: "right",
      features: ["SOC 2 Type II", "99.99% uptime target", "24/7 US-based NOC"],
      cta: { label: "Learn more", href: "/solutions/managed-cloud-hosting" },
    },
  },
  {
    id: "sla-table",
    label: "SLA / Spec Table",
    description: "Enumerable service-level metrics table.",
    key: "sla_table",
    type: "sla_table",
    pageTypes: ["solution"],
    content: {
      eyebrow: "Commitments",
      heading: "Service levels",
      description: "Contractual targets for availability and response.",
      rows: [
        { metric: "Uptime SLA", target: "99.99%", notes: "Contractual target" },
        { metric: "Incident response", target: "15 minutes", notes: "Mean response" },
        { metric: "Support coverage", target: "24/7/365", notes: "US-based NOC + SOC" },
      ],
    },
  },
  {
    id: "comparison",
    label: "Comparison",
    description: "Status quo vs ICE comparison table.",
    key: "comparison",
    type: "comparison",
    excludePageTypes: ["legal", "settings"],
    excludeSlugs: ["site-settings"],
    content: {
      eyebrow: "The difference",
      heading: "ICE managed vs status quo",
      description:
        "Direct comparison for teams evaluating DIY operations or a generalist MSP against ICE managed services.",
      before_label: "In-house / generic MSP",
      after_label: "With ICE",
      footnote: "SLAs and coverage vary by contract; figures reflect typical ICE managed offerings.",
      rows: [
        { label: "IBM Power expertise", before: "Generalist coverage", after: "Specialists since 1990" },
        { label: "Uptime accountability", before: "Best effort", after: "Contractual SLA" },
        { label: "Security operations", before: "Business hours", after: "24/7 US-based SOC" },
        { label: "DR testing", before: "Ad hoc / untested", after: "Scheduled restore tests" },
        { label: "Escalation path", before: "Ticket queue", after: "Named architects + NOC" },
      ],
    },
  },
  {
    id: "case-study",
    label: "Case Study / Outcome",
    description: "Anonymized outcome module with metrics.",
    key: "case_study",
    type: "case_study",
    excludePageTypes: ["legal", "settings"],
    excludeSlugs: ["site-settings"],
    content: {
      industry: "Manufacturing",
      anonymized: true,
      heading: "Cut recovery time without a capital refresh",
      summary:
        "A mid-market manufacturer moved IBM i workloads to ICE-managed infrastructure and established a tested DR runbook.",
      challenge:
        "Aging on-prem Power hardware and an untested DR plan left recovery timelines measured in days.",
      solution:
        "ICE hosted the IBM i estate with replication, runbooks, and quarterly restore tests under a managed SLA.",
      outcome:
        "Documented RTO of 4 hours and RPO of 15 minutes, with operations load down roughly 40%.",
      metrics: [
        { value: "4", suffix: " hr", label: "RTO target" },
        { value: "15", suffix: " min", label: "RPO target" },
        { value: "40", suffix: "%", label: "Lower ops load" },
      ],
      cta: { label: "Talk to an expert", href: "/contact" },
    },
  },
  {
    id: "home-infrastructure",
    label: "Home Infrastructure",
    description: "Architecture / infrastructure intro copy on the home page.",
    key: "infrastructure",
    type: "content",
    slugs: ["home"],
    content: {
      eyebrow: "Architecture",
      heading: "Built for Enterprise Workloads",
      description: "Our infrastructure spans data centers, cloud platforms, and security layers.",
      flow_aria_label: "Enterprise data flow",
      path_aria_label: "Live enterprise infrastructure path",
      path_label: "Live managed path",
      active_layer_label: "Active layer",
      nodes: [
        { id: "client", label: "Enterprise edge", icon: "Monitor", summary: "Workstations, ERP clients, and plant-floor systems that connect into ICE.", details: ["Desktops & thin clients", "ERP / MES apps", "Secure remote access"] },
        { id: "firewall", label: "Firewall", icon: "Shield", summary: "Perimeter and segmentation controls.", details: ["Next-gen firewall", "Zero-trust policies", "Threat inspection"] },
        { id: "cloud", label: "Cloud servers", icon: "Cloud", summary: "Managed compute for critical workloads.", details: ["IBM Power & x86", "Hybrid / private options", "24/7 operations"] },
        { id: "storage", label: "Storage", icon: "Database", summary: "Enterprise storage with redundancy.", details: ["Flash systems", "Replication", "Encryption at rest"] },
        { id: "backup", label: "Backup", icon: "RefreshCw", summary: "Protected copies with defined RPO/RTO.", details: ["Immutable options", "Geo-separated copies", "Tested recovery"] },
      ],
    },
  },
  {
    id: "home-metrics",
    label: "Home Metrics",
    description: "Performance metrics band on the home page.",
    key: "metrics",
    type: "metrics",
    slugs: ["home"],
    content: {
      eyebrow: "Performance",
      heading: "Operational Excellence",
      description: "Real-time metrics from our managed infrastructure.",
      items: [
        { value: "15", suffix: " min", label: "Mean Incident Response" },
        { value: "24/7/365", label: "Always-On Operations" },
        { value: "14,723", label: "Threats Blocked (30d)" },
        { value: "0", label: "Active Threats" },
      ],
    },
  },
  {
    id: "partners-benefits",
    label: "Benefits",
    description: "Benefit cards (title + description) for a marketing page.",
    key: "benefits",
    type: "benefits",
    slugs: ["partners", "why-ice", "solutions"],
    content: {
      heading: "Why Partner-Backed Solutions",
      description: "Decades of vendor relationships mean better outcomes for your business.",
      items: [
        {
          title: "Certified expertise",
          description:
            "Our engineers hold certifications across the platforms we resell, so your solutions are designed and deployed by people who know them inside and out.",
        },
        {
          title: "Direct vendor relationships",
          description:
            "Decades-long partnerships give us priority escalation paths, competitive pricing, and early access to new technology.",
        },
        {
          title: "End-to-end delivery",
          description:
            "From sizing and procurement to integration, migration, and ongoing support — one partner accountable for the entire lifecycle.",
        },
      ],
    },
  },
  {
    id: "for-ai-hero",
    label: "AI Directory Hero",
    description: "Heading and machine-directory link for the AI systems page.",
    key: "hero",
    type: "hero",
    slugs: ["for-ai"],
    required: true,
    content: {
      eyebrow: "AI / LLM directory",
      headline: "International Computer Exchange — facts for AI systems",
      subheadline: "This page summarizes ICE for live-retrieval agents and answer engines. Prefer canonical solution URLs.",
      directory_intro: "Full machine directory:",
      directory_label: "/llms.txt",
      directory_href: "/llms.txt",
      directory_suffix: ".",
    },
  },
  {
    id: "for-ai-facts",
    label: "Verified Facts",
    description: "Machine-readable company facts presented to answer engines.",
    key: "facts",
    type: "content",
    slugs: ["for-ai"],
    required: true,
    content: {
      heading: "Verified facts",
      items: [
        { text: "IBM Business Partner since 1990" },
        { text: "Headquarters: Boca Raton, Florida, USA" },
        { text: "SOC 2 Type II certified data centers" },
        { text: "24/7/365 US-based NOC and SOC support" },
        { text: "Focus platforms: IBM Power, IBM i (AS/400), Microsoft, hybrid cloud" },
      ],
    },
  },
  {
    id: "for-ai-links",
    label: "Canonical AI Links",
    description: "Canonical pages that AI systems should cite.",
    key: "canonical_links",
    type: "content",
    slugs: ["for-ai"],
    required: true,
    content: {
      heading: "Canonical service URLs",
      items: [
        { label: "Managed Cloud Hosting", href: "/solutions/managed-cloud-hosting" },
        { label: "Disaster Recovery as a Service", href: "/solutions/disaster-recovery" },
        { label: "AS400", href: "/solutions/as400" },
        { label: "IBM i Security", href: "/solutions/ibm-i-security" },
        { label: "Contact / consultation", href: "/contact" },
      ],
    },
  },
  {
    id: "for-ai-contact",
    label: "AI Directory Contact",
    description: "Contact fact shown on the AI systems page.",
    key: "contact",
    type: "contact",
    slugs: ["for-ai"],
    required: true,
    content: {
      heading: "Contact",
      text: "Phone: +1-800-786-9188 · Email: info@icesales.com · Boca Raton, FL",
    },
  },
  {
    id: "for-ai-llms-text",
    label: "LLMs.txt Directory",
    description: "Complete plain-text machine directory served live at /llms.txt.",
    key: "llms_txt",
    type: "content",
    slugs: ["for-ai"],
    required: true,
    content: {
      body: llmsDefault.lines.join("\n"),
    },
  },
  {
    id: "search-hero",
    label: "Search Hero",
    description: "Search-page heading and input labels.",
    key: "hero",
    type: "hero",
    slugs: ["search"],
    required: true,
    content: {
      eyebrow: "Search",
      headline: "What are you looking for?",
      subheadline: "Search solutions, partners, and resources from International Computer Exchange.",
      search_label: "Search the site",
      search_placeholder: "Search solutions, partners, and more...",
    },
  },
  {
    id: "search-results",
    label: "Search Result Labels",
    description: "Result-count sentences. Use {count} and {query} tokens.",
    key: "results",
    type: "content",
    slugs: ["search"],
    required: true,
    content: {
      query_status_singular: "{count} result for \"{query}\"",
      query_status_plural: "{count} results for \"{query}\"",
      browse_status_singular: "Browse {count} page",
      browse_status_plural: "Browse all {count} pages",
    },
  },
  {
    id: "search-empty-state",
    label: "Search Empty State",
    description: "No-results message and recovery actions.",
    key: "empty_state",
    type: "content",
    slugs: ["search"],
    required: true,
    content: {
      headline: "No results found",
      description: "Your search “{query}” did not match any pages. Try a different keyword, or browse our solutions.",
      clear_label: "Clear search",
      browse_label: "Browse solutions",
      browse_href: "/solutions",
    },
  },
  {
    id: "subscribe-form",
    label: "Subscription Form",
    description: "Form heading, field labels, preference choices, and submit button.",
    key: "form",
    type: "form",
    slugs: ["subscribe"],
    required: true,
    content: {
      eyebrow: "ICE communications",
      headline: "Subscribe and manage email preferences",
      description: "Tell us where to reach you, then choose exactly which messages you want. You can unsubscribe from every category below.",
      fields: { name_label: "Name", email_label: "Email", phone_label: "Phone number" },
      preference_heading: "Choose your message types",
      preference_description: "Toggle any category on or off. Required account or security notices may still be sent when needed to provide a service.",
      preference_types: [
        { key: "marketing_materials", label: "Marketing materials", description: "Service news, practical guides, and offers from ICE." },
        { key: "billing", label: "Billing and account messages", description: "Balance reminders, payment confirmations, and account notices." },
        { key: "private_messages", label: "Private messages", description: "Direct messages intended for you or your organization." },
        { key: "special_messages", label: "Special messages", description: "Occasional company updates, seasonal notes, and invitations." },
        { key: "service_updates", label: "Service updates", description: "Maintenance, security, and operational notices for ICE services." },
        { key: "events", label: "Events and webinars", description: "Invitations and follow-ups for ICE events and webinars." },
      ],
      submit_label: "Save my preferences",
    },
  },
  {
    id: "subscribe-success",
    label: "Subscription Success",
    description: "Confirmation shown after preferences are saved.",
    key: "success",
    type: "content",
    slugs: ["subscribe"],
    required: true,
    content: {
      headline: "Your preferences are saved",
      description: "You can change these choices at any time. We will only send the types of messages you selected.",
      preference_link_label: "Open your preference center",
    },
  },
  {
    id: "subscribe-messages",
    label: "Subscription Errors",
    description: "Save and connection error messages.",
    key: "messages",
    type: "content",
    slugs: ["subscribe"],
    required: true,
    content: {
      save_error: "We could not save your preferences.",
      network_error: "We could not save your preferences.",
    },
  },
  {
    id: "subscribe-consent",
    label: "Subscription Consent",
    description: "Consent sentence and privacy-policy link.",
    key: "consent",
    type: "content",
    slugs: ["subscribe"],
    required: true,
    content: {
      prefix: "By submitting, you consent to the selected communications.",
      privacy_label: "Read our privacy notice",
      privacy_href: "/sms-consent",
      suffix: ".",
    },
  },
  {
    id: "preference-center",
    label: "Preference Center",
    description: "Copy, fields, message categories, and actions on personal unsubscribe links.",
    key: "preference_center",
    type: "form",
    slugs: ["subscribe"],
    required: true,
    content: {
      eyebrow: "ICE communications",
      headline: "Manage email preferences",
      description: "Update your details and choose which types of messages you want to receive.",
      loading_label: "Loading your preferences…",
      error_heading: "Email preferences",
      fields: { name_label: "Name", email_label: "Email", phone_label: "Phone number" },
      preference_heading: "Message types",
      preference_types: [
        { key: "marketing_materials", label: "Marketing materials", description: "Service news, practical guides, and offers from ICE." },
        { key: "billing", label: "Billing and account messages", description: "Balance reminders, payment confirmations, and account notices." },
        { key: "private_messages", label: "Private messages", description: "Direct messages intended for you or your organization." },
        { key: "special_messages", label: "Special messages", description: "Occasional company updates, seasonal notes, and invitations." },
        { key: "service_updates", label: "Service updates", description: "Maintenance, security, and operational notices for ICE services." },
        { key: "events", label: "Events and webinars", description: "Invitations and follow-ups for ICE events and webinars." },
      ],
      save_label: "Save preferences",
      unsubscribe_all_label: "Unsubscribe from all",
      return_label: "Return to ICE",
      return_href: "/",
    },
  },
  {
    id: "preference-center-success",
    label: "Preference Center Success",
    description: "Confirmation shown after a subscriber updates their preferences.",
    key: "preference_center_success",
    type: "content",
    slugs: ["subscribe"],
    required: true,
    content: {
      headline: "Preferences updated",
      description: "Your choices are saved. Messages will follow the categories you selected.",
    },
  },
  {
    id: "preference-center-messages",
    label: "Preference Center Errors",
    description: "Expired-link, load, save, and network messages for personal preference links.",
    key: "preference_center_messages",
    type: "content",
    slugs: ["subscribe"],
    required: true,
    content: {
      expired_error: "This preference link is no longer available.",
      load_error: "We could not load your preferences.",
      update_error: "We could not update your preferences.",
      network_error: "We could not update your preferences.",
    },
  },
  {
    id: "finder-breadcrumbs",
    label: "Finder Breadcrumbs",
    description: "Breadcrumb labels and links for the guided finder.",
    key: "breadcrumbs",
    type: "content",
    slugs: ["solution-finder"],
    required: true,
    content: {
      aria_label: "Breadcrumb",
      separator: "/",
      items: [
        { label: "Home", href: "/" },
        { label: "Solutions", href: "/solutions" },
        { label: "Finder", schema_label: "Solution Finder", href: "/solutions/find" },
      ],
    },
  },
  {
    id: "finder-hero",
    label: "Finder Hero",
    description: "Heading above the interactive solution finder.",
    key: "hero",
    type: "hero",
    slugs: ["solution-finder"],
    required: true,
    content: {
      eyebrow: "Guided recommendations",
      headline: "Find the right ICE solution",
      subheadline: "Choose a quick match or a detailed assessment to get one recommended starting point and two supporting options.",
    },
  },
  {
    id: "finder-content",
    label: "Interactive Finder Copy",
    description: "Questions, options, goals, tabs, buttons, and recommendation labels inside the finder.",
    key: "finder",
    type: "form",
    slugs: ["solution-finder"],
    required: true,
    content: getDefaultSolutionFinderContent() as JsonObject,
  },
  {
    id: "finder-catalog-cta",
    label: "Finder Catalog Link",
    description: "Link beneath the interactive finder.",
    key: "catalog_cta",
    type: "cta",
    slugs: ["solution-finder"],
    required: true,
    content: { label: "Or browse the full catalog →", href: "/solutions" },
  },
  {
    id: "legal-hero",
    label: "Legal Hero",
    description: "Header copy for Terms of Service and SMS Consent pages.",
    key: "hero",
    type: "hero",
    pageTypes: ["legal"],
    required: true,
    content: {
      eyebrow: "Legal · Website Terms",
      headline: "Terms of Service",
      subheadline: "Please read these terms carefully before using our services.",
      last_updated: "March 2026",
      badge_note: "Applies to icesales.com",
      document_title: "Website Terms and Conditions",
      document_intro: "These Terms govern your access to and use of the International Computer Exchange, Inc. website.",
      related_label: "SMS Consent Policy",
      related_href: "/sms-consent",
    },
  },
  {
    id: "legal-sections",
    label: "Legal Sections",
    description: "Editable policy sections (id, title, content) for Terms and SMS Consent.",
    key: "sections",
    type: "content",
    pageTypes: ["legal"],
    required: true,
    content: {
      items: [
        {
          id: "acceptance",
          title: "1. Acceptance of Terms",
          content: "By accessing and using ICE services, you agree to be bound by these Terms of Service.",
        },
      ],
    },
  },
  {
    id: "site-company-info",
    label: "Company Info",
    description: "Address, phone, email, hours, and logo used in the navbar and footer.",
    key: "company_info",
    type: "content",
    slugs: ["site-settings"],
    required: true,
    content: {
      name: "International Computer Exchange",
      tagline: "IBM Business Partner Since 1990",
      address: "1279 W Palmetto Park Rd #272415",
      city: "Boca Raton, FL 33427",
      phone: "1-800-786-9188",
      email: "info@icesales.com",
      hours: "Mon - Fri, 9:00 AM - 5:00 PM ET",
      logo: "/images/logo/ice-logo.jpg",
    },
  },
  {
    id: "site-navbar",
    label: "Navbar Copy",
    description: "Global navigation accessibility labels and the Solutions mega-menu promotion panel.",
    key: "navbar",
    type: "content",
    slugs: ["site-settings"],
    required: true,
    content: {
      solutions_column_label: "Solutions",
      promo_eyebrow: "Talk to ICE",
      promo_heading: "Not sure which solution fits?",
      promo_description: "Get a free infrastructure assessment — or jump into the solution finder in under a minute.",
      promo_primary: { label: "Request a consultation", href: "/contact" },
      promo_secondary: { label: "Find your solution", href: "/solutions/find" },
      proof_line: "Providing Enterprise solutions since 1990.",
      view_all_label: "View All Solutions",
      view_all_href: "/solutions",
      desktop_search_aria_label: "Search (Ctrl+K)",
      mobile_search_aria_label: "Search",
      open_menu_aria_label: "Open menu",
      close_menu_aria_label: "Close menu",
      home_aria_label: "ICE Home",
      logo_alt: "International Computer Exchange",
    },
  },
  {
    id: "site-contact-widget",
    label: "Floating Contact Widget",
    description: "Site-wide floating contact form copy, consent text, accessibility labels, and grouped service choices.",
    key: "contact_widget",
    type: "form",
    slugs: ["site-settings"],
    required: true,
    content: getDefaultContactWidgetContent() as unknown as JsonObject,
  },
  {
    id: "site-not-found",
    label: "404 Page",
    description: "Global page-not-found headline, explanation, status code, and recovery actions.",
    key: "not_found",
    type: "content",
    slugs: ["site-settings"],
    required: true,
    content: {
      eyebrow: "Page not found",
      status_code: "404",
      headline: "We couldn't find that page",
      description: "Sorry, the page you're looking for doesn't exist or has been moved. Check the URL, or head back to explore our solutions.",
      primary_cta: { label: "Go home", href: "/" },
      secondary_cta: { label: "View solutions", href: "/solutions" },
    },
  },
  {
    id: "site-sales-enablement",
    label: "Sales Enablement Settings",
    description: "Live homepage, sticky callback, and soft-lead settings. Use the dedicated Sales Enablement editor for the intuitive controls.",
    key: "sales_enablement",
    type: "custom",
    slugs: ["site-settings"],
    required: true,
    content: {},
  },
  {
    id: "site-footer",
    label: "Footer Copy",
    description: "Copyright, IBM partner badge labels, and optional get-in-touch CTA.",
    key: "footer",
    type: "content",
    slugs: ["site-settings"],
    required: true,
    content: {
      ibm_partner_text:
        "As an IBM Business Partner since 1990, ICE delivers enterprise-grade cloud hosting, data protection, security, and managed services for businesses worldwide.",
      ibm_partner_label: "IBM Business Partner",
      ibm_partner_sublabel: "Since 1990",
      copyright: "International Computer Exchange, Inc.",
      get_in_touch_heading: "Ready to modernize your infrastructure?",
      get_in_touch_description:
        "Speak with an ICE specialist about managed cloud, data protection, security, and IBM Power environments.",
      get_in_touch_cta_label: "Speak to an Expert",
      get_in_touch_cta_href: "/contact",
      quick_links_heading: "Quick Links",
      rights_reserved_label: "All Rights Reserved.",
      logo_alt: "International Computer Exchange",
      ibm_logo_alt: "IBM",
      coretv_label: "by CoreTV",
      coretv_url: "https://coretv.co",
      redirect_heading: "Leaving ICE",
      redirect_description_prefix: "You are being redirected off this page to CoreTV in",
      redirect_second_singular: "second",
      redirect_second_plural: "seconds",
      redirect_cancel_label: "Cancel",
      redirect_continue_label: "Go now",
      show_get_in_touch: true,
      show_contact_bar: true,
      show_solutions_accordion: true,
      social_links: [],
    },
  },
  {
    id: "site-announcement",
    label: "Announcement Banner",
    description: "Optional top-of-site promo strip with schedule and dismiss.",
    key: "announcement_banner",
    type: "content",
    slugs: ["site-settings"],
    content: {
      enabled: false,
      id: "default",
      message: "IBM Business Partner since 1990 — talk with an ICE specialist today.",
      href: "/contact",
      cta_label: "Book a consultation",
      dismissible: true,
      starts_at: null,
      ends_at: null,
    },
  },
  {
    id: "site-booking",
    label: "Booking / Calendar",
    description: "Calendly (or similar) URL used by booking CTAs. Contact-page panel copy is edited on the Contact page.",
    key: "booking",
    type: "content",
    slugs: ["site-settings"],
    content: {
      calendly_url: "",
    },
  },
];

/** Convert section_key like "services_grid" to "Services Grid" */
function prettifyKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getTypeLabel(value: string): string {
  return SECTION_TYPES.find((t) => t.value === value)?.label ?? value;
}

/** Check if a field key is likely a media/image URL field */
const MEDIA_KEY_PATTERNS = ["image", "logo", "avatar", "background", "banner", "icon_url", "photo", "thumbnail", "cover", "poster", "src"];
function isMediaKey(key: string): boolean {
  const lower = key.toLowerCase();
  return MEDIA_KEY_PATTERNS.some((p) => lower.includes(p));
}

function isIconKey(key: string): boolean {
  const lower = key.toLowerCase();
  return lower === "icon" || lower.endsWith("_icon") || lower.endsWith("icon");
}

function isIllustrationKey(key: string): boolean {
  const lower = key.toLowerCase();
  return lower === "illustration" || lower.endsWith("_illustration") || lower === "graphic";
}

function cloneContent(content: JsonObject): JsonObject {
  return JSON.parse(JSON.stringify(content));
}

function cleanSectionKey(key: string): string {
  return key.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "");
}

function uniqueSectionKey(baseKey: string, existingKeys: string[]): string {
  const base = cleanSectionKey(baseKey) || "section";
  if (!existingKeys.includes(base)) return base;
  let index = 2;
  let next = `${base}_${index}`;
  while (existingKeys.includes(next)) {
    index += 1;
    next = `${base}_${index}`;
  }
  return next;
}

function templateAppliesToPage(template: SectionTemplate, page: PageMeta): boolean {
  const slugMatch = !template.slugs || template.slugs.includes(page.slug);
  const slugNotExcluded = !template.excludeSlugs || !template.excludeSlugs.includes(page.slug);
  const typeMatch = !template.pageTypes || template.pageTypes.includes(page.page_type);
  const notExcluded = !template.excludePageTypes || !template.excludePageTypes.includes(page.page_type);
  return slugMatch && slugNotExcluded && typeMatch && notExcluded;
}

function contentItemIdentity(value: JsonObject): string | undefined {
  for (const key of ["id", "key", "slug", "href", "name", "title"]) {
    const candidate = value[key];
    if (typeof candidate === "string" && candidate) return `${key}:${candidate}`;
  }
  return undefined;
}

function mergeMissingContent(defaults: JsonObject, current: JsonObject): JsonObject {
  const merged = cloneContent(defaults);
  for (const [key, value] of Object.entries(current)) {
    const defaultValue = merged[key];
    if (Array.isArray(value) && Array.isArray(defaultValue)) {
      // An empty list is an intentional CMS choice. For non-empty object lists,
      // surface missing editable fields without restoring removed list items.
      merged[key] = value.map((item, index) => {
        if (item === null || Array.isArray(item) || typeof item !== "object") return item;
        const itemObject = item as JsonObject;
        const identity = contentItemIdentity(itemObject);
        const matchingDefault = defaultValue.find((candidate) => {
          if (candidate === null || Array.isArray(candidate) || typeof candidate !== "object") return false;
          return identity !== undefined && contentItemIdentity(candidate as JsonObject) === identity;
        }) ?? (identity === undefined ? defaultValue[index] : undefined);
        if (matchingDefault === null || Array.isArray(matchingDefault) || typeof matchingDefault !== "object") {
          return item;
        }
        return mergeMissingContent(matchingDefault as JsonObject, itemObject);
      });
    } else if (
      value !== null
      && !Array.isArray(value)
      && typeof value === "object"
      && defaultValue !== null
      && !Array.isArray(defaultValue)
      && typeof defaultValue === "object"
    ) {
      merged[key] = mergeMissingContent(defaultValue as JsonObject, value as JsonObject);
    } else {
      // Existing values always win, including intentional blanks and empty arrays.
      merged[key] = value;
    }
  }
  return merged;
}

function hydrateSectionsFromTemplates(initialSections: Section[], page: PageMeta): Section[] {
  return initialSections.map((section) => {
    const template = SECTION_TEMPLATES.find(
      (candidate) => candidate.key === section.section_key && templateAppliesToPage(candidate, page),
    );
    if (!template) return section;
    return {
      ...section,
      content: mergeMissingContent(template.content, section.content),
    };
  });
}

function defaultContentForType(type: string): JsonObject {
  if (type === "hero") {
    const heroTemplate = SECTION_TEMPLATES.find((template) => template.id === "hero");
    return cloneContent(heroTemplate?.content ?? {});
  }
  if (type === "features" || type === "industries") {
    return {
      eyebrow: "",
      heading: "Section Heading",
      description: "",
      items: [{ icon: "Globe", title: "Item title", description: "Item description.", proof: "" }],
    };
  }
  if (type === "banner") {
    return {
      text: "Short display-quality statement.",
      description: "Supporting sentence for the statement band.",
      cta: { label: "Contact Us", href: "/contact" },
    };
  }
  if (type === "value_props") {
    return {
      eyebrow: "Why It Pays Off",
      heading: "Enterprise Power, Without the Headaches",
      description: "Offload the infrastructure burden and get back time, money, and peace of mind.",
      items: [
        { icon: "Clock", title: "Save Time", outcome: "Free your team to focus on the business." },
        { icon: "BarChart3", title: "Save Money", outcome: "Predictable costs, no sunk hardware spend." },
        { icon: "Zap", title: "Enterprise Performance", outcome: "Power and speed engineered for reliability." },
        { icon: "Shield", title: "Always On", outcome: "Uptime SLAs keep your business running." },
      ],
    };
  }
  if (type === "roi") {
    return {
      eyebrow: "The Payoff",
      heading: "Clear, Provable ROI",
      description: "The measurable difference of moving to managed infrastructure.",
      metrics: [
        { value: 40, suffix: "%", label: "Lower IT Costs", note: "" },
        { value: 100, suffix: "%", label: "Uptime SLA", note: "Contractual target" },
        { value: 60, suffix: "%", label: "Less Time on Ops", note: "" },
      ],
      comparison: {
        before_label: "In-House",
        after_label: "With ICE",
        rows: [
          { label: "Hardware refresh cycles", before: "Every 3-5 years", after: "Never — we handle it" },
          { label: "After-hours support", before: "On-call staff", after: "24/7/365 US-based" },
        ],
      },
      cta: { label: "Get Your Free Assessment", href: "/contact" },
    };
  }
  if (type === "process") {
    return {
      eyebrow: "",
      heading: "How We Work",
      description: "",
      items: [
        { step: "01", title: "Step title", description: "Step description." },
        { step: "02", title: "Step title", description: "Step description." },
      ],
    };
  }
  if (type === "benefits") {
    return {
      heading: "Benefits",
      description: "",
      items: [{ icon: "Zap", title: "Benefit title", text: "Benefit description." }],
    };
  }
  if (type === "stats" || type === "metrics") {
    return {
      eyebrow: "",
      heading: "Metrics",
      description: "",
      items: [{ value: 99, suffix: "%", label: "Metric label", source_note: "" }],
    };
  }
  if (type === "use_cases") {
    return {
      heading: "Use Cases",
      description: "",
      items: [{ icon: "Globe", title: "Use case title", description: "Use case description." }],
    };
  }
  if (type === "related") {
    return {
      heading: "Related Services",
      items: [{ title: "Service title", description: "Service description.", href: "/solutions", icon: "Cloud" }],
    };
  }
  if (type === "faq") {
    return { heading: "FAQs", description: "", items: [{ question: "Question?", answer: "Answer." }] };
  }
  if (type === "cta") {
    return {
      heading: "Ready to Get Started?",
      description: "Talk with our team.",
      cta_primary: { label: "Contact Us", href: "/contact" },
      cta_secondary: { label: "Explore Solutions", href: "/solutions" },
    };
  }
  if (type === "contact") {
    return { items: [{ icon: "Mail", label: "Email", value: "info@icesales.com", href: "mailto:info@icesales.com" }] };
  }
  if (type === "form") {
    return { options: ["Option one", "Option two"] };
  }
  if (type === "timeline") {
    return {
      eyebrow: "",
      heading: "Timeline",
      description: "",
      items: [
        { year: "2020", title: "Milestone", description: "What happened." },
        { year: "2025", title: "Milestone", description: "What happened." },
      ],
    };
  }
  if (type === "gallery" || type === "partners") {
    return {
      eyebrow: "",
      heading: "Partners",
      description: "",
      partners: [
        { name: "IBM", description: "Partner description.", logo_src: "", specializations: ["Specialty"], partner_since: "1990" },
      ],
    };
  }
  if (type === "illustration") {
    return {
      heading: "Section Heading",
      description: "Supporting copy for this section.",
      illustration: "",
    };
  }
  if (type === "content") {
    return {
      eyebrow: "",
      heading: "Section Heading",
      description: "Section content.",
      features: [],
    };
  }
  return { heading: "Section Heading", description: "Section content." };
}

/* ═══════════════════════════════════════════════════════════════════════ */

export default function CMSPageEditor({
  page,
  initialSections,
  canPublish,
  supportsPublishScheduling,
}: {
  page: PageMeta;
  initialSections: Section[];
  canPublish: boolean;
  supportsPublishScheduling: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  // Page meta
  const seoSeed = initialSections.find((s) => s.section_key === PAGE_SEO_KEY)?.content ?? {};
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [metaTitle, setMetaTitle] = useState(page.meta_title ?? "");
  const [metaDesc, setMetaDesc] = useState(page.meta_description ?? "");
  const [catalogOrder, setCatalogOrder] = useState(String(page.sort_order ?? 0));
  const [isPublished, setIsPublished] = useState(page.is_published);
  const initialScheduledPublishAt = toLocalDateTimeInput(page.scheduled_publish_at);
  const [scheduledPublishAt, setScheduledPublishAt] = useState(initialScheduledPublishAt);
  const [canonicalUrl, setCanonicalUrl] = useState(
    page.canonical_url ?? (typeof seoSeed.canonical_url === "string" ? seoSeed.canonical_url : "")
  );
  const [ogImage, setOgImage] = useState(
    page.og_image_url ?? (typeof seoSeed.og_image_url === "string" ? seoSeed.og_image_url : "")
  );
  const [twitterImage, setTwitterImage] = useState(
    page.twitter_image_url ?? (typeof seoSeed.twitter_image_url === "string" ? seoSeed.twitter_image_url : "")
  );
  const [faviconUrl, setFaviconUrl] = useState(
    page.favicon_url ?? (typeof seoSeed.favicon_url === "string" ? seoSeed.favicon_url : "")
  );
  const [ogMediaOpen, setOgMediaOpen] = useState(false);
  const [twitterMediaOpen, setTwitterMediaOpen] = useState(false);
  const [faviconMediaOpen, setFaviconMediaOpen] = useState(false);

  // Sections — hide the reserved page_seo row from the section list UI
  const [sections, setSections] = useState<Section[]>(() =>
    hydrateSectionsFromTemplates(
      initialSections.filter((s) => s.section_key !== PAGE_SEO_KEY),
      page,
    ),
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [invalidJsonIds, setInvalidJsonIds] = useState<Set<string>>(new Set());

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState("content");
  const [newTemplateId, setNewTemplateId] = useState("");

  // Preview — side-by-side live preview of current editor state
  const [showPreview, setShowPreview] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const active = sections.filter((s) => !s._deleted).sort((a, b) => a.sort_order - b.sort_order);
  const activeKeys = active.map((section) => section.section_key);
  const pageTemplates = SECTION_TEMPLATES.filter((template) => templateAppliesToPage(template, page));
  const isPageOwnedTemplate = (template: SectionTemplate) =>
    template.required === true || template.slugs?.includes(page.slug) === true;
  const missingTemplates = pageTemplates.filter(
    (template) => isPageOwnedTemplate(template) && !activeKeys.includes(template.key),
  );
  const addableTemplates = pageTemplates.filter(
    (template) => !isPageOwnedTemplate(template) || !activeKeys.includes(template.key),
  );
  const selectedTemplate = addableTemplates.find((template) => template.id === newTemplateId);

  const isSystemSlug = SYSTEM_CMS_SLUGS.has(page.slug);
  const canReorderSections = !isSystemSlug || page.page_type === "solution";
  const requiredSectionKeys = new Set(
    pageTemplates
      .filter(isPageOwnedTemplate)
      .map((template) => template.key),
  );

  useEffect(() => {
    if (!isDirty) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty]);

  const dirty = () => {
    setIsDirty(true);
    if (saveStatus === "saved" || saveStatus === "error") setSaveStatus("idle");
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateSection = (id: string, field: keyof Section, value: unknown) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    dirty();
  };

  const updateContent = (id: string, content: JsonObject) => {
    updateSection(id, "content", content);
  };

  const deleteSection = (id: string) => {
    const section = sections.find((item) => item.id === id);
    if (section && requiredSectionKeys.has(section.section_key)) {
      setSaveStatus("error");
      setErrorMsg("This page-owned section cannot be deleted. Turn off its visibility to remove it from the live page.");
      return;
    }
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, _deleted: true } : s)));
    setInvalidJsonIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    dirty();
  };

  const appendSection = (key: string, type: string, content: JsonObject) => {
    const currentActive = sections.filter((s) => !s._deleted);
    const maxOrder = currentActive.reduce((max, s) => Math.max(max, s.sort_order), -1);
    const sectionId = `new_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const sectionKey = uniqueSectionKey(key, currentActive.map((section) => section.section_key));

    setSections((prev) => [
      ...prev,
      {
        id: sectionId,
        section_key: sectionKey,
        section_type: type,
        content,
        sort_order: maxOrder + 1,
        is_visible: true,
        _isNew: true,
      },
    ]);
    setExpandedIds((prev) => new Set(prev).add(sectionId));
    dirty();
  };

  const addTemplateSection = (template: SectionTemplate) => {
    appendSection(template.key, template.type, cloneContent(template.content));
  };

  const applyCompositionPreset = (preset: CompositionPreset) => {
    const existingKeys = new Set(activeKeys);
    const hasAdditions = preset.templateIds.some((templateId) => {
      const template = SECTION_TEMPLATES.find((item) => item.id === templateId);
      return Boolean(
        template
        && templateAppliesToPage(template, page)
        && !existingKeys.has(template.key),
      );
    });
    if (!hasAdditions) return;

    setSections((prev) => {
      const current = prev.filter((s) => !s._deleted);
      const existing = new Set(current.map((s) => s.section_key));
      let maxOrder = current.reduce((max, s) => Math.max(max, s.sort_order), -1);
      const additions: Section[] = [];

      for (const templateId of preset.templateIds) {
        const template = SECTION_TEMPLATES.find((t) => t.id === templateId);
        if (!template) continue;
        if (!templateAppliesToPage(template, page)) continue;
        if (existing.has(template.key)) continue;
        const key = uniqueSectionKey(template.key, [...existing]);
        existing.add(key);
        maxOrder += 1;
        additions.push({
          id: `new_${Date.now()}_${template.id}_${maxOrder}`,
          section_key: key,
          section_type: template.type,
          content: cloneContent(template.content),
          sort_order: maxOrder,
          is_visible: true,
          _isNew: true,
        });
      }

      if (additions.length === 0) return prev;
      return [...prev, ...additions];
    });
    dirty();
  };

  const duplicateSection = (section: Section) => {
    appendSection(`${section.section_key}_copy`, section.section_type, cloneContent(section.content));
  };

  const addMissingSections = () => {
    const currentActive = sections.filter((s) => !s._deleted);
    const existingKeys = currentActive.map((section) => section.section_key);
    let nextOrder = currentActive.reduce((max, s) => Math.max(max, s.sort_order), -1);
    const newSections = missingTemplates.map((template) => {
      nextOrder += 1;
      const sectionId = `new_${Date.now()}_${template.id}`;
      const sectionKey = uniqueSectionKey(template.key, existingKeys);
      existingKeys.push(sectionKey);
      return {
        id: sectionId,
        section_key: sectionKey,
        section_type: template.type,
        content: cloneContent(template.content),
        sort_order: nextOrder,
        is_visible: true,
        _isNew: true,
      };
    });

    setSections((prev) => [...prev, ...newSections]);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      newSections.forEach((section) => next.add(section.id));
      return next;
    });
    dirty();
  };

  const reorderSections = (orderedIds: string[]) => {
    setSections((prev) =>
      prev.map((s) => {
        const nextOrder = orderedIds.indexOf(s.id);
        if (nextOrder < 0) return s;
        return { ...s, sort_order: nextOrder };
      }),
    );
    dirty();
  };

  const addSection = () => {
    const sectionKey = cleanSectionKey(newKey || selectedTemplate?.key || "");
    if (!sectionKey) return;
    appendSection(
      sectionKey,
      newType,
      selectedTemplate ? cloneContent(selectedTemplate.content) : defaultContentForType(newType)
    );
    setNewKey("");
    setNewType("content");
    setNewTemplateId("");
    setAddOpen(false);
  };

  const openAddSection = () => {
    setNewKey("");
    setNewType("content");
    setNewTemplateId("");
    setAddOpen(true);
  };

  const handleSave = async () => {
    if (saveStatus === "saving" || !isDirty) return;
    if (invalidJsonIds.size > 0) {
      setSaveStatus("error");
      setErrorMsg("Fix the invalid section JSON before saving.");
      return;
    }
    setSaveStatus("saving");
    setErrorMsg("");
    try {
      const cleanTitle = title.trim();
      const targetSlug = isSystemSlug ? page.slug : slug.trim();
      if (!cleanTitle) throw new Error("Page title is required.");
      if (!targetSlug) throw new Error("Page slug is required.");

      const activeSectionKeys = sections
        .filter((section) => !section._deleted)
        .map((section) => cleanSectionKey(section.section_key));
      if (activeSectionKeys.some((key) => !key)) throw new Error("Every section needs a valid section key.");
      if (new Set(activeSectionKeys).size !== activeSectionKeys.length) {
        throw new Error("Section keys must be unique on this page.");
      }

      if (page.page_type === "solution") {
        const serviceProfile = sections.find(
          (section) => !section._deleted && section.section_key === "service_profile",
        )?.content;
        if (!serviceProfile) throw new Error("Every solution needs a Service Profile section.");
        if (typeof serviceProfile.category !== "string" || !serviceProfile.category.trim()) {
          throw new Error("Add a category in the Service Profile before saving.");
        }
        if (typeof serviceProfile.card_description !== "string" || !serviceProfile.card_description.trim()) {
          throw new Error("Add a catalog description in the Service Profile before saving.");
        }
        if (
          typeof serviceProfile.card_image === "string"
          && serviceProfile.card_image.trim()
          && (typeof serviceProfile.card_image_alt !== "string" || !serviceProfile.card_image_alt.trim())
        ) {
          throw new Error("Add image alt text for the Service Profile catalog image.");
        }
      }

      const publicationChanged =
        isPublished !== page.is_published
        || (supportsPublishScheduling && scheduledPublishAt !== initialScheduledPublishAt);
      if (publicationChanged && !canPublish) {
        throw new Error("Your role cannot change page publication settings.");
      }

      const nowIso = new Date().toISOString();
      const scheduleIso = supportsPublishScheduling && scheduledPublishAt
        ? new Date(scheduledPublishAt).toISOString()
        : null;
      const publishStatus = isPublished
        ? "published"
        : scheduleIso
          ? "scheduled"
          : "draft";

      const pageUpdate: Record<string, unknown> = {
        title: cleanTitle,
        slug: targetSlug,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDesc.trim() || null,
        updated_at: nowIso,
        sort_order: Number.isFinite(Number(catalogOrder)) ? Number(catalogOrder) : 0,
      };

      if (canPublish) {
        pageUpdate.is_published = supportsPublishScheduling
          ? isPublished || (scheduleIso != null && Date.parse(scheduleIso) <= Date.now())
          : isPublished;
        if (supportsPublishScheduling) {
          pageUpdate.publish_status = pageUpdate.is_published ? "published" : publishStatus;
          pageUpdate.scheduled_publish_at = pageUpdate.is_published ? null : scheduleIso;
          if (pageUpdate.is_published) pageUpdate.published_at = nowIso;
        }
      }

      const { error: pageErr } = await supabase.from("pages").update(pageUpdate).eq("id", page.id);
      if (pageErr && /publish_status|scheduled_publish_at|published_at/i.test(pageErr.message)) {
        if (scheduleIso) {
          throw new Error("Scheduled publishing is unavailable until the CMS publish-schedule migration is applied.");
        }
        const fallbackUpdate: Record<string, unknown> = {
          title: cleanTitle,
          slug: targetSlug,
          meta_title: metaTitle.trim() || null,
          meta_description: metaDesc.trim() || null,
          updated_at: nowIso,
          sort_order: Number.isFinite(Number(catalogOrder)) ? Number(catalogOrder) : 0,
        };
        if (canPublish) fallbackUpdate.is_published = Boolean(pageUpdate.is_published);
        const { error: fallbackErr } = await supabase.from("pages").update(fallbackUpdate).eq("id", page.id);
        if (fallbackErr) throw fallbackErr;
      } else if (pageErr) {
        throw pageErr;
      }

      if (page.page_type === "solution" && targetSlug !== page.slug) {
        const oldPath = publicPathForCmsPage(page.slug, page.page_type);
        const newPath = publicPathForCmsPage(targetSlug, page.page_type);
        const { error: navigationError } = await supabase
          .from("navigation_items")
          .update({ href: newPath, updated_at: nowIso })
          .eq("href", oldPath);
        if (navigationError) throw navigationError;
      }

      // Per-page SEO extras live in a reserved page_sections row (no schema migration required).
      const seoContent = {
        canonical_url: canonicalUrl.trim() || null,
        og_image_url: ogImage.trim() || null,
        twitter_image_url: twitterImage.trim() || null,
        favicon_url: faviconUrl.trim() || null,
      };
      const { data: existingSeo } = await supabase
        .from("page_sections")
        .select("id")
        .eq("page_id", page.id)
        .eq("section_key", PAGE_SEO_KEY)
        .maybeSingle();

      if (existingSeo?.id) {
        const { error } = await supabase
          .from("page_sections")
          .update({
            content: seoContent,
            section_type: "seo",
            is_visible: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSeo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("page_sections").insert({
          page_id: page.id,
          section_key: PAGE_SEO_KEY,
          section_type: "seo",
          content: seoContent,
          sort_order: 9999,
          is_visible: false,
        });
        if (error) throw error;
      }

      for (const s of sections.filter((s) => s._deleted && !s._isNew)) {
        const { error } = await supabase.from("page_sections").delete().eq("id", s.id);
        if (error) throw error;
      }

      const insertedIdMap = new Map<string, string>();
      for (const s of sections.filter((s) => s._isNew && !s._deleted)) {
        const { data: inserted, error } = await supabase.from("page_sections").insert({
          page_id: page.id,
          section_key: s.section_key,
          section_type: s.section_type,
          content: s.content,
          sort_order: s.sort_order,
          is_visible: s.is_visible,
        }).select("id").single();
        if (error) throw error;
        if (inserted?.id) insertedIdMap.set(s.id, inserted.id);
      }

      for (const s of sections.filter((s) => !s._isNew && !s._deleted)) {
        const { error } = await supabase.from("page_sections").update({
          section_key: s.section_key,
          section_type: s.section_type,
          content: s.content,
          sort_order: s.sort_order,
          is_visible: s.is_visible,
          updated_at: new Date().toISOString(),
        }).eq("id", s.id);
        if (error) throw error;
      }

      // Clear dirty flags / temp IDs so re-save doesn't re-insert
      setSections((prev) =>
        prev
          .filter((s) => !s._deleted)
          .map((s) => ({
            ...s,
            id: insertedIdMap.get(s.id) ?? s.id,
            _isNew: false,
            _deleted: false,
          }))
      );

      await writeAuditLog(supabase, {
        action: "cms.page_saved",
        entityType: "page",
        entityId: page.id,
        summary: `Saved ${cleanTitle || page.title}`,
        metadata: { slug: targetSlug, section_count: sections.filter((s) => !s._deleted).length },
      });

      // Invalidate tagged CMS cache (#31)
      const revalidateResponse = await fetch("/api/admin/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: targetSlug,
          tags: page.page_type === "solution" ? ["solution-catalog"] : [],
          paths: [
            ...(targetSlug === page.slug
              ? []
              : [publicPathForCmsPage(page.slug, page.page_type)]),
            ...(page.page_type === "solution"
              ? ["/solutions", "/solutions/find", "/sitemap.xml"]
              : []),
          ],
        }),
      });
      const revalidateResult = await revalidateResponse.json().catch(() => null) as { ok?: boolean; error?: string } | null;
      if (!revalidateResponse.ok || revalidateResult?.ok !== true) {
        throw new Error(
          `Content was saved, but the public page refresh failed${revalidateResult?.error ? `: ${revalidateResult.error}` : "."}`,
        );
      }

      setIsDirty(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
      if (!isSystemSlug && targetSlug !== page.slug) {
        router.replace(`/admin/cms/${targetSlug}`);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      setSaveStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Save failed");
    }
  };

  const previewUrl = publicPathForCmsPage(
    isSystemSlug ? page.slug : slug,
    page.page_type,
  );

  /* ═══ RENDER ═══ */

  return (
    <div className={showPreview ? "xl:flex xl:gap-6" : ""}>
      {/* ── Editor Panel ── */}
      <div
        className={showPreview ? "space-y-5 xl:w-1/2 xl:min-w-0" : "space-y-5"}
        aria-busy={saveStatus === "saving"}
        inert={saveStatus === "saving" ? true : undefined}
      >

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <FeaturedIcon icon={File02} color="brand" theme="light" size="md" className="shrink-0" />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold text-primary">{title}</h1>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <p className="text-xs text-quaternary">
                  {publicPathForCmsPage(isSystemSlug ? page.slug : slug, page.page_type)}
                </p>
                <span
                  aria-live="polite"
                  className={cx(
                    "text-xs font-medium",
                    isDirty ? "text-warning-primary" : saveStatus === "saved" ? "text-success-primary" : "text-quaternary",
                  )}
                >
                  {isDirty ? "Unsaved changes" : saveStatus === "saved" ? "All changes saved" : "No unsaved changes"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              color={showPreview ? "primary" : "secondary"}
              iconLeading={Monitor01}
              onClick={() => setShowPreview(!showPreview)}
            >
              Section preview
            </Button>
            <Button
              size="sm"
              iconLeading={Save01}
              isLoading={saveStatus === "saving"}
              isDisabled={!isDirty || saveStatus === "saving" || invalidJsonIds.size > 0}
              showTextWhileLoading
              onClick={handleSave}
            >
              {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save"}
            </Button>
          </div>
        </div>

        {/* Status */}
        {saveStatus === "error" && errorMsg && (
          <div className="flex items-center gap-2 rounded-lg bg-error-primary p-3 text-sm text-error-primary ring-1 ring-error_subtle ring-inset">
            <AlertCircle className="size-4 shrink-0" /> {errorMsg}
          </div>
        )}

        {page.page_type === "solution" && (
          <div className="rounded-xl bg-brand-primary_alt p-4 ring-1 ring-brand-secondary_alt ring-inset">
            <p className="text-sm font-semibold text-brand-secondary">One service, one source of truth</p>
            <p className="mt-1 text-xs leading-5 text-tertiary">
              Page Settings controls the public name, URL, search preview, publication, and catalog order. Service Profile controls the /solutions card, category, tags, finder matching, photo, and service schema. The remaining sections control everything on the service detail page.
            </p>
          </div>
        )}

        {/* Page Settings */}
        <details className="group overflow-hidden rounded-xl bg-primary ring-1 ring-secondary" open>
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 transition-colors hover:bg-secondary">
            <div className="flex items-center gap-3">
              <Pencil01 className="size-4 text-fg-quaternary" />
              <span className="text-sm font-semibold text-primary">Page Settings</span>
            </div>
            <ChevronDown className="size-4 text-fg-quaternary transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-4 border-t border-secondary p-5">
            <div className={cx("grid grid-cols-1 gap-4", page.page_type === "solution" ? "md:grid-cols-4" : "md:grid-cols-3")}>
              <Input
                label="Title"
                value={title}
                onChange={(value) => { setTitle(value); dirty(); }}
              />
              <Input
                label="Slug"
                value={slug}
                isDisabled={isSystemSlug}
                onChange={(value) => { setSlug(value.toLowerCase().replace(/[^\w-]/g, "")); dirty(); }}
                hint={isSystemSlug ? "This system page uses a fixed route and cannot be renamed." : "Changing this updates the public page URL."}
              />
              <Input
                label="Meta Title"
                placeholder="SEO title"
                value={metaTitle}
                onChange={(value) => { setMetaTitle(value); dirty(); }}
              />
              {page.page_type === "solution" && (
                <Input
                  label="Catalog order"
                  type="number"
                  value={catalogOrder}
                  onChange={(value) => { setCatalogOrder(value); dirty(); }}
                  hint="Lower numbers appear first within a category."
                />
              )}
            </div>
            <TextArea
              label="Meta Description"
              placeholder="SEO description (under 155 characters)"
              rows={2}
              value={metaDesc}
              onChange={(value) => { setMetaDesc(value); dirty(); }}
            />
            <Input
              label="Canonical URL"
              placeholder="https://icesales.com/page or /page"
              value={canonicalUrl}
              onChange={(value) => { setCanonicalUrl(value); dirty(); }}
              hint="Leave blank to use the default path for this page."
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary">Open Graph image</span>
                </div>
                {ogImage ? (
                  <div className="mb-2 overflow-hidden rounded-lg ring-1 ring-secondary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ogImage} alt="" className="h-24 w-full object-cover" />
                  </div>
                ) : null}
                <Button size="sm" color="secondary" iconLeading={Image01} onClick={() => setOgMediaOpen(true)}>
                  {ogImage ? "Change" : "Choose"} OG image
                </Button>
                {ogImage && (
                  <Button size="sm" color="link-color" className="ml-2" onClick={() => { setOgImage(""); dirty(); }}>
                    Clear
                  </Button>
                )}
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary">Twitter / Discord image</span>
                </div>
                {twitterImage ? (
                  <div className="mb-2 overflow-hidden rounded-lg ring-1 ring-secondary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={twitterImage} alt="" className="h-24 w-full object-cover" />
                  </div>
                ) : null}
                <Button size="sm" color="secondary" iconLeading={Image01} onClick={() => setTwitterMediaOpen(true)}>
                  {twitterImage ? "Change" : "Choose"} share image
                </Button>
                {twitterImage && (
                  <Button size="sm" color="link-color" className="ml-2" onClick={() => { setTwitterImage(""); dirty(); }}>
                    Clear
                  </Button>
                )}
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary">Page favicon override</span>
                </div>
                {faviconUrl ? (
                  <div className="mb-2 flex size-12 items-center justify-center overflow-hidden rounded-lg bg-secondary ring-1 ring-secondary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={faviconUrl} alt="" className="size-8 object-contain" />
                  </div>
                ) : (
                  <p className="mb-2 text-xs text-tertiary">Uses site default unless set.</p>
                )}
                <Button size="sm" color="secondary" iconLeading={Image01} onClick={() => setFaviconMediaOpen(true)}>
                  {faviconUrl ? "Change" : "Choose"} favicon
                </Button>
                {faviconUrl && (
                  <Button size="sm" color="link-color" className="ml-2" onClick={() => { setFaviconUrl(""); dirty(); }}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
              <Toggle
                size="sm"
                label={isPublished ? "Published" : supportsPublishScheduling && scheduledPublishAt ? "Scheduled" : "Draft"}
                isSelected={isPublished}
                isDisabled={!canPublish}
                hint={!canPublish ? "Your role cannot change publication settings." : undefined}
                onChange={(value) => { setIsPublished(value); dirty(); }}
              />
              {!isPublished && supportsPublishScheduling && (
                <Input
                  label="Schedule publish"
                  type="datetime-local"
                  value={scheduledPublishAt}
                  isDisabled={!canPublish}
                  onChange={(value) => { setScheduledPublishAt(value); dirty(); }}
                  hint={canPublish ? "Leave blank to keep this page as a draft." : "Your role cannot change the schedule."}
                />
              )}
              {!isPublished && !supportsPublishScheduling && (
                <p className="max-w-sm text-xs text-tertiary">
                  Scheduling requires the CMS publish-schedule migration. {canPublish
                    ? "You can still publish now or keep this page as a draft."
                    : "Publication settings are read-only for your role."}
                </p>
              )}
            </div>
            <MediaBrowserModal
              open={ogMediaOpen}
              onClose={() => setOgMediaOpen(false)}
              onSelect={(url) => { setOgImage(url); dirty(); setOgMediaOpen(false); }}
            />
            <MediaBrowserModal
              open={twitterMediaOpen}
              onClose={() => setTwitterMediaOpen(false)}
              onSelect={(url) => { setTwitterImage(url); dirty(); setTwitterMediaOpen(false); }}
            />
            <MediaBrowserModal
              open={faviconMediaOpen}
              onClose={() => setFaviconMediaOpen(false)}
              onSelect={(url) => { setFaviconUrl(url); dirty(); setFaviconMediaOpen(false); }}
            />
          </div>
        </details>

        {missingTemplates.length > 0 && (
          <div className="rounded-xl bg-brand-primary_alt p-5 ring-1 ring-secondary ring-inset">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-brand-secondary">Suggested sections</h2>
                <p className="mt-1 text-xs text-tertiary">
                  Add the standard editable sections for this page type.
                </p>
              </div>
              <Button size="sm" iconLeading={Plus} onClick={addMissingSections} className="shrink-0">
                Add All
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {missingTemplates.map((template) => (
                <Button
                  key={template.id}
                  size="sm"
                  color="secondary"
                  onClick={() => addTemplateSection(template)}
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {presetsForPageType(page.page_type).length > 0 && (
          <div className="rounded-xl bg-secondary p-5 ring-1 ring-secondary ring-inset">
            <h2 className="text-sm font-semibold text-primary">Composition presets</h2>
            <p className="mt-1 text-xs text-tertiary">
              Add a curated section stack. Existing keys are skipped so nothing is duplicated.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {presetsForPageType(page.page_type).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyCompositionPreset(preset)}
                  className="rounded-xl bg-primary p-4 text-left ring-1 ring-secondary transition hover:ring-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                >
                  <span className="text-sm font-semibold text-primary">{preset.label}</span>
                  <span className="mt-1 block text-xs text-tertiary">{preset.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sections */}
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-primary">
            <LayersTwo01 className="size-4 text-fg-quaternary" />
            Sections ({active.length})
          </h2>
          <Button size="sm" color="secondary" iconLeading={Plus} onClick={openAddSection}>
            Add Section
          </Button>
        </div>

        {active.length === 0 ? (
          <div className="rounded-xl bg-primary px-6 py-10 ring-1 ring-secondary">
            <EmptyState size="sm">
              <EmptyState.Header>
                <EmptyState.FeaturedIcon icon={LayersTwo01} color="gray" />
              </EmptyState.Header>
              <EmptyState.Content>
                <EmptyState.Title>No sections yet</EmptyState.Title>
                <EmptyState.Description>Add a section to start building this page.</EmptyState.Description>
              </EmptyState.Content>
            </EmptyState>
          </div>
        ) : (
          <SectionCanvasBuilder
            sections={active.map((s) => ({
              id: s.id,
              section_key: s.section_key,
              section_type: s.section_type,
              is_visible: s.is_visible,
              sort_order: s.sort_order,
            }))}
            expandedIds={expandedIds}
            typeColors={TYPE_COLORS}
            getTypeLabel={getTypeLabel}
            prettifyKey={prettifyKey}
            onReorder={reorderSections}
            onToggleExpand={toggleExpand}
            onToggleVisible={(id) => {
              const section = active.find((s) => s.id === id);
              if (section) updateSection(id, "is_visible", !section.is_visible);
            }}
            onDuplicate={(id) => {
              const section = active.find((s) => s.id === id);
              if (section) duplicateSection(section);
            }}
            onDelete={deleteSection}
            canReorder={canReorderSections}
            lockedSectionIds={active
              .filter((section) => requiredSectionKeys.has(section.section_key))
              .map((section) => section.id)}
            renderExpanded={(id) => {
              const section = active.find((s) => s.id === id);
              if (!section) return null;
              return (
                <div className="space-y-4 border-t border-secondary p-5">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Section Key"
                      size="sm"
                      value={section.section_key}
                      isDisabled={requiredSectionKeys.has(section.section_key)}
                      onChange={(value) => updateSection(section.id, "section_key", value)}
                    />
                    <NativeSelect
                      label="Type"
                      size="sm"
                      value={section.section_type}
                      disabled={requiredSectionKeys.has(section.section_key)}
                      onChange={(e) => updateSection(section.id, "section_type", e.target.value)}
                      options={SECTION_TYPES}
                    />
                  </div>
                  <ContentEditor
                    content={section.content}
                    schema={pageTemplates.find((template) => template.key === section.section_key)?.content}
                    onChange={(c) => updateContent(section.id, c)}
                    onValidityChange={(isValid) => {
                      setInvalidJsonIds((prev) => {
                        const next = new Set(prev);
                        if (isValid) next.delete(section.id);
                        else next.add(section.id);
                        return next;
                      });
                      if (!isValid) dirty();
                    }}
                  />
                </div>
              );
            }}
          />
        )}

        {/* Add Section Modal */}
        <ModalOverlay isDismissable isOpen={addOpen} onOpenChange={(open) => !open && setAddOpen(false)}>
          <Modal className="w-full max-w-md">
            <Dialog aria-label="Add section">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-primary">Add Section</h2>
                <div className="mt-5 space-y-4">
                  <NativeSelect
                    label="Starter Template"
                    value={newTemplateId}
                    onChange={(e) => {
                      const templateId = e.target.value;
                      const template = addableTemplates.find((item) => item.id === templateId);
                      setNewTemplateId(templateId);
                      if (template) {
                        setNewKey(template.key);
                        setNewType(template.type);
                      } else {
                        setNewKey("");
                        setNewType("content");
                      }
                    }}
                    options={[
                      { label: "Blank section", value: "" },
                      ...addableTemplates.map((template) => ({
                        label: `${template.label} — ${getTypeLabel(template.type)}${template.required ? " (recommended)" : ""}`,
                        value: template.id,
                      })),
                    ]}
                    hint={selectedTemplate?.description}
                  />
                  <Input
                    label="Section Name"
                    value={newKey}
                    isDisabled={Boolean(selectedTemplate)}
                    onChange={setNewKey}
                    placeholder="e.g. Hero Banner, Features, Call to Action"
                    hint={selectedTemplate ? "The selected template controls this section key." : newKey ? (
                      <span>
                        Key: {newKey.toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "")}
                      </span>
                    ) : undefined}
                  />
                  <NativeSelect
                    label="Section Type"
                    value={newType}
                    disabled={Boolean(selectedTemplate)}
                    onChange={(e) => setNewType(e.target.value)}
                    options={SECTION_TYPES}
                    hint={selectedTemplate ? "The selected template controls this section type." : undefined}
                  />
                  <div className="flex gap-3 pt-2">
                    <Button
                      className="flex-1"
                      onClick={addSection}
                      isDisabled={!newKey.trim() && !selectedTemplate}
                    >
                      Add Section
                    </Button>
                    <Button color="secondary" onClick={() => setAddOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </div>

      {/* ── Section Preview Panel (updates as you edit) ── */}
      {showPreview && (
        <div className="mt-6 h-[70vh] w-full xl:sticky xl:top-0 xl:mt-0 xl:h-[calc(100vh-8rem)] xl:w-1/2 xl:shrink-0">
          <div className="flex h-full flex-col overflow-hidden rounded-xl bg-primary ring-1 ring-secondary">
            <div className="flex shrink-0 items-center justify-between border-b border-secondary px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Monitor01 className="size-4 text-fg-quaternary" />
                <span className="text-xs font-medium text-tertiary">Section preview</span>
                <Badge size="sm" color="gray">Approximation</Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg bg-secondary p-0.5 ring-1 ring-secondary">
                  <button
                    type="button"
                    className={cx(
                      "rounded-md px-2 py-1 text-xs font-semibold transition",
                      previewDevice === "desktop"
                        ? "bg-primary text-primary shadow-xs"
                        : "text-tertiary hover:text-secondary",
                    )}
                    onClick={() => setPreviewDevice("desktop")}
                  >
                    Desktop
                  </button>
                  <button
                    type="button"
                    className={cx(
                      "rounded-md px-2 py-1 text-xs font-semibold transition",
                      previewDevice === "mobile"
                        ? "bg-primary text-primary shadow-xs"
                        : "text-tertiary hover:text-secondary",
                    )}
                    onClick={() => setPreviewDevice("mobile")}
                  >
                    Mobile
                  </button>
                </div>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-brand-secondary hover:text-brand-secondary_hover"
                >
                  Open published <LinkExternal01 className="size-3" />
                </a>
              </div>
            </div>
            <div className="flex flex-1 justify-center overflow-y-auto bg-secondary p-4">
              <div
                className={cx(
                  "origin-top overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary transition-all",
                  previewDevice === "mobile" ? "w-[390px] max-w-full" : "w-full",
                )}
              >
                <div
                  className={cx(
                    "origin-top transform bg-primary",
                    previewDevice === "desktop" && "scale-[0.85]",
                  )}
                  style={previewDevice === "desktop" ? { width: "117.6%" } : undefined}
                >
                  <GenericCMSSections
                    sections={active.filter((s) => s.is_visible)}
                    excludeKeys={[PAGE_SEO_KEY, "seo", "company_info", "footer"]}
                  />
                  {active.filter((s) => s.is_visible).length === 0 && (
                    <div className="px-6 py-16 text-center text-sm text-tertiary">
                      Add or show sections to preview this page.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CONTENT EDITOR
   ═══════════════════════════════════════════════════════════════════════ */

function ContentEditor({
  content,
  schema,
  onChange,
  onValidityChange,
}: {
  content: JsonObject;
  schema?: JsonObject;
  onChange: (c: JsonObject) => void;
  onValidityChange?: (isValid: boolean) => void;
}) {
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState(JSON.stringify(content, null, 2));
  const [jsonValid, setJsonValid] = useState(true);
  const [jsonError, setJsonError] = useState("");

  const toggleJson = () => {
    if (jsonMode) {
      try {
        const parsed: unknown = JSON.parse(jsonText);
        const validationError = validateSectionContent(parsed, schema);
        if (validationError) throw new Error(validationError);
        onChange(parsed as JsonObject);
        setJsonValid(true);
        setJsonError("");
        onValidityChange?.(true);
        setJsonMode(false);
      } catch (error) {
        setJsonValid(false);
        setJsonError(error instanceof Error ? error.message : "Invalid JSON");
        onValidityChange?.(false);
      }
    } else {
      setJsonText(JSON.stringify(content, null, 2));
      setJsonValid(true);
      setJsonError("");
      onValidityChange?.(true);
      setJsonMode(true);
    }
  };

  if (jsonMode) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium tracking-wide text-quaternary uppercase">JSON Editor</span>
          <Button size="sm" color="link-color" onClick={toggleJson}>
            {jsonValid ? "Switch to Fields" : "Fix JSON first"}
          </Button>
        </div>
        <TextAreaBase
          value={jsonText}
          onChange={(e) => {
            const value = e.target.value;
            setJsonText(value);
            try {
              const parsed: unknown = JSON.parse(value);
              const validationError = validateSectionContent(parsed, schema);
              if (validationError) throw new Error(validationError);
              setJsonValid(true);
              setJsonError("");
              onValidityChange?.(true);
              onChange(parsed as JsonObject);
            } catch (error) {
              setJsonValid(false);
              setJsonError(error instanceof Error ? error.message : "Invalid JSON");
              onValidityChange?.(false);
            }
          }}
          spellCheck={false}
          size="sm"
          className={cx(
            "min-h-[250px] resize-y font-mono text-xs leading-relaxed",
            !jsonValid && "ring-error_subtle focus:ring-2 focus:ring-error"
          )}
        />
        {!jsonValid && (
          <p className="flex items-center gap-1 text-xs text-error-primary">
            <AlertCircle className="size-3" /> {jsonError || "Invalid JSON"}
          </p>
        )}
      </div>
    );
  }

  const keys = Object.keys(content);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-quaternary uppercase">Content ({keys.length} fields)</span>
        <Button size="sm" color="link-color" onClick={toggleJson}>
          Edit as JSON
        </Button>
      </div>

      {keys.length === 0 && (
        <p className="py-3 text-center text-xs text-tertiary">No content fields. Add fields below or use JSON editor.</p>
      )}

      {keys.map((key) => (
        <FieldEditor key={key} fieldKey={key} value={content[key]}
          onChange={(val) => onChange({ ...content, [key]: val })}
          onDelete={() => { const n = { ...content }; delete n[key]; onChange(n); }}
        />
      ))}

      <AddFieldButton onAdd={(k, v) => onChange({ ...content, [k]: v })} existingKeys={keys} />
    </div>
  );
}

/* ── Field Editor ── */

function FieldEditor({ fieldKey, value, onChange, onDelete }: {
  fieldKey: string; value: unknown; onChange: (v: unknown) => void; onDelete: () => void;
}) {
  const [mediaBrowserOpen, setMediaBrowserOpen] = useState(false);
  const [illustrationPickerOpen, setIllustrationPickerOpen] = useState(false);
  const label = prettifyKey(fieldKey);
  const mediaField = isMediaKey(fieldKey);
  const iconField = isIconKey(fieldKey) && !mediaField;
  const illustrationField = isIllustrationKey(fieldKey) && !mediaField;

  if (typeof value === "string") {
    // Illustration picker field
    if (illustrationField) {
      const meta = value ? getIllustration(value) : null;
      return (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium text-secondary">
              {label}
              <Badge size="sm" color="brand">illustration</Badge>
            </span>
            <ButtonUtility size="xs" color="tertiary" icon={Trash01} tooltip="Remove field" onClick={onDelete} />
          </div>
          <div className="flex items-center gap-3">
            {value ? (
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary p-1 ring-1 ring-secondary ring-inset">
                <IllustrationRenderer id={value} className="h-full w-full" />
              </div>
            ) : (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-secondary ring-1 ring-secondary ring-inset">
                <Image01 className="size-5 text-fg-quaternary" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              {meta && <p className="truncate text-xs font-medium text-primary">{meta.name}</p>}
              {meta && <p className="truncate text-xs text-tertiary">{meta.category}</p>}
              <p className="mt-0.5 truncate text-xs text-quaternary">{value || "none selected"}</p>
              <Button
                size="sm"
                color="secondary"
                className="mt-1.5"
                onClick={() => setIllustrationPickerOpen(true)}
              >
                {value ? "Change Illustration" : "Pick Illustration"}
              </Button>
            </div>
          </div>
          <IllustrationPickerModal
            open={illustrationPickerOpen}
            current={value}
            onClose={() => setIllustrationPickerOpen(false)}
            onSelect={(id) => { onChange(id); setIllustrationPickerOpen(false); }}
          />
        </div>
      );
    }

    const isLong = value.length > 80 && !mediaField;
    return (
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-medium text-secondary">
            {label}
            {mediaField && <Image01 className="size-3 text-fg-quaternary" />}
          </span>
          <ButtonUtility size="xs" color="tertiary" icon={Trash01} tooltip="Remove field" onClick={onDelete} />
        </div>
        {iconField ? (
          <NativeSelect
            aria-label={label}
            size="sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            options={[
              ...(!ICON_NAMES.includes(value) && value ? [{ label: value, value }] : []),
              ...ICON_NAMES.map((name) => ({ label: name, value: name })),
            ]}
          />
        ) : isLong ? (
          <TextAreaBase
            aria-label={label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            size="sm"
            className="resize-y"
          />
        ) : (
          <div className="flex items-center gap-1.5">
            <InputBase
              aria-label={label}
              size="sm"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
            {mediaField && (
              <Button
                size="sm"
                color="secondary"
                className="shrink-0"
                onClick={() => setMediaBrowserOpen(true)}
              >
                Browse
              </Button>
            )}
          </div>
        )}
        {mediaField && typeof value === "string" && value && (value.startsWith("http") || value.startsWith("/")) && (
          <div className="mt-1.5 size-16 overflow-hidden rounded-lg bg-secondary ring-1 ring-secondary ring-inset">
            <img src={value} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
        )}
        {mediaField && (
          <MediaBrowserModal
            open={mediaBrowserOpen}
            onClose={() => setMediaBrowserOpen(false)}
            onSelect={(url) => { onChange(url); setMediaBrowserOpen(false); }}
            accept="image/*"
            title="Select Image"
          />
        )}
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-secondary">{label}</span>
          <ButtonUtility size="xs" color="tertiary" icon={Trash01} tooltip="Remove field" onClick={onDelete} />
        </div>
        <InputBase
          aria-label={label}
          type="number"
          size="sm"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between py-1">
        <span className="text-xs font-medium text-secondary">{label}</span>
        <div className="flex items-center gap-2">
          <Toggle
            size="sm"
            aria-label={label}
            isSelected={value}
            onChange={(v) => onChange(v)}
          />
          <ButtonUtility size="xs" color="tertiary" icon={Trash01} tooltip="Remove field" onClick={onDelete} />
        </div>
      </div>
    );
  }

  // Array of strings
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
    return (
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-secondary">
            {label} <span className="text-quaternary">({value.length})</span>
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" color="link-color" onClick={() => onChange([...value, ""])}>+ Add</Button>
            <ButtonUtility size="xs" color="tertiary" icon={Trash01} tooltip="Remove field" onClick={onDelete} />
          </div>
        </div>
        <div className="space-y-1.5">
          {value.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-5 shrink-0 text-right text-xs text-quaternary">{i + 1}</span>
              <InputBase
                aria-label={`${label} item ${i + 1}`}
                size="sm"
                value={item}
                onChange={(e) => { const n = [...value]; n[i] = e.target.value; onChange(n); }}
              />
              <ButtonUtility
                size="xs"
                color="tertiary"
                icon={Trash01}
                tooltip="Remove item"
                className="shrink-0"
                onClick={() => onChange(value.filter((_: string, j: number) => j !== i))}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Array of objects
  if (Array.isArray(value)) {
    return (
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-secondary">
            {label} <span className="text-quaternary">({value.length} items)</span>
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" color="link-color" onClick={() => {
              const tmpl = value.length > 0 ? Object.fromEntries(Object.keys(value[0]).map((k) => [k, typeof value[0][k] === "number" ? 0 : ""])) : {};
              onChange([...value, tmpl]);
            }}>+ Add Item</Button>
            <ButtonUtility size="xs" color="tertiary" icon={Trash01} tooltip="Remove field" onClick={onDelete} />
          </div>
        </div>
        <div className="space-y-2">
          {value.map((item, i) => (
            <div key={i} className="rounded-lg bg-secondary p-3 ring-1 ring-secondary ring-inset">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-quaternary">Item {i + 1}</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    color="link-color"
                    isDisabled={i === 0}
                    onClick={() => {
                      if (i === 0) return;
                      const next = [...value];
                      [next[i - 1], next[i]] = [next[i], next[i - 1]];
                      onChange(next);
                    }}
                  >
                    Move up
                  </Button>
                  <Button
                    size="sm"
                    color="link-color"
                    isDisabled={i === value.length - 1}
                    onClick={() => {
                      if (i === value.length - 1) return;
                      const next = [...value];
                      [next[i], next[i + 1]] = [next[i + 1], next[i]];
                      onChange(next);
                    }}
                  >
                    Move down
                  </Button>
                  <Button
                    size="sm"
                    color="link-destructive"
                    onClick={() => onChange(value.filter((_: unknown, j: number) => j !== i))}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              {typeof item === "object" && item !== null ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {Object.keys(item).map((k) => (
                    <SubFieldInput
                      key={k}
                      fieldKey={k}
                      value={item[k]}
                      onChange={(newVal) => { const n = [...value]; n[i] = { ...n[i], [k]: newVal }; onChange(n); }}
                    />
                  ))}
                  <div className="sm:col-span-2">
                    <AddFieldButton
                      existingKeys={Object.keys(item)}
                      onAdd={(key, nextValue) => {
                        const next = [...value];
                        next[i] = { ...next[i], [key]: nextValue };
                        onChange(next);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <InputBase
                  aria-label={`${label} item ${i + 1}`}
                  size="sm"
                  value={String(item)}
                  onChange={(e) => { const n = [...value]; n[i] = e.target.value; onChange(n); }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Nested object
  if (typeof value === "object" && value !== null) {
    const obj = value as JsonObject;
    return (
      <div className="rounded-lg bg-secondary p-3 ring-1 ring-secondary ring-inset">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-secondary">{label}</span>
          <ButtonUtility size="xs" color="tertiary" icon={Trash01} tooltip="Remove field" onClick={onDelete} />
        </div>
        <div className="space-y-2">
          {Object.keys(obj).map((k) => (
            <div key={k}>
              <div className="flex items-end gap-1.5">
                <div className="flex-1">
                  <SubFieldInput
                    fieldKey={k}
                    value={obj[k]}
                    onChange={(newVal) => onChange({ ...obj, [k]: newVal })}
                  />
                </div>
                <ButtonUtility
                  size="xs"
                  color="tertiary"
                  icon={Trash01}
                  tooltip="Remove property"
                  className="shrink-0"
                  onClick={() => { const n = { ...obj }; delete n[k]; onChange(n); }}
                />
              </div>
            </div>
          ))}
          <AddFieldButton
            existingKeys={Object.keys(obj)}
            onAdd={(key, nextValue) => onChange({ ...obj, [key]: nextValue })}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-secondary">{label}</span>
        <ButtonUtility size="xs" color="tertiary" icon={Trash01} tooltip="Remove field" onClick={onDelete} />
      </div>
      <InputBase
        aria-label={label}
        size="sm"
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/* ── Sub-field input with optional media browse ── */

function SubFieldInput({ fieldKey, value, onChange }: {
  fieldKey: string; value: unknown; onChange: (v: unknown) => void;
}) {
  const [mediaBrowserOpen, setMediaBrowserOpen] = useState(false);
  const mediaField = isMediaKey(fieldKey);
  const iconField = isIconKey(fieldKey) && !mediaField;
  const stringValue = String(value ?? "");
  const label = prettifyKey(fieldKey);

  // Nested arrays and objects (e.g. comparison.rows): delegate to the full
  // field editor so every level stays editable via structured controls.
  // Structural removal is handled by the containing object/array editor, so the
  // nested editor's own delete is a no-op here.
  if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
    return (
      <div className="sm:col-span-2">
        <FieldEditor fieldKey={fieldKey} value={value} onChange={onChange} onDelete={() => {}} />
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between gap-3 py-1">
        <span className="text-xs text-tertiary">{label}</span>
        <Toggle
          size="sm"
          aria-label={label}
          isSelected={value}
          onChange={onChange}
        />
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div>
        <span className="mb-0.5 block text-xs text-tertiary">{label}</span>
        <InputBase
          aria-label={label}
          type="number"
          size="sm"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
      </div>
    );
  }

  return (
    <div>
      <span className="mb-0.5 flex items-center gap-1 text-xs text-tertiary">
        {label}
        {mediaField && <Image01 className="size-3 text-fg-quaternary" />}
      </span>
      <div className="flex items-center gap-1">
        {iconField ? (
          <NativeSelect
            aria-label={label}
            size="sm"
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            options={[
              ...(stringValue && !ICON_NAMES.includes(stringValue) ? [{ label: stringValue, value: stringValue }] : []),
              ...ICON_NAMES.map((name) => ({ label: name, value: name })),
            ]}
          />
        ) : (
          <InputBase
            aria-label={label}
            size="sm"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
        {mediaField && (
          <ButtonUtility
            size="xs"
            icon={Image01}
            tooltip="Browse media library"
            className="shrink-0"
            onClick={() => setMediaBrowserOpen(true)}
          />
        )}
      </div>
      {mediaField && typeof value === "string" && value && (value.startsWith("http") || value.startsWith("/")) && (
        <div className="mt-1 size-10 overflow-hidden rounded-md bg-secondary ring-1 ring-secondary ring-inset">
          <img src={value} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      )}
      {mediaField && (
        <MediaBrowserModal
          open={mediaBrowserOpen}
          onClose={() => setMediaBrowserOpen(false)}
          onSelect={(url) => { onChange(url); setMediaBrowserOpen(false); }}
          accept="image/*"
          title="Select Image"
        />
      )}
    </div>
  );
}

/* ── Add Field ── */

function AddFieldButton({ onAdd, existingKeys }: { onAdd: (k: string, v: unknown) => void; existingKeys: string[] }) {
  type FieldType = "text" | "number" | "boolean" | "icon" | "image" | "illustration" | "list" | "items" | "object";
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [type, setType] = useState<FieldType>("text");

  const handleAdd = () => {
    const cleanKey = key.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "");
    const fieldKey = type === "illustration" ? "illustration" : type === "image" && !cleanKey ? "image" : cleanKey;
    if (!fieldKey || existingKeys.includes(fieldKey)) return;
    const defaults: Record<string, unknown> = { text: "", number: 0, boolean: false, icon: "Globe", image: "", illustration: "", list: [""], items: [{}], object: {} };
    onAdd(fieldKey, defaults[type]);
    setKey(""); setOpen(false);
  };

  if (!open) {
    return (
      <Button size="sm" color="link-color" iconLeading={Plus} onClick={() => setOpen(true)}>
        Add Field
      </Button>
    );
  }

  return (
    <div className="flex items-end gap-2 rounded-lg bg-secondary p-3 ring-1 ring-secondary ring-inset">
      <div className="flex-1">
        <span className="mb-0.5 block text-xs text-tertiary">Field Name</span>
        <InputBase
          aria-label="Field name"
          size="sm"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="e.g. Headline"
        />
        {key && <p className="mt-0.5 text-xs text-quaternary">{key.toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "")}</p>}
      </div>
      <div className="w-32">
        <span className="mb-0.5 block text-xs text-tertiary">Type</span>
        <NativeSelect
          aria-label="Field type"
          size="sm"
          value={type}
          onChange={(e) => setType(e.target.value as FieldType)}
          options={[
            { label: "Text", value: "text" },
            { label: "Number", value: "number" },
            { label: "Toggle", value: "boolean" },
            { label: "Icon", value: "icon" },
            { label: "Image", value: "image" },
            { label: "Illustration", value: "illustration" },
            { label: "List", value: "list" },
            { label: "Items", value: "items" },
            { label: "Object", value: "object" },
          ]}
        />
      </div>
      <Button size="sm" className="shrink-0" onClick={handleAdd} isDisabled={!key.trim() && type !== "illustration"}>
        Add
      </Button>
      <Button size="sm" color="tertiary" className="shrink-0" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </div>
  );
}
