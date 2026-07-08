"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Copy01,
  Eye,
  EyeOff,
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
import { getIllustration } from "@/lib/illustrations";
import { getIconNames } from "@/lib/iconMap";

/* ═══════════════════════════════════════════════════════════════════════ */

interface PageMeta {
  id: string;
  title: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  page_type: string;
  is_published: boolean;
}

interface Section {
  id: string;
  section_key: string;
  section_type: string;
  content: Record<string, any>;
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
  content: Record<string, any>;
  slugs?: string[];
  pageTypes?: string[];
  excludePageTypes?: string[];
  required?: boolean;
}

const SECTION_TYPES = [
  { value: "hero", label: "Hero Banner" },
  { value: "content", label: "Content Block" },
  { value: "features", label: "Features Grid" },
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
  { value: "custom", label: "Custom" },
];

const TYPE_COLORS: Record<string, BadgeColor<"pill-color">> = {
  hero: "brand",
  content: "success",
  features: "purple",
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
  custom: "gray",
};

const ICON_NAMES = getIconNames();

const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: "hero",
    label: "Hero",
    description: "Top page headline, supporting copy, calls to action, and proof-label trust bar.",
    key: "hero",
    type: "hero",
    required: true,
    content: {
      eyebrow: "IBM Business Partner Since 1990",
      headline: "Page headline",
      subheadline: "Short page introduction.",
      cta_primary: { label: "Get Started", href: "/contact" },
      cta_secondary: { label: "Explore Solutions", href: "/solutions" },
      proof_labels: ["35+ Years in Business", "SOC 2 Type II", "24/7/365 US-Based Support"],
    },
  },
  {
    id: "home-services",
    label: "Home Services Grid",
    description: "Four solution cards used on the home page.",
    key: "services_grid",
    type: "features",
    slugs: ["home"],
    required: true,
    content: {
      eyebrow: "What We Do",
      heading: "Enterprise-Grade Solutions",
      description: "End-to-end technology solutions engineered for reliability, security, and performance.",
      items: [
        { icon: "Cloud", title: "Managed Cloud Services", description: "Cloud hosting, private cloud, hybrid cloud, and migration services.", href: "/solutions/managed-cloud-hosting" },
        { icon: "Shield", title: "Data Protection", description: "Backup, disaster recovery, high availability, and ransomware recovery.", href: "/solutions/backup-as-a-service" },
        { icon: "Lock", title: "Managed Security", description: "IBM i security, endpoint protection, threat detection, and monitoring.", href: "/solutions/ibm-i-security" },
        { icon: "Server", title: "Managed Services", description: "Microsoft services, automation, systems management, and IBM Power VS.", href: "/solutions/managed-microsoft" },
      ],
    },
  },
  {
    id: "stats",
    label: "Stats",
    description: "Number cards for proof points and performance claims.",
    key: "stats",
    type: "stats",
    excludePageTypes: ["solution"],
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
      partners: ["IBM", "Lenovo", "Cisco", "Dell"],
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
    description: "Categories and service cards for the solutions overview page.",
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
          services: [
            { title: "Managed Cloud Hosting", href: "/solutions/managed-cloud-hosting", icon: "Cloud", description: "Enterprise cloud hosting with 24/7 support." },
          ],
        },
      ],
    },
  },
  {
    id: "partners-intro",
    label: "Partners Intro",
    description: "Intro copy beside the image on the partners page.",
    key: "intro",
    type: "content",
    slugs: ["partners", "contact"],
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
      cta_primary: { label: "Contact Us", href: "/contact" },
      cta_secondary: { label: "Explore Solutions", href: "/solutions" },
    },
  },
  {
    id: "solution-related",
    label: "Related Services",
    description: "Three link cards pointing to complementary services.",
    key: "related",
    type: "related",
    pageTypes: ["solution"],
    required: true,
    content: {
      heading: "Related Services",
      items: [
        { title: "Managed Cloud Hosting", description: "Enterprise cloud hosting with 24/7 support.", href: "/solutions/managed-cloud-hosting", icon: "Cloud" },
        { title: "Backup as a Service", description: "Automated, verified backups for critical data.", href: "/solutions/backup-as-a-service", icon: "Shield" },
        { title: "Disaster Recovery", description: "Tested recovery plans with guaranteed RTOs.", href: "/solutions/disaster-recovery", icon: "RefreshCw" },
      ],
    },
  },
  {
    id: "final-cta",
    label: "Final CTA",
    description: "Closing call to action with one or two buttons.",
    key: "final_cta",
    type: "cta",
    excludePageTypes: ["solution"],
    required: true,
    content: {
      heading: "Ready to Get Started?",
      description: "Talk with our team about your goals and requirements.",
      cta_primary: { label: "Contact Us", href: "/contact" },
      cta_secondary: { label: "Explore Solutions", href: "/solutions" },
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

function cloneContent(content: Record<string, any>): Record<string, any> {
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
  const typeMatch = !template.pageTypes || template.pageTypes.includes(page.page_type);
  const notExcluded = !template.excludePageTypes || !template.excludePageTypes.includes(page.page_type);
  return slugMatch && typeMatch && notExcluded;
}

function defaultContentForType(type: string): Record<string, any> {
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
  return { heading: "Section Heading", description: "Section content." };
}

/* ═══════════════════════════════════════════════════════════════════════ */

export default function CMSPageEditor({
  page,
  initialSections,
}: {
  page: PageMeta;
  initialSections: Section[];
}) {
  const router = useRouter();
  const supabase = createClient();

  // Page meta
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [metaTitle, setMetaTitle] = useState(page.meta_title ?? "");
  const [metaDesc, setMetaDesc] = useState(page.meta_description ?? "");
  const [isPublished, setIsPublished] = useState(page.is_published);

  // Sections
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState("content");
  const [newTemplateId, setNewTemplateId] = useState("");

  // Preview
  const [showPreview, setShowPreview] = useState(false);

  const active = sections.filter((s) => !s._deleted).sort((a, b) => a.sort_order - b.sort_order);
  const activeKeys = active.map((section) => section.section_key);
  const pageTemplates = useMemo(
    () => SECTION_TEMPLATES.filter((template) => templateAppliesToPage(template, page)),
    [page.slug, page.page_type]
  );
  const selectedTemplate = pageTemplates.find((template) => template.id === newTemplateId);
  const missingTemplates = pageTemplates.filter(
    (template) => template.required && !activeKeys.includes(template.key)
  );

  const dirty = () => { if (saveStatus === "saved") setSaveStatus("idle"); };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const updateSection = (id: string, field: keyof Section, value: unknown) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    dirty();
  };

  const updateContent = (id: string, content: Record<string, any>) => {
    updateSection(id, "content", content);
  };

  const deleteSection = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, _deleted: true } : s)));
    dirty();
  };

  const appendSection = (key: string, type: string, content: Record<string, any>) => {
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

  const moveSection = (idx: number, dir: "up" | "down") => {
    const t = dir === "up" ? idx - 1 : idx + 1;
    if (t < 0 || t >= active.length) return;
    const a = active[idx], b = active[t];
    setSections((prev) => prev.map((s) => {
      if (s.id === a.id) return { ...s, sort_order: b.sort_order };
      if (s.id === b.id) return { ...s, sort_order: a.sort_order };
      return s;
    }));
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

  const handleSave = async () => {
    setSaveStatus("saving");
    setErrorMsg("");
    try {
      const { error: pageErr } = await supabase.from("pages").update({
        title: title.trim(), slug: slug.trim(),
        meta_title: metaTitle.trim() || null,
        meta_description: metaDesc.trim() || null, is_published: isPublished,
        updated_at: new Date().toISOString(),
      }).eq("id", page.id);
      if (pageErr) throw pageErr;

      for (const s of sections.filter((s) => s._deleted && !s._isNew)) {
        const { error } = await supabase.from("page_sections").delete().eq("id", s.id);
        if (error) throw error;
      }
      for (const s of sections.filter((s) => s._isNew && !s._deleted)) {
        const { error } = await supabase.from("page_sections").insert({
          page_id: page.id, section_key: s.section_key, section_type: s.section_type,
          content: s.content, sort_order: s.sort_order, is_visible: s.is_visible,
        });
        if (error) throw error;
      }
      for (const s of sections.filter((s) => !s._isNew && !s._deleted)) {
        const { error } = await supabase.from("page_sections").update({
          section_key: s.section_key, section_type: s.section_type, content: s.content,
          sort_order: s.sort_order, is_visible: s.is_visible, updated_at: new Date().toISOString(),
        }).eq("id", s.id);
        if (error) throw error;
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
      router.refresh();
    } catch (err: unknown) {
      setSaveStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Save failed");
    }
  };

  const previewUrl = page.page_type === "solution"
    ? `/solutions/${slug}`
    : slug === "home" ? "/" : `/${slug}`;

  /* ═══ RENDER ═══ */

  return (
    <div className={showPreview ? "flex gap-6" : ""}>
      {/* ── Editor Panel ── */}
      <div className={showPreview ? "w-1/2 min-w-0 space-y-5" : "space-y-5"}>

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <FeaturedIcon icon={File02} color="brand" theme="light" size="md" className="shrink-0" />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold text-primary">{title}</h1>
              <p className="font-mono text-xs text-quaternary">/{slug}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              color={showPreview ? "primary" : "secondary"}
              iconLeading={Monitor01}
              onClick={() => setShowPreview(!showPreview)}
            >
              Preview
            </Button>
            <Button
              size="sm"
              iconLeading={Save01}
              isLoading={saveStatus === "saving"}
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input
                label="Title"
                value={title}
                onChange={(value) => { setTitle(value); dirty(); }}
              />
              <Input
                label="Slug"
                value={slug}
                onChange={(value) => { setSlug(value.toLowerCase().replace(/[^\w-]/g, "")); dirty(); }}
                inputClassName="font-mono text-sm"
              />
              <Input
                label="Meta Title"
                placeholder="SEO title"
                value={metaTitle}
                onChange={(value) => { setMetaTitle(value); dirty(); }}
              />
            </div>
            <TextArea
              label="Meta Description"
              placeholder="SEO description"
              rows={2}
              value={metaDesc}
              onChange={(value) => { setMetaDesc(value); dirty(); }}
            />
            <Toggle
              size="sm"
              label={isPublished ? "Published" : "Draft"}
              isSelected={isPublished}
              onChange={(value) => { setIsPublished(value); dirty(); }}
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

        {/* Sections */}
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-primary">
            <LayersTwo01 className="size-4 text-fg-quaternary" />
            Sections ({active.length})
          </h2>
          <Button size="sm" color="secondary" iconLeading={Plus} onClick={() => setAddOpen(true)}>
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
          <div className="space-y-2">
            {active.map((section, idx) => {
              const isExpanded = expandedIds.has(section.id);
              const badgeColor = TYPE_COLORS[section.section_type] ?? TYPE_COLORS.custom;

              return (
                <div
                  key={section.id}
                  className={cx(
                    "overflow-hidden rounded-xl bg-primary ring-1 ring-secondary transition-colors",
                    !section.is_visible && "opacity-60"
                  )}
                >
                  {/* Section header */}
                  <div
                    className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary"
                    onClick={() => toggleExpand(section.id)}
                  >
                    {/* Reorder (stop propagation so clicking arrows doesn't toggle) */}
                    <div className="flex shrink-0 flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        aria-label="Move section up"
                        onClick={() => moveSection(idx, "up")}
                        disabled={idx === 0}
                        className="cursor-pointer rounded p-0.5 text-fg-quaternary transition-colors hover:text-fg-quaternary_hover disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        <ArrowUp className="size-3" />
                      </button>
                      <button
                        type="button"
                        aria-label="Move section down"
                        onClick={() => moveSection(idx, "down")}
                        disabled={idx === active.length - 1}
                        className="cursor-pointer rounded p-0.5 text-fg-quaternary transition-colors hover:text-fg-quaternary_hover disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        <ArrowDown className="size-3" />
                      </button>
                    </div>

                    {/* Name + type */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-primary">{prettifyKey(section.section_key)}</span>
                        <Badge size="sm" color={badgeColor}>
                          {getTypeLabel(section.section_type)}
                        </Badge>
                      </div>
                      <span className="font-mono text-xs text-quaternary">{section.section_key}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <ButtonUtility
                        size="xs"
                        color="tertiary"
                        icon={section.is_visible ? Eye : EyeOff}
                        tooltip={section.is_visible ? "Hide section" : "Show section"}
                        onClick={() => updateSection(section.id, "is_visible", !section.is_visible)}
                      />
                      <ButtonUtility
                        size="xs"
                        color="tertiary"
                        icon={Copy01}
                        tooltip="Duplicate section"
                        onClick={() => duplicateSection(section)}
                      />
                      <ButtonUtility
                        size="xs"
                        color="tertiary"
                        icon={Trash01}
                        tooltip="Delete section"
                        onClick={() => deleteSection(section.id)}
                      />
                      <ChevronDown className={cx("size-4 text-fg-quaternary transition-transform", isExpanded && "rotate-180")} />
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="space-y-4 border-t border-secondary p-5">
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Section Key"
                          size="sm"
                          value={section.section_key}
                          onChange={(value) => updateSection(section.id, "section_key", value)}
                          inputClassName="font-mono"
                        />
                        <NativeSelect
                          label="Type"
                          size="sm"
                          value={section.section_type}
                          onChange={(e) => updateSection(section.id, "section_type", e.target.value)}
                          options={SECTION_TYPES}
                        />
                      </div>

                      <ContentEditor
                        content={section.content}
                        onChange={(c) => updateContent(section.id, c)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
                      const template = pageTemplates.find((item) => item.id === templateId);
                      setNewTemplateId(templateId);
                      if (template) {
                        setNewKey(template.key);
                        setNewType(template.type);
                      }
                    }}
                    options={[
                      { label: "Blank section", value: "" },
                      ...pageTemplates.map((template) => ({ label: template.label, value: template.id })),
                    ]}
                    hint={selectedTemplate?.description}
                  />
                  <Input
                    label="Section Name"
                    value={newKey}
                    onChange={setNewKey}
                    placeholder="e.g. Hero Banner, Features, Call to Action"
                    hint={newKey ? (
                      <span className="font-mono">
                        Key: {newKey.toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "")}
                      </span>
                    ) : undefined}
                  />
                  <NativeSelect
                    label="Section Type"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    options={SECTION_TYPES}
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

      {/* ── Preview Panel ── */}
      {showPreview && (
        <div className="sticky top-0 h-[calc(100vh-8rem)] w-1/2 shrink-0">
          <div className="flex h-full flex-col overflow-hidden rounded-xl bg-primary ring-1 ring-secondary">
            <div className="flex shrink-0 items-center justify-between border-b border-secondary px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Monitor01 className="size-4 text-fg-quaternary" />
                <span className="text-xs font-medium text-tertiary">Live Preview</span>
              </div>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium text-brand-secondary hover:text-brand-secondary_hover"
              >
                Open in new tab <LinkExternal01 className="size-3" />
              </a>
            </div>
            <div className="flex-1 bg-primary">
              <iframe
                src={previewUrl}
                className="h-full w-full border-0"
                title="Page Preview"
              />
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

function ContentEditor({ content, onChange }: { content: Record<string, any>; onChange: (c: Record<string, any>) => void }) {
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState(JSON.stringify(content, null, 2));
  const [jsonValid, setJsonValid] = useState(true);

  const toggleJson = () => {
    if (jsonMode) {
      try { const parsed = JSON.parse(jsonText); onChange(parsed); setJsonMode(false); } catch { /* stay in json */ }
    } else {
      setJsonText(JSON.stringify(content, null, 2));
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
          onChange={(e) => { setJsonText(e.target.value); try { JSON.parse(e.target.value); setJsonValid(true); onChange(JSON.parse(e.target.value)); } catch { setJsonValid(false); } }}
          spellCheck={false}
          size="sm"
          className={cx(
            "min-h-[250px] resize-y font-mono text-xs leading-relaxed",
            !jsonValid && "ring-error_subtle focus:ring-2 focus:ring-error"
          )}
        />
        {!jsonValid && (
          <p className="flex items-center gap-1 text-xs text-error-primary">
            <AlertCircle className="size-3" /> Invalid JSON
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
              <p className="mt-0.5 truncate font-mono text-xs text-quaternary">{value || "none selected"}</p>
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
                <Button
                  size="sm"
                  color="link-destructive"
                  onClick={() => onChange(value.filter((_: any, j: number) => j !== i))}
                >
                  Remove
                </Button>
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
    const obj = value as Record<string, any>;
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
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [type, setType] = useState<"text" | "number" | "boolean" | "icon" | "illustration" | "list" | "items" | "object">("text");

  const handleAdd = () => {
    const cleanKey = key.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "");
    if (!cleanKey || existingKeys.includes(cleanKey)) return;
    const defaults: Record<string, unknown> = { text: "", number: 0, boolean: false, icon: "Globe", illustration: "", list: [""], items: [{}], object: {} };
    onAdd(type === "illustration" ? "illustration" : cleanKey, defaults[type]);
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
        {key && <p className="mt-0.5 font-mono text-xs text-quaternary">{key.toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "")}</p>}
      </div>
      <div className="w-32">
        <span className="mb-0.5 block text-xs text-tertiary">Type</span>
        <NativeSelect
          aria-label="Field type"
          size="sm"
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          options={[
            { label: "Text", value: "text" },
            { label: "Number", value: "number" },
            { label: "Toggle", value: "boolean" },
            { label: "Icon", value: "icon" },
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
