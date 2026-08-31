"use client";

import { useEffect, useMemo, useState, type FC } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Cloud01,
  CpuChip01,
  Database01,
  Dataflow01,
  HardDrive,
  Lock01,
  Monitor01,
  RefreshCw01,
  Server01,
  Settings01,
  Shield01,
  ShieldTick,
  ShieldZap,
  Target04,
  Zap,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { SOLUTION_HERO_IMAGE_BY_SLUG } from "@/lib/solutionHeroImages";
import { pushEvent } from "@/lib/analytics";
import { cx } from "@/utils/cx";
import { resolveIcon } from "@/lib/iconMap";
import type { SolutionCatalogItem } from "@/lib/cms/solutionCatalog";

type IconComponent = FC<{ className?: string }>;
type AnswerKey = "industry" | "workload" | "pain" | "continuity" | "compliance" | "team" | "timeline";
type Answers = Partial<Record<AnswerKey, string>>;
type WeightKey = "cost" | "uptime" | "security" | "speed" | "compliance" | "scalability" | "operations";
type GoalId =
  | "downtime"
  | "modernize"
  | "security"
  | "cost"
  | "ransomware"
  | "operations"
  | "compliance"
  | "scale";

interface Option {
  id: string;
  label: string;
  detail: string;
}

interface Question {
  key: AnswerKey;
  eyebrow: string;
  prompt: string;
  options: Option[];
}

interface Goal {
  id: GoalId;
  label: string;
  detail: string;
  weight: WeightKey;
  tags: string[];
}

interface ProblemStarter {
  id: string;
  label: string;
  detail: string;
  answers: Answers;
  goals: GoalId[];
}

interface FinderQuestionCopy {
  key: AnswerKey;
  eyebrow?: string;
  prompt?: string;
  options?: Array<{
    id: string;
    label?: string;
    detail?: string;
  }>;
}

interface FinderGoalCopy {
  id: GoalId;
  label?: string;
  detail?: string;
}

interface FinderStarterCopy {
  id: string;
  label?: string;
  detail?: string;
}

interface FinderSolutionCopy {
  slug: string;
  title?: string;
  category?: string;
  summary?: string;
  proof?: string;
  timeline?: string;
  complexity?: "Low" | "Medium" | "High";
  role?: string;
  cta_label?: string;
  next_step?: string;
}

interface FinderStageCopy {
  label?: string;
  start: number;
  end: number;
}

interface FinderModeCopy {
  label?: string;
  detail?: string;
}

type TextOverrides<T> = {
  [Key in keyof T]?: string;
};

type TextValues<T> = {
  [Key in keyof T]: string;
};

export interface SolutionFinderContent {
  questions?: FinderQuestionCopy[];
  goals?: FinderGoalCopy[];
  problem_starters?: FinderStarterCopy[];
  solution_copy?: FinderSolutionCopy[];
  modes?: {
    quick?: FinderModeCopy;
    advanced?: FinderModeCopy;
  };
  stages?: {
    quick?: FinderStageCopy[];
    advanced?: FinderStageCopy[];
  };
  chooser?: TextOverrides<typeof DEFAULT_FINDER_COPY.chooser>;
  shortcut?: TextOverrides<typeof DEFAULT_FINDER_COPY.shortcut>;
  questionnaire?: TextOverrides<typeof DEFAULT_FINDER_COPY.questionnaire>;
  situation?: TextOverrides<typeof DEFAULT_FINDER_COPY.situation>;
  fine_tune?: TextOverrides<typeof DEFAULT_FINDER_COPY.fineTune>;
  results?: TextOverrides<typeof DEFAULT_FINDER_COPY.results>;
  cards?: TextOverrides<typeof DEFAULT_FINDER_COPY.cards>;
  reasons?: TextOverrides<typeof DEFAULT_FINDER_COPY.reasons>;
  weight_labels?: Partial<Record<WeightKey, string>>;
}

interface SolutionProfile {
  slug: string;
  title: string;
  category: string;
  href: string;
  icon: IconComponent;
  summary: string;
  proof: string;
  tags: string[];
  outcomes: GoalId[];
  industries: string[];
  workloads: string[];
  complexity: "Low" | "Medium" | "High";
  timeline: string;
  role: string;
  ctaLabel: string;
  nextStep: string;
  image?: string;
  imageConfigured?: boolean;
}

interface RankedSolution extends SolutionProfile {
  score: number;
  fit: number;
  reasons: string[];
}

type View = "recommendations" | "stack" | "compare" | "plan";
type FinderMode = "quick" | "advanced";

const DEFAULT_WEIGHTS: Record<WeightKey, number> = {
  cost: 45,
  uptime: 70,
  security: 70,
  speed: 50,
  compliance: 55,
  scalability: 55,
  operations: 65,
};

const DEFAULT_FINDER_COPY = {
  chooser: {
    eyebrow: "Choose your path",
    heading: "How much guidance do you want?",
    reset_label: "Start over",
  },
  shortcut: {
    eyebrow: "Optional shortcut",
    heading: "Start from the pressure",
    description: "Choose a common situation to pre-fill two answers, then confirm the details below.",
  },
  questionnaire: {
    answered_template: "{answered}/{total} answered",
    stage_questions_template: "Questions {start}-{end}",
    back_label: "Back",
    continue_label: "Continue",
    recommendations_label: "View recommendations",
    no_questions_heading: "No questions are configured",
    no_questions_description: "Add at least one valid question to the finder section in the CMS.",
  },
  situation: {
    eyebrow: "Your situation",
    fit_found_template: "{fit_label} found",
    remaining_singular_template: "Answer {count} more question",
    remaining_plural_template: "Answer {count} more questions",
    ready_description:
      "This is questionnaire alignment, not a technical guarantee. ICE will validate architecture, risk, and scope.",
    waiting_description: "We’ll wait for at least three answers before suggesting a solution.",
    edit_label: "Edit",
    empty_answers: "Your answers will stay visible here as you go.",
  },
  fineTune: {
    eyebrow: "Optional",
    heading: "Fine-tune recommendations",
    description: "Add outcomes and adjust priorities only if they matter to your decision.",
  },
  results: {
    empty_heading: "Your recommendation will appear here",
    empty_description:
      "Answer at least three questions so the finder has enough context to identify a useful starting point.",
    eyebrow: "Your shortlist",
    heading: "Start here, then explore two supporting options",
    description:
      "Fit labels show alignment with your answers. They are directional and should be validated in discovery.",
    contact_label: "Talk with a specialist",
    supporting_heading: "Supporting options",
    supporting_description:
      "These can complement the starting solution or fit a different delivery preference.",
  },
  cards: {
    strong_fit: "Strong fit",
    good_fit: "Good fit",
    potential_fit: "Potential fit",
    featured_eyebrow: "Recommended starting point",
    why_heading: "Why it fits",
    explore_template: "Explore {title}",
  },
  reasons: {
    matches_template: "Matches {label}",
    strict_recovery: "Built for strict recovery tolerance",
    recovery_window: "Fits recovery-window planning",
    regulated: "Supports regulated environments",
    operating_load: "Reduces internal operating load",
    stabilization: "Fast path to stabilization",
    role_template: "Fits the {role} need",
    timeline_template: "Supports a {timeline} planning window",
    broad_discovery: "Broad discovery fit",
  },
} as const;

const DEFAULT_MODE_COPY: Record<FinderMode, Required<FinderModeCopy>> = {
  quick: {
    label: "Quick match",
    detail: "Four plain-language questions. Best when you want a clear place to start.",
  },
  advanced: {
    label: "Detailed assessment",
    detail: "Seven questions plus optional goals and priority controls.",
  },
};

const DEFAULT_STAGE_COPY: Record<FinderMode, FinderStageCopy[]> = {
  quick: [
    { label: "Your environment", start: 0, end: 1 },
    { label: "Business risk", start: 2, end: 3 },
  ],
  advanced: [
    { label: "Your environment", start: 0, end: 1 },
    { label: "Business risk", start: 2, end: 4 },
    { label: "Timing and resources", start: 5, end: 6 },
  ],
};

const DEFAULT_WEIGHT_LABELS: Record<WeightKey, string> = {
  cost: "Cost",
  uptime: "Uptime",
  security: "Security",
  speed: "Speed",
  compliance: "Compliance",
  scalability: "Scalability",
  operations: "Operations",
};

const QUESTIONS: Question[] = [
  {
    key: "industry",
    eyebrow: "Industry path",
    prompt: "What industry are you in?",
    options: [
      { id: "healthcare", label: "Healthcare", detail: "HIPAA-ready resiliency, secure access, and recovery assurance." },
      { id: "finance", label: "Finance", detail: "Compliance, uptime, auditability, and risk controls." },
      { id: "manufacturing", label: "Manufacturing", detail: "Plant uptime, legacy systems, and operational continuity." },
      { id: "logistics", label: "Logistics", detail: "Always-on operations across distributed locations." },
      { id: "legal", label: "Legal", detail: "Secure documents, availability, retention, and endpoint protection." },
      { id: "general", label: "General business", detail: "Balanced managed IT, cloud, and security recommendations." },
    ],
  },
  {
    key: "workload",
    eyebrow: "Current platform",
    prompt: "Which platform matters most?",
    options: [
      { id: "ibm-i", label: "IBM i / Power", detail: "IBM i, AIX, IBM Power, or Power Virtual Server." },
      { id: "microsoft", label: "Microsoft / Azure", detail: "Microsoft 365, Azure, Windows Server, or Active Directory." },
      { id: "hybrid", label: "Hybrid estate", detail: "On-prem, cloud, and legacy systems all need to work together." },
      { id: "distributed", label: "Endpoints and sites", detail: "Many users, locations, devices, or branch environments." },
      { id: "unsure", label: "Not sure yet", detail: "Start with discovery and architecture validation." },
    ],
  },
  {
    key: "pain",
    eyebrow: "Primary pressure",
    prompt: "What problem needs attention first?",
    options: [
      { id: "backup", label: "Backups feel risky", detail: "Restore confidence, retention, and validated recovery." },
      { id: "outages", label: "Downtime is expensive", detail: "Availability, failover, and continuity planning." },
      { id: "ransomware", label: "Ransomware exposure", detail: "Immutable recovery, monitoring, and containment." },
      { id: "migration", label: "Modernization project", detail: "Migration planning, landing zones, and cutover support." },
      { id: "security", label: "Security visibility", detail: "Monitoring, detection, endpoint controls, and response." },
      { id: "manual", label: "Too much manual IT", detail: "Patch, monitor, automate, and manage daily operations." },
    ],
  },
  {
    key: "continuity",
    eyebrow: "Recovery tolerance",
    prompt: "How much downtime can your business tolerate?",
    options: [
      { id: "minutes", label: "Minutes", detail: "Architect for high availability and rapid failover." },
      { id: "hours", label: "Hours", detail: "DR and validated backup can carry the recovery plan." },
      { id: "day", label: "A day", detail: "Managed backup and staged recovery may be enough." },
      { id: "unknown", label: "Unknown", detail: "Start with RPO/RTO discovery and risk prioritization." },
    ],
  },
  {
    key: "compliance",
    eyebrow: "Risk posture",
    prompt: "How strict are your security or compliance requirements?",
    options: [
      { id: "regulated", label: "Regulated", detail: "HIPAA, PCI, SOC, audit, or formal security governance." },
      { id: "customer", label: "Customer-driven", detail: "Vendor reviews, cyber insurance, or contract requirements." },
      { id: "standard", label: "Standard", detail: "Practical controls without a heavy audit burden." },
      { id: "unknown", label: "Unknown", detail: "Security assessment should shape the roadmap." },
    ],
  },
  {
    key: "team",
    eyebrow: "Operating model",
    prompt: "How much IT capacity do you have internally?",
    options: [
      { id: "lean", label: "Lean team", detail: "ICE should own more monitoring, patching, and response." },
      { id: "shared", label: "Shared ownership", detail: "Internal team plus ICE for specialized coverage." },
      { id: "specialized", label: "Specialized team", detail: "ICE supports projects, escalation, and architecture." },
      { id: "outsourced", label: "Mostly outsourced", detail: "Managed service stack and clear operating handoffs." },
    ],
  },
  {
    key: "timeline",
    eyebrow: "Timing",
    prompt: "When do you want to begin?",
    options: [
      { id: "now", label: "This month", detail: "Prioritize low-friction assessments and fast stabilization." },
      { id: "quarter", label: "This quarter", detail: "Build a project plan with discovery and staged delivery." },
      { id: "year", label: "This year", detail: "Use planning time to optimize architecture and cost." },
      { id: "research", label: "Researching", detail: "Start with comparison, education, and readiness scoring." },
    ],
  },
];

const GOALS: Goal[] = [
  { id: "downtime", label: "Reduce downtime", detail: "Availability, DR, and recovery assurance.", weight: "uptime", tags: ["outages", "minutes", "hours"] },
  { id: "modernize", label: "Modernize infrastructure", detail: "Cloud, IBM Power, and migration planning.", weight: "scalability", tags: ["migration", "ibm-i", "hybrid"] },
  { id: "security", label: "Improve security", detail: "Monitoring, detection, and access controls.", weight: "security", tags: ["security", "regulated"] },
  { id: "cost", label: "Lower cloud cost", detail: "Right-sized capacity and managed operations.", weight: "cost", tags: ["cloud", "managed"] },
  { id: "ransomware", label: "Recover from ransomware", detail: "Immutable backup and response readiness.", weight: "security", tags: ["ransomware", "backup"] },
  { id: "operations", label: "Simplify IT operations", detail: "Monitoring, patching, and daily ownership.", weight: "operations", tags: ["manual", "lean", "outsourced"] },
  { id: "compliance", label: "Support compliance", detail: "Audit-ready infrastructure and controls.", weight: "compliance", tags: ["regulated", "customer"] },
  { id: "scale", label: "Scale capacity", detail: "Flexible hosting and hybrid architecture.", weight: "scalability", tags: ["hybrid", "cloud", "year"] },
];

const PROBLEM_STARTERS: ProblemStarter[] = [
  {
    id: "risky-backups",
    label: "Backups are unreliable",
    detail: "Validate recoverability and shorten restore windows.",
    answers: { pain: "backup", continuity: "hours" },
    goals: ["downtime", "ransomware"],
  },
  {
    id: "ransomware-ready",
    label: "Ransomware readiness",
    detail: "Harden endpoints, detect threats, and recover cleanly.",
    answers: { pain: "ransomware", compliance: "customer" },
    goals: ["ransomware", "security"],
  },
  {
    id: "ibm-modernization",
    label: "IBM i modernization",
    detail: "Plan cloud, Power VS, security, and managed operations.",
    answers: { workload: "ibm-i", pain: "migration" },
    goals: ["modernize", "operations"],
  },
  {
    id: "lean-it",
    label: "Lean IT team",
    detail: "Shift monitoring, patching, and operations to ICE.",
    answers: { team: "lean", pain: "manual" },
    goals: ["operations", "cost"],
  },
];

const SOLUTIONS: SolutionProfile[] = [
  {
    slug: "managed-cloud-hosting",
    title: "Managed Cloud Hosting",
    category: "Managed Cloud",
    href: "/solutions/managed-cloud-hosting",
    icon: Cloud01,
    summary: "Enterprise hosting with 24/7 operations for IBM Power, Windows, Linux, and hybrid workloads.",
    proof: "Tier-3 data centers and engineer-led operations.",
    tags: ["cloud", "hosting", "hybrid", "scale", "cost", "outages", "year"],
    outcomes: ["modernize", "cost", "scale", "operations"],
    industries: ["healthcare", "finance", "manufacturing", "logistics", "legal", "general"],
    workloads: ["ibm-i", "hybrid", "distributed", "unsure"],
    complexity: "Medium",
    timeline: "2-6 weeks",
    role: "Primary hosting layer",
    ctaLabel: "Plan a hosting assessment",
    nextStep: "Inventory workloads, dependency maps, network needs, and service-level targets.",
  },
  {
    slug: "managed-private-cloud",
    title: "Managed Private Cloud",
    category: "Managed Cloud",
    href: "/solutions/managed-private-cloud",
    icon: Server01,
    summary: "Dedicated cloud capacity for organizations that need isolation, control, and predictable performance.",
    proof: "Dedicated environments with compliance-ready controls.",
    tags: ["cloud", "private", "regulated", "customer", "security", "compliance", "scale"],
    outcomes: ["modernize", "security", "compliance", "scale"],
    industries: ["healthcare", "finance", "legal", "manufacturing"],
    workloads: ["ibm-i", "microsoft", "hybrid", "unsure"],
    complexity: "Medium",
    timeline: "3-8 weeks",
    role: "Dedicated landing zone",
    ctaLabel: "Scope a private cloud",
    nextStep: "Define isolation, compliance, access, and performance requirements.",
  },
  {
    slug: "managed-hybrid-cloud",
    title: "Managed Hybrid Cloud",
    category: "Managed Cloud",
    href: "/solutions/managed-hybrid-cloud",
    icon: Database01,
    summary: "Connect on-premises, cloud, and legacy systems with one managed operating model.",
    proof: "Unified management across mixed estates.",
    tags: ["hybrid", "cloud", "migration", "scale", "microsoft", "ibm-i", "distributed"],
    outcomes: ["modernize", "scale", "operations"],
    industries: ["manufacturing", "logistics", "finance", "general"],
    workloads: ["hybrid", "microsoft", "ibm-i", "distributed"],
    complexity: "High",
    timeline: "4-10 weeks",
    role: "Integration fabric",
    ctaLabel: "Map a hybrid design",
    nextStep: "Map applications, data flows, identity, and network boundaries.",
  },
  {
    slug: "cloud-migration",
    title: "Cloud Migration Services",
    category: "Managed Cloud",
    href: "/solutions/cloud-migration",
    icon: RefreshCw01,
    summary: "Plan, sequence, migrate, and validate workloads without turning the project into a fire drill.",
    proof: "Runbook-led migrations for IBM i, AIX, Windows, and Linux.",
    tags: ["migration", "modernize", "cloud", "now", "quarter", "year", "speed"],
    outcomes: ["modernize", "cost", "scale"],
    industries: ["healthcare", "finance", "manufacturing", "logistics", "general"],
    workloads: ["ibm-i", "microsoft", "hybrid", "unsure"],
    complexity: "Medium",
    timeline: "2-12 weeks",
    role: "Transition program",
    ctaLabel: "Start migration planning",
    nextStep: "Prioritize workloads, dependencies, rollback paths, and cutover windows.",
  },
  {
    slug: "backup-as-a-service",
    title: "Backup as a Service",
    category: "Data Protection",
    href: "/solutions/backup-as-a-service",
    icon: HardDrive,
    summary: "Managed backup with encrypted retention, offsite copies, and restore validation.",
    proof: "Recovery confidence before the incident.",
    tags: ["backup", "ransomware", "hours", "day", "unknown", "compliance"],
    outcomes: ["downtime", "ransomware", "compliance"],
    industries: ["healthcare", "finance", "legal", "manufacturing", "general"],
    workloads: ["ibm-i", "microsoft", "hybrid", "distributed", "unsure"],
    complexity: "Low",
    timeline: "1-4 weeks",
    role: "Data safety net",
    ctaLabel: "Review backup risk",
    nextStep: "Assess backup coverage, retention, restore tests, and immutable copy needs.",
  },
  {
    slug: "disaster-recovery",
    title: "Disaster Recovery as a Service",
    category: "Data Protection",
    href: "/solutions/disaster-recovery",
    icon: ShieldZap,
    summary: "Defined RPO/RTO, tested failover, and recovery orchestration for critical systems.",
    proof: "Recovery runbooks built around business tolerance.",
    tags: ["dr", "backup", "outages", "hours", "minutes", "ransomware", "regulated"],
    outcomes: ["downtime", "ransomware", "compliance"],
    industries: ["healthcare", "finance", "manufacturing", "logistics", "legal"],
    workloads: ["ibm-i", "microsoft", "hybrid", "distributed", "unsure"],
    complexity: "Medium",
    timeline: "3-8 weeks",
    role: "Recovery orchestration",
    ctaLabel: "Define RPO/RTO",
    nextStep: "Set recovery tiers, failover scope, test cadence, and communication paths.",
  },
  {
    slug: "high-availability",
    title: "High Availability as a Service",
    category: "Data Protection",
    href: "/solutions/high-availability",
    icon: Database01,
    summary: "Always-on architecture for systems where minutes of downtime are too expensive.",
    proof: "Replication and failover for mission-critical workloads.",
    tags: ["outages", "minutes", "uptime", "regulated", "logistics", "manufacturing"],
    outcomes: ["downtime", "scale"],
    industries: ["healthcare", "finance", "manufacturing", "logistics"],
    workloads: ["ibm-i", "hybrid", "microsoft"],
    complexity: "High",
    timeline: "4-10 weeks",
    role: "Continuity layer",
    ctaLabel: "Model HA options",
    nextStep: "Identify critical transactions, replication paths, and failover targets.",
  },
  {
    slug: "ransomware-recovery",
    title: "Ransomware Recovery",
    category: "Data Protection",
    href: "/solutions/ransomware-recovery",
    icon: ShieldZap,
    summary: "Immutable recovery paths, incident playbooks, and restoration strategy for ransomware events.",
    proof: "Clean recovery planning before attackers set the terms.",
    tags: ["ransomware", "backup", "security", "customer", "regulated", "now"],
    outcomes: ["ransomware", "security", "downtime", "compliance"],
    industries: ["healthcare", "finance", "legal", "manufacturing", "general"],
    workloads: ["microsoft", "hybrid", "distributed", "ibm-i", "unsure"],
    complexity: "Medium",
    timeline: "2-6 weeks",
    role: "Clean recovery path",
    ctaLabel: "Build recovery readiness",
    nextStep: "Assess immutable backups, identity dependencies, endpoint scope, and recovery order.",
  },
  {
    slug: "as400",
    title: "AS400 Hosting",
    category: "Managed Services",
    href: "/solutions/as400",
    icon: Server01,
    summary: "AS400, AS/400, iSeries, and IBM i hosting, support, security, backup, HA, DR, and modernization planning.",
    proof: "IBM Business Partner since 1990 with IBM i and AS/400 infrastructure specialists.",
    tags: ["as400", "as400-hosting", "as/400", "ibm-i", "ibm-i-hosting", "iseries", "managed", "modernize", "outsourced", "downtime", "security"],
    outcomes: ["modernize", "operations", "downtime", "security", "compliance"],
    industries: ["finance", "healthcare", "manufacturing", "logistics", "general"],
    workloads: ["ibm-i"],
    complexity: "Medium",
    timeline: "2-8 weeks",
    role: "AS400 modernization path",
    ctaLabel: "Talk AS400 hosting",
    nextStep: "Review IBM i release level, hardware lifecycle, security posture, backups, and recovery targets.",
  },
  {
    slug: "ibm-i-security",
    title: "IBM i Security",
    category: "Managed Security",
    href: "/solutions/ibm-i-security",
    icon: ShieldTick,
    summary: "Hardening, access controls, monitoring, and compliance support for IBM i environments.",
    proof: "IBM i-specific controls from engineers who know the platform.",
    tags: ["ibm-i", "security", "regulated", "customer", "compliance"],
    outcomes: ["security", "compliance", "operations"],
    industries: ["finance", "healthcare", "manufacturing", "logistics"],
    workloads: ["ibm-i"],
    complexity: "Medium",
    timeline: "2-6 weeks",
    role: "Platform hardening",
    ctaLabel: "Assess IBM i security",
    nextStep: "Review profiles, authorities, exit points, logging, and compliance posture.",
  },
  {
    slug: "protection-suite",
    title: "Protection Suite",
    category: "Managed Security",
    href: "/solutions/protection-suite",
    icon: Shield01,
    summary: "Layered protection across users, endpoints, networks, and critical workloads.",
    proof: "Defense-in-depth without adding operational noise.",
    tags: ["security", "endpoint", "customer", "distributed", "regulated"],
    outcomes: ["security", "ransomware", "compliance"],
    industries: ["healthcare", "finance", "legal", "general"],
    workloads: ["distributed", "microsoft", "hybrid"],
    complexity: "Medium",
    timeline: "2-5 weeks",
    role: "Layered controls",
    ctaLabel: "Review security coverage",
    nextStep: "Compare current tools, endpoint coverage, policies, and response gaps.",
  },
  {
    slug: "security-monitoring",
    title: "Security Monitoring",
    category: "Managed Security",
    href: "/solutions/security-monitoring",
    icon: Activity,
    summary: "24/7 monitoring, alert triage, and escalation across cloud, endpoint, and server events.",
    proof: "Signals reviewed by people who can act.",
    tags: ["security", "monitoring", "customer", "regulated", "now", "lean"],
    outcomes: ["security", "compliance", "operations"],
    industries: ["healthcare", "finance", "legal", "manufacturing", "general"],
    workloads: ["microsoft", "hybrid", "distributed", "ibm-i", "unsure"],
    complexity: "Low",
    timeline: "1-3 weeks",
    role: "Visibility layer",
    ctaLabel: "Start monitoring review",
    nextStep: "Identify log sources, alert paths, escalation contacts, and severity rules.",
  },
  {
    slug: "threat-detection",
    title: "Threat Detection and Response",
    category: "Managed Security",
    href: "/solutions/threat-detection",
    icon: Target04,
    summary: "Detect, contain, and respond to active threats with coordinated playbooks.",
    proof: "Incident response discipline attached to detection.",
    tags: ["security", "ransomware", "now", "customer", "endpoint", "distributed"],
    outcomes: ["security", "ransomware", "operations"],
    industries: ["healthcare", "finance", "legal", "general"],
    workloads: ["distributed", "microsoft", "hybrid", "unsure"],
    complexity: "Medium",
    timeline: "2-5 weeks",
    role: "Response muscle",
    ctaLabel: "Tune detection coverage",
    nextStep: "Review threat model, response ownership, and high-value assets.",
  },
  {
    slug: "endpoint-security",
    title: "Endpoint Security",
    category: "Managed Security",
    href: "/solutions/endpoint-security",
    icon: Lock01,
    summary: "Managed endpoint protection for laptops, servers, and distributed users.",
    proof: "Endpoint visibility across the places attackers enter.",
    tags: ["endpoint", "security", "distributed", "ransomware", "lean"],
    outcomes: ["security", "ransomware", "operations"],
    industries: ["healthcare", "finance", "legal", "general"],
    workloads: ["distributed", "microsoft", "hybrid"],
    complexity: "Low",
    timeline: "1-4 weeks",
    role: "Endpoint control",
    ctaLabel: "Assess endpoints",
    nextStep: "Measure device coverage, policy gaps, alert response, and user risk.",
  },
  {
    slug: "managed-microsoft",
    title: "Managed Microsoft Services",
    category: "Managed Services",
    href: "/solutions/managed-microsoft",
    icon: Monitor01,
    summary: "Microsoft 365, Azure, Windows, identity, and productivity environment management.",
    proof: "Operational ownership for the Microsoft stack.",
    tags: ["microsoft", "managed", "manual", "lean", "outsourced", "cost"],
    outcomes: ["operations", "cost", "security"],
    industries: ["healthcare", "finance", "legal", "general"],
    workloads: ["microsoft", "hybrid", "distributed"],
    complexity: "Low",
    timeline: "1-5 weeks",
    role: "Microsoft operations",
    ctaLabel: "Review Microsoft operations",
    nextStep: "Review tenant, identity, endpoint, licensing, and support handoffs.",
  },
  {
    slug: "automation-suite",
    title: "Automation Suite",
    category: "Managed Services",
    href: "/solutions/automation-suite",
    icon: Dataflow01,
    summary: "Automate patching, remediation, reporting, and repeatable operational work.",
    proof: "Less toil, faster closure, and fewer configuration surprises.",
    tags: ["automation", "manual", "lean", "managed", "speed", "cost", "security"],
    outcomes: ["operations", "cost", "security"],
    industries: ["healthcare", "finance", "manufacturing", "logistics", "general"],
    workloads: ["microsoft", "hybrid", "distributed", "ibm-i"],
    complexity: "Medium",
    timeline: "2-6 weeks",
    role: "Operational accelerator",
    ctaLabel: "Find automation wins",
    nextStep: "Identify recurring tickets, patch windows, manual checks, and reporting gaps.",
  },
  {
    slug: "systems-management",
    title: "Systems Management",
    category: "Managed Services",
    href: "/solutions/systems-management",
    icon: Settings01,
    summary: "Proactive monitoring, patching, performance management, and daily systems care.",
    proof: "Operational coverage without hiring around the clock.",
    tags: ["managed", "manual", "lean", "outsourced", "monitoring", "cost", "hybrid"],
    outcomes: ["operations", "cost", "downtime"],
    industries: ["healthcare", "finance", "manufacturing", "logistics", "general"],
    workloads: ["ibm-i", "microsoft", "hybrid", "distributed", "unsure"],
    complexity: "Low",
    timeline: "1-4 weeks",
    role: "Daily operations",
    ctaLabel: "Scope managed operations",
    nextStep: "Define systems, monitoring thresholds, patch cadence, and escalation paths.",
  },
  {
    slug: "ibm-power-vs",
    title: "IBM Power VS",
    category: "Managed Services",
    href: "/solutions/ibm-power-vs",
    icon: CpuChip01,
    summary: "IBM Power Virtual Server planning and management for cloud-based IBM Power workloads.",
    proof: "Elastic IBM Power capacity with ICE guidance.",
    tags: ["ibm-i", "cloud", "migration", "modernize", "scale"],
    outcomes: ["modernize", "scale", "operations"],
    industries: ["finance", "manufacturing", "logistics", "healthcare"],
    workloads: ["ibm-i", "hybrid"],
    complexity: "High",
    timeline: "4-12 weeks",
    role: "IBM Power cloud path",
    ctaLabel: "Plan Power VS",
    nextStep: "Review IBM Power workloads, licensing, connectivity, and migration windows.",
  },
];

/**
 * Complete editable copy used by the live finder. Scoring identifiers and
 * matching weights stay code-owned; every user-facing label and description
 * is returned here for the CMS editor template.
 */
export function getDefaultSolutionFinderContent(): SolutionFinderContent {
  return {
    chooser: { ...DEFAULT_FINDER_COPY.chooser },
    modes: {
      quick: { ...DEFAULT_MODE_COPY.quick },
      advanced: { ...DEFAULT_MODE_COPY.advanced },
    },
    shortcut: { ...DEFAULT_FINDER_COPY.shortcut },
    problem_starters: PROBLEM_STARTERS.map(({ id, label, detail }) => ({ id, label, detail })),
    questions: QUESTIONS.map(({ key, eyebrow, prompt, options }) => ({
      key,
      eyebrow,
      prompt,
      options: options.map(({ id, label, detail }) => ({ id, label, detail })),
    })),
    questionnaire: { ...DEFAULT_FINDER_COPY.questionnaire },
    stages: {
      quick: DEFAULT_STAGE_COPY.quick.map((stage) => ({ ...stage })),
      advanced: DEFAULT_STAGE_COPY.advanced.map((stage) => ({ ...stage })),
    },
    situation: { ...DEFAULT_FINDER_COPY.situation },
    fine_tune: { ...DEFAULT_FINDER_COPY.fineTune },
    goals: GOALS.map(({ id, label, detail }) => ({ id, label, detail })),
    weight_labels: { ...DEFAULT_WEIGHT_LABELS },
    results: { ...DEFAULT_FINDER_COPY.results },
    cards: { ...DEFAULT_FINDER_COPY.cards },
    reasons: { ...DEFAULT_FINDER_COPY.reasons },
    solution_copy: SOLUTIONS.map((solution) => ({
      slug: solution.slug,
      title: solution.title,
      category: solution.category,
      summary: solution.summary,
      proof: solution.proof,
      timeline: solution.timeline,
      complexity: solution.complexity,
      role: solution.role,
      cta_label: solution.ctaLabel,
      next_step: solution.nextStep,
    })),
  };
}

function textOverride(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function mergeTextGroup<T extends Record<string, string>>(
  defaults: T,
  overrides: unknown,
): T {
  const merged = { ...defaults } as Record<keyof T, string>;
  if (!overrides || typeof overrides !== "object" || Array.isArray(overrides)) return merged as T;
  const values = overrides as Record<string, unknown>;
  for (const key of Object.keys(defaults) as Array<keyof T>) {
    const value = values[String(key)];
    if (typeof value === "string") merged[key] = value;
  }
  return merged as T;
}

function fillFinderTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{([a-z_]+)\}/gi, (token, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : token,
  );
}

function resolveFinderCopy(content: SolutionFinderContent) {
  return {
    chooser: mergeTextGroup(DEFAULT_FINDER_COPY.chooser, content.chooser),
    shortcut: mergeTextGroup(DEFAULT_FINDER_COPY.shortcut, content.shortcut),
    questionnaire: mergeTextGroup(DEFAULT_FINDER_COPY.questionnaire, content.questionnaire),
    situation: mergeTextGroup(DEFAULT_FINDER_COPY.situation, content.situation),
    fineTune: mergeTextGroup(DEFAULT_FINDER_COPY.fineTune, content.fine_tune),
    results: mergeTextGroup(DEFAULT_FINDER_COPY.results, content.results),
    cards: mergeTextGroup(DEFAULT_FINDER_COPY.cards, content.cards),
    reasons: mergeTextGroup(DEFAULT_FINDER_COPY.reasons, content.reasons),
    weightLabels: mergeTextGroup(DEFAULT_WEIGHT_LABELS, content.weight_labels),
  };
}

function resolveQuestions(value: unknown): Question[] {
  if (value === undefined) return QUESTIONS;
  if (!Array.isArray(value)) return QUESTIONS;

  const seen = new Set<AnswerKey>();
  return value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return [];
    const override = candidate as Record<string, unknown>;
    const original = QUESTIONS.find((question) => question.key === override.key);
    if (!original || seen.has(original.key)) return [];
    seen.add(original.key);

    let options = original.options;
    if (Array.isArray(override.options)) {
      const seenOptions = new Set<string>();
      options = override.options.flatMap((optionCandidate) => {
        if (!optionCandidate || typeof optionCandidate !== "object" || Array.isArray(optionCandidate)) return [];
        const optionOverride = optionCandidate as Record<string, unknown>;
        const defaultOption = original.options.find((option) => option.id === optionOverride.id);
        if (!defaultOption || seenOptions.has(defaultOption.id)) return [];
        seenOptions.add(defaultOption.id);
        return [{
          ...defaultOption,
          label: textOverride(optionOverride.label, defaultOption.label),
          detail: textOverride(optionOverride.detail, defaultOption.detail),
        }];
      });
    }

    return [{
      ...original,
      eyebrow: textOverride(override.eyebrow, original.eyebrow),
      prompt: textOverride(override.prompt, original.prompt),
      options,
    }];
  });
}

function resolveGoals(value: unknown): Goal[] {
  if (value === undefined) return GOALS;
  if (!Array.isArray(value)) return GOALS;

  const seen = new Set<GoalId>();
  return value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return [];
    const override = candidate as Record<string, unknown>;
    const original = GOALS.find((goal) => goal.id === override.id);
    if (!original || seen.has(original.id)) return [];
    seen.add(original.id);
    return [{
      ...original,
      label: textOverride(override.label, original.label),
      detail: textOverride(override.detail, original.detail),
    }];
  });
}

function resolveProblemStarters(value: unknown): ProblemStarter[] {
  if (value === undefined) return PROBLEM_STARTERS;
  if (!Array.isArray(value)) return PROBLEM_STARTERS;

  const seen = new Set<string>();
  return value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return [];
    const override = candidate as Record<string, unknown>;
    const original = PROBLEM_STARTERS.find((starter) => starter.id === override.id);
    if (!original || seen.has(original.id)) return [];
    seen.add(original.id);
    return [{
      ...original,
      label: textOverride(override.label, original.label),
      detail: textOverride(override.detail, original.detail),
    }];
  });
}

function finderRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function finderStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function validOutcomes(value: unknown): GoalId[] {
  const allowed = new Set<GoalId>([
    "downtime",
    "modernize",
    "security",
    "cost",
    "ransomware",
    "operations",
    "compliance",
    "scale",
  ]);
  return finderStrings(value).filter((item): item is GoalId => allowed.has(item as GoalId));
}

function resolveSolutions(
  value: unknown,
  catalog?: SolutionCatalogItem[] | null,
): SolutionProfile[] {
  const overrides = Array.isArray(value) ? value : [];
  const legacySolutions = SOLUTIONS.map((solution) => {
    const candidate = overrides.find(
      (item) => item && typeof item === "object" && !Array.isArray(item) && item.slug === solution.slug,
    );
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return solution;
    const override = candidate as Record<string, unknown>;
    const complexity = ["Low", "Medium", "High"].includes(String(override.complexity))
      ? (override.complexity as SolutionProfile["complexity"])
      : solution.complexity;
    return {
      ...solution,
      title: textOverride(override.title, solution.title),
      category: textOverride(override.category, solution.category),
      summary: textOverride(override.summary, solution.summary),
      proof: textOverride(override.proof, solution.proof),
      timeline: textOverride(override.timeline, solution.timeline),
      complexity,
      role: textOverride(override.role, solution.role),
      ctaLabel: textOverride(override.cta_label, solution.ctaLabel),
      nextStep: textOverride(override.next_step, solution.nextStep),
    };
  });

  // A null catalog means the public catalog query failed, so retain the
  // legacy finder as a resilience fallback. An empty array is authoritative:
  // no published/listed services should be recommended.
  if (catalog == null) return legacySolutions;

  const legacyBySlug = new Map(legacySolutions.map((solution) => [solution.slug, solution]));
  return catalog.flatMap((item) => {
    const legacy = legacyBySlug.get(item.slug);
    const copyOverride = finderRecord(
      overrides.find(
        (candidate) =>
          candidate &&
          typeof candidate === "object" &&
          !Array.isArray(candidate) &&
          candidate.slug === item.slug,
      ),
    );
    if (item.finder?.enabled === false) return [];
    const finder = finderRecord(item.finder);
    const complexityValue = textOverride(
      finder.complexity ?? copyOverride.complexity,
      legacy?.complexity ?? "Medium",
    );
    const complexity = (["Low", "Medium", "High"] as const).includes(
      complexityValue as "Low" | "Medium" | "High",
    )
      ? (complexityValue as SolutionProfile["complexity"])
      : (legacy?.complexity ?? "Medium");
    const outcomes = validOutcomes(finder.outcomes);

    return [{
      slug: item.slug,
      title: item.title,
      category: item.category,
      href: item.href,
      icon: resolveIcon(item.icon),
      summary: item.card_description,
      proof: textOverride(
        finder.proof ?? copyOverride.proof,
        legacy?.proof ?? item.outcome,
      ),
      tags: item.tags.map((tag) => tag.toLocaleLowerCase()),
      outcomes: outcomes.length > 0 ? outcomes : (legacy?.outcomes ?? []),
      industries: item.industries.map((industry) => industry.toLocaleLowerCase()),
      workloads: item.workloads.map((workload) => workload.toLocaleLowerCase()),
      complexity,
      timeline: textOverride(
        finder.timeline ?? copyOverride.timeline,
        legacy?.timeline ?? "Discovery-led",
      ),
      role: textOverride(
        finder.role ?? copyOverride.role,
        legacy?.role ?? item.category,
      ),
      ctaLabel: textOverride(
        finder.cta_label ?? copyOverride.cta_label,
        legacy?.ctaLabel ?? item.link_label,
      ),
      nextStep: textOverride(
        finder.next_step ?? copyOverride.next_step,
        legacy?.nextStep ?? item.outcome,
      ),
      image: item.card_image || undefined,
      imageConfigured: true,
    }];
  });
}

function resolveModeCopy(value: unknown): Record<FinderMode, Required<FinderModeCopy>> {
  const modes = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  return {
    quick: mergeTextGroup(DEFAULT_MODE_COPY.quick, modes.quick),
    advanced: mergeTextGroup(DEFAULT_MODE_COPY.advanced, modes.advanced),
  };
}

function resolveStages(value: unknown, mode: FinderMode): FinderStageCopy[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return DEFAULT_STAGE_COPY[mode];
  const candidate = (value as Record<string, unknown>)[mode];
  if (candidate === undefined) return DEFAULT_STAGE_COPY[mode];
  if (!Array.isArray(candidate)) return DEFAULT_STAGE_COPY[mode];
  return candidate.flatMap((stage) => {
    if (!stage || typeof stage !== "object" || Array.isArray(stage)) return [];
    const record = stage as Record<string, unknown>;
    if (!Number.isFinite(record.start) || !Number.isFinite(record.end)) return [];
    const start = Math.max(0, Math.floor(Number(record.start)));
    const end = Math.max(start, Math.floor(Number(record.end)));
    return [{ label: typeof record.label === "string" ? record.label : "", start, end }];
  });
}

function imageFor(solution: SolutionProfile) {
  return solution.imageConfigured
    ? solution.image
    : solution.image ?? SOLUTION_HERO_IMAGE_BY_SLUG[solution.slug];
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function getAnswerLabels(answers: Answers, questions: Question[] = QUESTIONS) {
  return questions.flatMap((question) => {
    const value = answers[question.key];
    const option = question.options.find((item) => item.id === value);
    return option ? [option.label] : [];
  });
}

function scoreSolution(
  solution: SolutionProfile,
  answers: Answers,
  selectedGoals: GoalId[],
  weights: Record<WeightKey, number>,
  questions: Question[] = QUESTIONS,
  goals: Goal[] = GOALS,
  reasonCopy: TextValues<typeof DEFAULT_FINDER_COPY.reasons> = DEFAULT_FINDER_COPY.reasons,
): RankedSolution {
  let score = 18;
  const reasons: string[] = [];
  const answerValues = Object.values(answers).filter(Boolean) as string[];

  for (const value of answerValues) {
    if (solution.tags.includes(value) || solution.workloads.includes(value) || solution.industries.includes(value)) {
      score += 14;
      const label = questions.flatMap((q) => q.options).find((option) => option.id === value)?.label;
      if (label) {
        reasons.push(fillFinderTemplate(reasonCopy.matches_template, {
          label: label.toLowerCase(),
          label_original: label,
        }));
      }
    }
  }

  for (const goal of selectedGoals) {
    if (solution.outcomes.includes(goal)) {
      const goalConfig = goals.find((item) => item.id === goal);
      score += 18;
      if (goalConfig) reasons.push(goalConfig.label);
    }
  }

  if (answers.continuity === "minutes" && solution.tags.some((tag) => ["minutes", "uptime", "dr", "outages"].includes(tag))) {
    score += 16;
    reasons.push(reasonCopy.strict_recovery);
  }
  if (answers.continuity === "hours" && solution.tags.some((tag) => ["backup", "dr", "ransomware"].includes(tag))) {
    score += 12;
    reasons.push(reasonCopy.recovery_window);
  }
  if (answers.compliance === "regulated" && solution.tags.some((tag) => ["regulated", "compliance", "security", "private"].includes(tag))) {
    score += 16;
    reasons.push(reasonCopy.regulated);
  }
  if ((answers.team === "lean" || answers.team === "outsourced") && solution.outcomes.includes("operations")) {
    score += 14;
    reasons.push(reasonCopy.operating_load);
  }
  if (answers.timeline === "now" && solution.tags.some((tag) => ["now", "monitoring", "backup", "managed"].includes(tag))) {
    score += 9;
    reasons.push(reasonCopy.stabilization);
  }

  const weightMap: Record<WeightKey, GoalId[]> = {
    cost: ["cost", "operations"],
    uptime: ["downtime"],
    security: ["security", "ransomware"],
    speed: ["modernize", "operations"],
    compliance: ["compliance", "security"],
    scalability: ["scale", "modernize"],
    operations: ["operations", "cost"],
  };

  for (const [key, value] of Object.entries(weights) as [WeightKey, number][]) {
    if (value < 55) continue;
    const matches = weightMap[key].some((goal) => solution.outcomes.includes(goal));
    if (matches) score += Math.round((value - 45) / 4);
  }

  const uniqueReasons = Array.from(new Set(reasons.filter(Boolean))).slice(0, 4);
  return { ...solution, score, fit: clamp(Math.round(score)), reasons: uniqueReasons };
}

function getMaturity(answers: Answers, goals: GoalId[], weights: Record<WeightKey, number>) {
  const cloud = clamp(40 + (answers.workload === "hybrid" ? 12 : 0) + (goals.includes("modernize") ? 20 : 0) + Math.round(weights.scalability / 8));
  const resilience = clamp(36 + (answers.continuity === "minutes" ? 22 : answers.continuity === "hours" ? 14 : 4) + (goals.includes("downtime") ? 18 : 0));
  const security = clamp(34 + (answers.compliance === "regulated" ? 18 : 8) + (goals.includes("security") ? 18 : 0) + (goals.includes("ransomware") ? 12 : 0));
  const operations = clamp(38 + (answers.team === "lean" || answers.team === "outsourced" ? 20 : 8) + (goals.includes("operations") ? 18 : 0));
  const overall = Math.round((cloud + resilience + security + operations) / 4);
  return { overall, cloud, resilience, security, operations };
}

function getRecommendedStack(recommendations: RankedSolution[]) {
  const stack: RankedSolution[] = [];
  const desiredRoles = ["Primary hosting layer", "Data safety net", "Visibility layer", "Daily operations", "Recovery orchestration"];

  for (const role of desiredRoles) {
    const item = recommendations.find((solution) => solution.role === role && !stack.some((existing) => existing.slug === solution.slug));
    if (item) stack.push(item);
  }

  for (const item of recommendations) {
    if (stack.length >= 5) break;
    if (!stack.some((existing) => existing.slug === item.slug)) stack.push(item);
  }

  return stack.slice(0, 5);
}

function encodeFinderState(answers: Answers, goals: GoalId[], weights: Record<WeightKey, number>, stack: string[]) {
  const payload = JSON.stringify({ answers, goals, weights, stack });
  return btoa(payload);
}

function decodeFinderState(value: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(atob(value)) as {
      answers?: Answers;
      goals?: GoalId[];
      weights?: Record<WeightKey, number>;
      stack?: string[];
    };
  } catch {
    return null;
  }
}

function IconBadge({ icon: Icon, className }: { icon: IconComponent; className?: string }) {
  return (
    <span className={cx("inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-solid text-white shadow-xs", className)}>
      <Icon className="size-5" />
    </span>
  );
}

function FitMeter({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary ring-1 ring-secondary ring-inset">
        <div className="h-full rounded-full bg-brand-solid transition-all duration-500" style={{ width: `${clamp(value)}%` }} />
      </div>
      <span className="text-xs font-semibold text-brand-secondary">{clamp(value)}%</span>
    </div>
  );
}

function SolutionCard({
  solution,
  isPinned,
  isStacked,
  onPin,
  onStack,
}: {
  solution: RankedSolution;
  isPinned: boolean;
  isStacked: boolean;
  onPin: () => void;
  onStack: () => void;
}) {
  const image = imageFor(solution);

  return (
    <article
      data-testid={`solution-card-${solution.slug}`}
      className="group relative isolate flex h-full min-h-80 flex-col overflow-hidden rounded-2xl bg-primary p-5 ring-1 ring-secondary transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-brand"
    >
      {image && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-36 overflow-hidden opacity-30 transition duration-500 group-hover:opacity-75">
          <img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full scale-105 object-cover transition duration-500 group-hover:scale-100" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-bg-primary)]/40 to-[var(--color-bg-primary)]" />
        </div>
      )}

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <IconBadge icon={solution.icon} />
          <FitMeter value={solution.fit} />
        </div>
        <p className="mt-16 text-xs font-medium tracking-[0.18em] text-brand-secondary uppercase">{solution.category}</p>
        <h3 className="mt-2 text-xl font-semibold text-primary">{solution.title}</h3>
        <p className="mt-2 text-sm text-tertiary">{solution.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {solution.reasons.length > 0 ? (
            solution.reasons.map((reason) => (
              <li key={reason} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary ring-1 ring-secondary">
                {reason}
              </li>
            ))
          ) : (
            <li className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary ring-1 ring-secondary">
              Broad discovery fit
            </li>
          )}
        </ul>
        <p className="mt-4 text-xs font-medium text-quaternary">{solution.proof}</p>

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <Button size="sm" href={solution.href} iconTrailing={ArrowRight} onClick={() => pushEvent("solution_finder_result_clicked", { href: solution.href })}>
            Open
          </Button>
          <button
            type="button"
            onClick={onPin}
            className={cx(
              "rounded-lg px-3 py-2 text-sm font-semibold ring-1 ring-inset transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              isPinned ? "bg-brand-solid text-white ring-transparent" : "bg-secondary text-secondary ring-secondary hover:ring-brand",
            )}
          >
            {isPinned ? "Pinned" : "Compare"}
          </button>
          <button
            type="button"
            onClick={onStack}
            className={cx(
              "rounded-lg px-3 py-2 text-sm font-semibold ring-1 ring-inset transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              isStacked ? "bg-secondary text-brand-secondary ring-brand" : "bg-secondary text-secondary ring-secondary hover:ring-brand",
            )}
          >
            {isStacked ? "In stack" : "Add stack"}
          </button>
        </div>
      </div>
    </article>
  );
}

function LegacySolutionFinder({ className }: { className?: string }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<GoalId[]>(["downtime", "security", "operations"]);
  const [weights, setWeights] = useState<Record<WeightKey, number>>(DEFAULT_WEIGHTS);
  const [pinned, setPinned] = useState<string[]>([]);
  const [stack, setStack] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<View>("recommendations");
  const [copyLabel, setCopyLabel] = useState("Copy plan link");

  useEffect(() => {
    const state = decodeFinderState(new URLSearchParams(window.location.search).get("finder"));
    if (!state) return;
    const timeout = window.setTimeout(() => {
      if (state.answers) setAnswers(state.answers);
      if (state.goals) setSelectedGoals(state.goals.filter((goal): goal is GoalId => GOALS.some((item) => item.id === goal)));
      if (state.weights) setWeights({ ...DEFAULT_WEIGHTS, ...state.weights });
      if (state.stack) setStack(state.stack.filter((slug) => SOLUTIONS.some((solution) => solution.slug === slug)));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const ranked = useMemo(
    () =>
      SOLUTIONS.map((solution) => scoreSolution(solution, answers, selectedGoals, weights)).sort(
        (a, b) => b.score - a.score,
      ),
    [answers, selectedGoals, weights],
  );
  const recommendations = ranked.slice(0, 6);
  const recommendedStack = useMemo(() => getRecommendedStack(ranked), [ranked]);
  const stackItems = (stack.length > 0 ? stack : recommendedStack.map((item) => item.slug))
    .map((slug) => ranked.find((solution) => solution.slug === slug))
    .filter((item): item is RankedSolution => Boolean(item))
    .slice(0, 5);
  const compareItems = (pinned.length > 0 ? pinned : recommendations.slice(0, 3).map((item) => item.slug))
    .map((slug) => ranked.find((solution) => solution.slug === slug))
    .filter((item): item is RankedSolution => Boolean(item))
    .slice(0, 4);
  const maturity = useMemo(() => getMaturity(answers, selectedGoals, weights), [answers, selectedGoals, weights]);
  const answeredCount = QUESTIONS.filter((question) => answers[question.key]).length;
  const current = QUESTIONS[step];
  const top = recommendations[0];
  const answerLabels = getAnswerLabels(answers);
  const contactHref = `/contact?service=${encodeURIComponent(top?.title ?? "Solution Finder")}&source=solution_finder&summary=${encodeURIComponent(
    [...answerLabels, ...selectedGoals.map((goal) => GOALS.find((item) => item.id === goal)?.label).filter(Boolean)].join(", "),
  )}`;

  const selectAnswer = (key: AnswerKey, value: string, advance = true) => {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [key]: value }));
    pushEvent("solution_finder_answer", { question: key, answer: value });
    if (advance) setStep((currentStep) => Math.min(QUESTIONS.length - 1, currentStep + 1));
  };

  const toggleGoal = (goal: GoalId) => {
    setSelectedGoals((currentGoals) => {
      const next = currentGoals.includes(goal)
        ? currentGoals.filter((item) => item !== goal)
        : [...currentGoals, goal];
      pushEvent("solution_finder_goal_toggled", { goal, selected: next.includes(goal) });
      return next;
    });
  };

  const togglePinned = (slug: string) => {
    setPinned((currentPinned) => {
      if (currentPinned.includes(slug)) return currentPinned.filter((item) => item !== slug);
      return [...currentPinned, slug].slice(0, 4);
    });
  };

  const toggleStack = (slug: string) => {
    setStack((currentStack) => {
      if (currentStack.includes(slug)) return currentStack.filter((item) => item !== slug);
      return [...currentStack, slug].slice(0, 5);
    });
  };

  const applyStarter = (starter: (typeof PROBLEM_STARTERS)[number]) => {
    setAnswers((currentAnswers) => ({ ...currentAnswers, ...starter.answers }));
    setSelectedGoals((currentGoals) => Array.from(new Set([...currentGoals, ...starter.goals])));
    setStep(2);
    pushEvent("solution_finder_starter_clicked", { starter: starter.id });
  };

  const reset = () => {
    setAnswers({});
    setSelectedGoals(["downtime", "security", "operations"]);
    setWeights(DEFAULT_WEIGHTS);
    setPinned([]);
    setStack([]);
    setStep(0);
    setActiveView("recommendations");
    setCopyLabel("Copy plan link");
  };

  const copyShareLink = async () => {
    const encoded = encodeFinderState(answers, selectedGoals, weights, stack);
    const url = `${window.location.origin}${window.location.pathname}?finder=${encodeURIComponent(encoded)}`;
    await navigator.clipboard.writeText(url);
    setCopyLabel("Copied");
    window.setTimeout(() => setCopyLabel("Copy plan link"), 1600);
    pushEvent("solution_finder_share_copied", { recommendation: top?.slug });
  };

  const mailtoHref = `mailto:?subject=${encodeURIComponent("ICE solution finder results")}&body=${encodeURIComponent(
    `Recommended ICE stack:\n${stackItems.map((item, index) => `${index + 1}. ${item.title} - ${item.href}`).join("\n")}\n\nTop match: ${top?.title ?? "ICE solution"}\n${top?.summary ?? ""}`,
  )}`;

  return (
    <div data-testid="solution-finder" className={cx("space-y-8", className)}>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-2xl bg-primary p-5 ring-1 ring-secondary md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
                Guided consultant
              </p>
              <h2 className="mt-2 text-display-xs font-semibold text-primary md:text-display-sm">
                {current.prompt}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary ring-1 ring-secondary">
                {answeredCount}/{QUESTIONS.length} answered
              </span>
              <button
                type="button"
                onClick={reset}
                className="inline-flex size-9 items-center justify-center rounded-lg bg-secondary text-tertiary ring-1 ring-secondary transition hover:text-brand-secondary hover:ring-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                aria-label="Restart finder"
                title="Restart"
              >
                <RefreshCw01 className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            {QUESTIONS.map((question, index) => (
              <button
                key={question.key}
                type="button"
                onClick={() => setStep(index)}
                aria-label={question.eyebrow}
                title={question.eyebrow}
                className={cx(
                  "h-2 flex-1 rounded-full transition",
                  index === step ? "bg-brand-solid" : answers[question.key] ? "bg-brand-solid/45" : "bg-secondary",
                )}
              />
            ))}
          </div>

          <p className="mt-6 text-xs font-medium tracking-[0.18em] text-quaternary uppercase">{current.eyebrow}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {current.options.map((option) => {
              const selected = answers[current.key] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  data-testid={`finder-option-${current.key}-${option.id}`}
                  aria-pressed={selected}
                  onClick={() => selectAnswer(current.key, option.id)}
                  className={cx(
                    "group min-h-32 rounded-xl bg-secondary p-4 text-left ring-1 ring-secondary transition duration-150 hover:-translate-y-0.5 hover:ring-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                    selected && "bg-brand-solid text-white ring-transparent",
                  )}
                >
                  <span className={cx("inline-flex items-center gap-2 text-md font-semibold", selected ? "text-white" : "text-primary")}>
                    {option.label}
                    {selected && <CheckCircle className="size-4" />}
                  </span>
                  <span className={cx("mt-2 block text-sm", selected ? "text-white/75" : "text-tertiary")}>{option.detail}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Button
              size="sm"
              color="secondary"
              isDisabled={step === 0}
              onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))}
            >
              Back
            </Button>
            <Button
              size="sm"
              color="secondary"
              onClick={() => setStep((currentStep) => Math.min(QUESTIONS.length - 1, currentStep + 1))}
              iconTrailing={ChevronRight}
            >
              Next question
            </Button>
          </div>
        </div>

        <aside className="rounded-2xl bg-secondary p-5 ring-1 ring-secondary md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">Live match</p>
              <h2 className="mt-2 text-3xl font-semibold text-primary">{top?.fit ?? 0}%</h2>
            </div>
            {top && <IconBadge icon={top.icon} />}
          </div>
          <p className="mt-3 text-md font-semibold text-primary">{top?.title ?? "Answer to calculate"}</p>
          <p className="mt-1 text-sm text-tertiary">{top?.summary ?? "Recommendations update as answers, goals, and priorities change."}</p>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-medium text-quaternary">
              <span>Readiness score</span>
              <span>{maturity.overall}/100</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary ring-1 ring-secondary ring-inset">
              <div className="h-full rounded-full bg-brand-solid transition-all duration-500" style={{ width: `${maturity.overall}%` }} />
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3">
            {[
              ["Cloud", maturity.cloud],
              ["Resilience", maturity.resilience],
              ["Security", maturity.security],
              ["Operations", maturity.operations],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-primary p-3 ring-1 ring-secondary">
                <dt className="text-xs font-medium text-quaternary">{label}</dt>
                <dd className="mt-1 text-lg font-semibold text-primary">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex flex-col gap-2">
            <Button size="md" href={contactHref} iconTrailing={ArrowRight} onClick={() => pushEvent("consultation_cta_clicked", { location: "solution_finder_live_match" })}>
              {top?.ctaLabel ?? "Talk with an expert"}
            </Button>
            <Button size="md" color="secondary" href="/solutions">
              Full catalog
            </Button>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-2xl bg-primary p-5 ring-1 ring-secondary md:p-6">
          <div className="flex items-center gap-3">
            <IconBadge icon={Zap} className="size-9 rounded-lg" />
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-brand-secondary uppercase">Problem-first paths</p>
              <h2 className="text-lg font-semibold text-primary">Start from the pressure</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {PROBLEM_STARTERS.map((starter) => (
              <button
                key={starter.id}
                type="button"
                onClick={() => applyStarter(starter)}
                className="rounded-xl bg-secondary p-4 text-left ring-1 ring-secondary transition hover:-translate-y-0.5 hover:ring-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              >
                <span className="text-sm font-semibold text-primary">{starter.label}</span>
                <span className="mt-1 block text-sm text-tertiary">{starter.detail}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-primary p-5 ring-1 ring-secondary md:p-6">
          <div className="flex items-center gap-3">
            <IconBadge icon={Target04} className="size-9 rounded-lg" />
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-brand-secondary uppercase">Business goals</p>
              <h2 className="text-lg font-semibold text-primary">Outcome filters</h2>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {GOALS.map((goal) => {
              const selected = selectedGoals.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  type="button"
                  data-testid={`finder-goal-${goal.id}`}
                  aria-pressed={selected}
                  onClick={() => toggleGoal(goal.id)}
                  className={cx(
                    "rounded-full px-3 py-2 text-sm font-semibold ring-1 ring-inset transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                    selected ? "bg-brand-solid text-white ring-transparent" : "bg-secondary text-secondary ring-secondary hover:ring-brand",
                  )}
                  title={goal.detail}
                >
                  {goal.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {(Object.keys(weights) as WeightKey[]).map((key) => (
              <label key={key} className="block rounded-xl bg-secondary p-4 ring-1 ring-secondary">
                <span className="flex items-center justify-between gap-3 text-sm font-semibold text-primary">
                  <span className="capitalize">{key}</span>
                  <span className="text-brand-secondary">{weights[key]}</span>
                </span>
                <input
                  data-testid={`finder-weight-${key}`}
                  type="range"
                  min={0}
                  max={100}
                  value={weights[key]}
                  onChange={(event) => setWeights((currentWeights) => ({ ...currentWeights, [key]: Number(event.target.value) }))}
                  className="mt-3 h-2 w-full accent-[var(--color-bg-brand-solid)]"
                />
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-primary p-3 ring-1 ring-secondary md:p-4">
        <div className="grid gap-2 md:grid-cols-4">
          {[
            { id: "recommendations" as View, label: "Recommendations", icon: CheckCircle },
            { id: "stack" as View, label: "Build stack", icon: Dataflow01 },
            { id: "compare" as View, label: "Compare", icon: Activity },
            { id: "plan" as View, label: "Next steps", icon: ArrowRight },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={`finder-tab-${tab.id}`}
                aria-pressed={activeView === tab.id}
                onClick={() => setActiveView(tab.id)}
                className={cx(
                  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ring-1 ring-inset transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                  activeView === tab.id ? "bg-brand-solid text-white ring-transparent" : "bg-secondary text-secondary ring-secondary hover:ring-brand",
                )}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {activeView === "recommendations" && (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {recommendations.map((solution) => (
            <SolutionCard
              key={solution.slug}
              solution={solution}
              isPinned={pinned.includes(solution.slug)}
              isStacked={stack.includes(solution.slug)}
              onPin={() => togglePinned(solution.slug)}
              onStack={() => toggleStack(solution.slug)}
            />
          ))}
        </section>
      )}

      {activeView === "stack" && (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="rounded-2xl bg-primary p-5 ring-1 ring-secondary md:p-6">
            <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">Stack builder</p>
            <h2 className="mt-2 text-display-xs font-semibold text-primary">Recommended operating stack</h2>
            <ol className="mt-6 space-y-3">
              {stackItems.map((item, index) => (
                <li key={item.slug} className="flex gap-3 rounded-xl bg-secondary p-4 ring-1 ring-secondary">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-solid text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-primary">{item.title}</p>
                    <p className="mt-1 text-sm text-tertiary">{item.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleStack(item.slug)}
                    className="text-sm font-semibold text-brand-secondary hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button size="md" href={contactHref} iconTrailing={ArrowRight}>
                Review this stack
              </Button>
              <Button size="md" color="secondary" onClick={() => setStack(recommendedStack.map((item) => item.slug))}>
                Use recommended stack
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-secondary p-5 ring-1 ring-secondary md:p-6">
            <div aria-hidden="true" className="texture-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" />
            <div className="relative">
              <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">Architecture preview</p>
              <h2 className="mt-2 text-display-xs font-semibold text-primary">How the selected stack fits</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {stackItems.map((item, index) => {
                  const image = imageFor(item);
                  return (
                    <div key={item.slug} className="relative overflow-hidden rounded-xl bg-primary p-4 ring-1 ring-secondary">
                      {image && (
                        <img src={image} alt="" loading="lazy" decoding="async" className="absolute inset-y-0 right-0 h-full w-1/2 object-cover opacity-20" />
                      )}
                      <div className="relative">
                        <span className="text-xs font-semibold text-brand-secondary">Layer {index + 1}</span>
                        <p className="mt-1 font-semibold text-primary">{item.role}</p>
                        <p className="mt-1 text-sm text-tertiary">{item.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 rounded-xl bg-primary p-4 ring-1 ring-secondary">
                <p className="text-sm font-semibold text-primary">Operating model</p>
                <p className="mt-1 text-sm text-tertiary">
                  ICE owns the managed layers, escalation paths, recovery process, and service-level reporting that match this stack.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeView === "compare" && (
        <section className="overflow-hidden rounded-2xl bg-primary ring-1 ring-secondary">
          <div className="border-b border-secondary p-5 md:p-6">
            <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">Comparison mode</p>
            <h2 className="mt-2 text-display-xs font-semibold text-primary">Pinned solution comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-3xl text-left">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold tracking-wide text-quaternary uppercase">Solution</th>
                  <th className="px-5 py-3 text-xs font-semibold tracking-wide text-quaternary uppercase">Fit</th>
                  <th className="px-5 py-3 text-xs font-semibold tracking-wide text-quaternary uppercase">Best use</th>
                  <th className="px-5 py-3 text-xs font-semibold tracking-wide text-quaternary uppercase">Timeline</th>
                  <th className="px-5 py-3 text-xs font-semibold tracking-wide text-quaternary uppercase">Complexity</th>
                  <th className="px-5 py-3 text-xs font-semibold tracking-wide text-quaternary uppercase">CTA</th>
                </tr>
              </thead>
              <tbody>
                {compareItems.map((item) => (
                  <tr key={item.slug} className="border-t border-secondary">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <IconBadge icon={item.icon} className="size-8 rounded-lg" />
                        <span className="font-semibold text-primary">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4"><FitMeter value={item.fit} /></td>
                    <td className="px-5 py-4 text-sm text-tertiary">{item.role}</td>
                    <td className="px-5 py-4 text-sm font-medium text-secondary">{item.timeline}</td>
                    <td className="px-5 py-4 text-sm font-medium text-secondary">{item.complexity}</td>
                    <td className="px-5 py-4">
                      <Link href={item.href} className="text-sm font-semibold text-brand-secondary hover:underline">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeView === "plan" && (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="rounded-2xl bg-primary p-5 ring-1 ring-secondary md:p-6">
            <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">What happens next</p>
            <h2 className="mt-2 text-display-xs font-semibold text-primary">Implementation path</h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-5">
              {[
                ["01", "Assess", top?.nextStep ?? "Document goals, systems, owners, and risk."],
                ["02", "Design", "Create target architecture, service levels, security boundaries, and migration sequence."],
                ["03", "Validate", "Test access, backup, recovery, failover, monitoring, and escalation paths."],
                ["04", "Launch", "Move workloads or services through a controlled cutover plan."],
                ["05", "Manage", "Operate, report, optimize, and adjust the stack as business needs change."],
              ].map(([stepNumber, label, detail]) => (
                <li key={stepNumber} className="rounded-xl bg-secondary p-4 ring-1 ring-secondary">
                  <span className="text-xs font-semibold text-brand-secondary">{stepNumber}</span>
                  <p className="mt-2 font-semibold text-primary">{label}</p>
                  <p className="mt-1 text-sm text-tertiary">{detail}</p>
                </li>
              ))}
            </ol>
          </div>

          <aside className="rounded-2xl bg-secondary p-5 ring-1 ring-secondary md:p-6">
            <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">Saved result</p>
            <h2 className="mt-2 text-xl font-semibold text-primary">Shareable recommendation</h2>
            <p className="mt-2 text-sm text-tertiary">
              {top ? `${top.title} is the strongest first conversation, with ${stackItems.length} services in the working stack.` : "Complete the finder to create a shareable plan."}
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Button size="md" onClick={copyShareLink}>
                {copyLabel}
              </Button>
              <Button size="md" color="secondary" href={mailtoHref}>
                Email summary
              </Button>
              <Button size="md" color="secondary" href={contactHref} iconTrailing={ArrowRight}>
                Talk with ICE
              </Button>
            </div>
          </aside>
        </section>
      )}
    </div>
  );
}

const QUICK_QUESTIONS = QUESTIONS.slice(0, 4);

function getFitLabel(
  fit: number,
  copy: TextValues<typeof DEFAULT_FINDER_COPY.cards> = DEFAULT_FINDER_COPY.cards,
) {
  if (fit >= 75) return copy.strong_fit;
  if (fit >= 55) return copy.good_fit;
  return copy.potential_fit;
}

function getResultReasons(
  solution: RankedSolution,
  reasonCopy: TextValues<typeof DEFAULT_FINDER_COPY.reasons> = DEFAULT_FINDER_COPY.reasons,
) {
  const fallbacks = [
    fillFinderTemplate(reasonCopy.role_template, {
      role: solution.role.toLowerCase(),
      role_original: solution.role,
    }),
    fillFinderTemplate(reasonCopy.timeline_template, { timeline: solution.timeline }),
    solution.proof,
  ];
  const reasons = Array.from(new Set([...solution.reasons, ...fallbacks].filter(Boolean))).slice(0, 3);
  return reasons.length > 0 || !reasonCopy.broad_discovery
    ? reasons
    : [reasonCopy.broad_discovery];
}

function FinderResultCard({
  solution,
  featured = false,
  cardCopy,
  reasonCopy,
}: {
  solution: RankedSolution;
  featured?: boolean;
  cardCopy: TextValues<typeof DEFAULT_FINDER_COPY.cards>;
  reasonCopy: TextValues<typeof DEFAULT_FINDER_COPY.reasons>;
}) {
  const image = imageFor(solution);
  const reasons = getResultReasons(solution, reasonCopy);

  return (
    <article
      className={cx(
        "group relative isolate flex h-full flex-col overflow-hidden rounded-2xl bg-primary ring-1 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg",
        featured ? "p-6 ring-brand md:p-8" : "p-5 ring-secondary hover:ring-brand",
      )}
    >
      {image && (
        <div
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden transition duration-500",
            featured ? "h-52 opacity-45 group-hover:opacity-65" : "h-36 opacity-25 group-hover:opacity-50",
          )}
        >
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full scale-105 object-cover transition duration-500 group-hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-bg-primary)]/50 to-[var(--color-bg-primary)]" />
        </div>
      )}

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <IconBadge icon={solution.icon} />
          <span className="rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-brand-secondary ring-1 ring-brand">
            {getFitLabel(solution.fit, cardCopy)}
          </span>
        </div>
        <p className={cx("text-xs font-medium tracking-[0.18em] text-brand-secondary uppercase", featured ? "mt-24" : "mt-14")}>
          {featured ? cardCopy.featured_eyebrow : solution.category}
        </p>
        <h3 className={cx("mt-2 font-semibold text-primary", featured ? "text-display-xs md:text-display-sm" : "text-xl")}>
          {solution.title}
        </h3>
        <p className="mt-2 text-sm text-tertiary">{solution.summary}</p>

        <div className="mt-5">
          {cardCopy.why_heading && (
            <p className="text-xs font-semibold tracking-wide text-quaternary uppercase">{cardCopy.why_heading}</p>
          )}
          <ul className="mt-3 space-y-2">
            {reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2 text-sm text-secondary">
                <CheckCircle className="mt-0.5 size-4 shrink-0 text-brand-secondary" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto pt-6">
          <Button
            size={featured ? "md" : "sm"}
            href={solution.href}
            iconTrailing={ArrowRight}
            onClick={() => pushEvent("solution_finder_result_clicked", { href: solution.href })}
          >
            {fillFinderTemplate(cardCopy.explore_template, { title: solution.title })}
          </Button>
        </div>
      </div>
    </article>
  );
}

const EMPTY_FINDER_CONTENT: SolutionFinderContent = {};

export default function SolutionFinder({
  className,
  content = EMPTY_FINDER_CONTENT,
  catalog,
}: {
  className?: string;
  content?: SolutionFinderContent;
  catalog?: SolutionCatalogItem[] | null;
}) {
  const [mode, setMode] = useState<FinderMode>("quick");
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<GoalId[]>([]);
  const [weights, setWeights] = useState<Record<WeightKey, number>>(DEFAULT_WEIGHTS);
  const copy = useMemo(() => resolveFinderCopy(content), [content]);
  const questions = useMemo(() => resolveQuestions(content.questions), [content.questions]);
  const quickQuestions = useMemo(
    () => questions.filter((question) => QUICK_QUESTIONS.some((item) => item.key === question.key)),
    [questions],
  );
  const goals = useMemo(() => resolveGoals(content.goals), [content.goals]);
  const problemStarters = useMemo(
    () => resolveProblemStarters(content.problem_starters),
    [content.problem_starters],
  );
  const solutions = useMemo(
    () => resolveSolutions(content.solution_copy, catalog),
    [catalog, content.solution_copy],
  );
  const modeCopy = useMemo(() => resolveModeCopy(content.modes), [content.modes]);

  useEffect(() => {
    const state = decodeFinderState(new URLSearchParams(window.location.search).get("finder"));
    if (!state) return;
    const timeout = window.setTimeout(() => {
      if (state.answers) setAnswers(state.answers);
      if (state.goals) setSelectedGoals(state.goals.filter((goal): goal is GoalId => goals.some((item) => item.id === goal)));
      if (state.weights) setWeights({ ...DEFAULT_WEIGHTS, ...state.weights });
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [goals]);

  const activeQuestions = mode === "quick" ? quickQuestions : questions;
  const currentStep = activeQuestions.length > 0 ? Math.min(step, activeQuestions.length - 1) : 0;
  const current = activeQuestions[currentStep];
  const answeredCount = activeQuestions.filter((question) => answers[question.key]).length;
  const totalAnswered = questions.filter((question) => answers[question.key]).length;
  const hasEnoughAnswers = totalAnswered >= 3;
  const ranked = useMemo(
    () =>
      solutions.map((solution) => scoreSolution(
        solution,
        answers,
        selectedGoals,
        weights,
        questions,
        goals,
        copy.reasons,
      )).sort(
        (a, b) => b.score - a.score,
      ),
    [answers, copy.reasons, goals, questions, selectedGoals, solutions, weights],
  );
  const primary = hasEnoughAnswers ? ranked[0] : undefined;
  const supporting = hasEnoughAnswers ? ranked.slice(1, 3) : [];
  const answerItems = questions.flatMap((question, index) => {
    const selected = question.options.find((option) => option.id === answers[question.key]);
    return selected ? [{ question, selected, index }] : [];
  });
  const contactHref = `/contact?service=${encodeURIComponent(primary?.title ?? "Solution Finder")}&source=solution_finder&summary=${encodeURIComponent(
    [...getAnswerLabels(answers, questions), ...selectedGoals.map((goal) => goals.find((item) => item.id === goal)?.label).filter(Boolean)].join(", "),
  )}`;
  const stages = useMemo(() => resolveStages(content.stages, mode), [content.stages, mode]);
  const remainingAnswers = Math.max(0, 3 - totalAnswered);
  const situationHeading = hasEnoughAnswers
    ? fillFinderTemplate(copy.situation.fit_found_template, {
        fit_label: getFitLabel(primary?.fit ?? 0, copy.cards),
      })
    : fillFinderTemplate(
        remainingAnswers === 1
          ? copy.situation.remaining_singular_template
          : copy.situation.remaining_plural_template,
        { count: remainingAnswers },
      );

  const changeMode = (nextMode: FinderMode) => {
    setMode(nextMode);
    setStep(0);
  };

  const selectAnswer = (key: AnswerKey, value: string) => {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [key]: value }));
    pushEvent("solution_finder_answer", { question: key, answer: value });
  };

  const continueFinder = () => {
    if (!current) return;
    if (currentStep < activeQuestions.length - 1) {
      setStep(currentStep + 1);
      return;
    }
    window.setTimeout(() => document.getElementById("finder-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const applyStarter = (starter: ProblemStarter) => {
    setAnswers((currentAnswers) => ({ ...currentAnswers, ...starter.answers }));
    setSelectedGoals((currentGoals) => Array.from(new Set([...currentGoals, ...starter.goals])));
    setStep(0);
    pushEvent("solution_finder_starter_clicked", { starter: starter.id });
  };

  const toggleGoal = (goal: GoalId) => {
    setSelectedGoals((currentGoals) =>
      currentGoals.includes(goal) ? currentGoals.filter((item) => item !== goal) : [...currentGoals, goal],
    );
  };

  const reset = () => {
    setMode("quick");
    setAnswers({});
    setSelectedGoals([]);
    setWeights(DEFAULT_WEIGHTS);
    setStep(0);
  };

  return (
    <div data-testid="solution-finder" className={cx("space-y-8", className)}>
      <section className="rounded-2xl bg-primary p-5 ring-1 ring-secondary md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            {copy.chooser.eyebrow && (
              <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
                {copy.chooser.eyebrow}
              </p>
            )}
            {copy.chooser.heading && (
              <h2 className="mt-2 text-display-xs font-semibold text-primary">{copy.chooser.heading}</h2>
            )}
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-secondary ring-1 ring-secondary transition hover:text-brand-secondary hover:ring-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            <RefreshCw01 className="size-4" />
            {copy.chooser.reset_label}
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {(["quick", "advanced"] as const).map((id) => {
            const item = modeCopy[id];
            return (
              <button
                key={id}
                type="button"
                aria-pressed={mode === id}
                onClick={() => changeMode(id)}
                className={cx(
                  "rounded-xl p-4 text-left ring-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                  mode === id ? "bg-brand-solid text-white ring-transparent" : "bg-secondary ring-secondary hover:ring-brand",
                )}
              >
                {item.label && (
                  <span className={cx("font-semibold", mode === id ? "text-white" : "text-primary")}>{item.label}</span>
                )}
                {item.detail && (
                  <span className={cx("mt-1 block text-sm", mode === id ? "text-white/75" : "text-tertiary")}>{item.detail}</span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {problemStarters.length > 0 && <section className="rounded-2xl bg-secondary p-5 ring-1 ring-secondary md:p-6">
        <div className="flex items-center gap-3">
          <IconBadge icon={Zap} className="size-9 rounded-lg" />
          <div>
            {copy.shortcut.eyebrow && (
              <p className="text-xs font-medium tracking-[0.18em] text-brand-secondary uppercase">
                {copy.shortcut.eyebrow}
              </p>
            )}
            {copy.shortcut.heading && <h2 className="text-lg font-semibold text-primary">{copy.shortcut.heading}</h2>}
          </div>
        </div>
        {copy.shortcut.description && <p className="mt-2 text-sm text-tertiary">{copy.shortcut.description}</p>}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {problemStarters.map((starter) => (
            <button
              key={starter.id}
              type="button"
              onClick={() => applyStarter(starter)}
              className="rounded-xl bg-primary p-4 text-left ring-1 ring-secondary transition hover:-translate-y-0.5 hover:ring-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              <span className="text-sm font-semibold text-primary">{starter.label}</span>
              <span className="mt-1 block text-sm text-tertiary">{starter.detail}</span>
            </button>
          ))}
        </div>
      </section>}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-2xl bg-primary p-5 ring-1 ring-secondary md:p-6">
          {current ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  {current.eyebrow && (
                    <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
                      {current.eyebrow}
                    </p>
                  )}
                  {current.prompt && (
                    <h2 className="mt-2 text-display-xs font-semibold text-primary md:text-display-sm">
                      {current.prompt}
                    </h2>
                  )}
                </div>
                {copy.questionnaire.answered_template && (
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary ring-1 ring-secondary">
                    {fillFinderTemplate(copy.questionnaire.answered_template, {
                      answered: answeredCount,
                      total: activeQuestions.length,
                    })}
                  </span>
                )}
              </div>

              {stages.length > 0 && (
                <div className="mt-6 grid gap-2 sm:grid-cols-3">
                  {stages.map((stage, stageIndex) => {
                    const complete = activeQuestions
                      .slice(stage.start, stage.end + 1)
                      .every((question) => answers[question.key]);
                    const active = currentStep >= stage.start && currentStep <= stage.end;
                    return (
                      <button
                        key={`${stage.start}-${stage.end}-${stageIndex}`}
                        type="button"
                        onClick={() => setStep(Math.min(stage.start, Math.max(0, activeQuestions.length - 1)))}
                        className={cx(
                          "rounded-xl px-3 py-3 text-left text-xs font-semibold ring-1 transition",
                          active
                            ? "bg-brand-solid text-white ring-transparent"
                            : complete
                              ? "bg-brand-primary text-brand-secondary ring-brand"
                              : "bg-secondary text-tertiary ring-secondary hover:ring-brand",
                        )}
                      >
                        {stage.label && <span className="block">{stage.label}</span>}
                        {copy.questionnaire.stage_questions_template && (
                          <span className={cx("mt-1 block font-normal", active ? "text-white/70" : "text-quaternary")}>
                            {fillFinderTemplate(copy.questionnaire.stage_questions_template, {
                              start: stage.start + 1,
                              end: stage.end + 1,
                            })}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {current.options.length > 0 && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {current.options.map((option) => {
                    const selected = answers[current.key] === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        data-testid={`finder-option-${current.key}-${option.id}`}
                        aria-pressed={selected}
                        onClick={() => selectAnswer(current.key, option.id)}
                        className={cx(
                          "group min-h-28 rounded-xl bg-secondary p-4 text-left ring-1 ring-secondary transition duration-150 hover:-translate-y-0.5 hover:ring-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                          selected && "bg-brand-solid text-white ring-transparent",
                        )}
                      >
                        {option.label && (
                          <span className={cx("inline-flex items-center gap-2 text-md font-semibold", selected ? "text-white" : "text-primary")}>
                            {option.label}
                            {selected && <CheckCircle className="size-4" />}
                          </span>
                        )}
                        {option.detail && (
                          <span className={cx("mt-2 block text-sm", selected ? "text-white/75" : "text-tertiary")}>
                            {option.detail}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 flex items-center justify-between gap-3">
                <Button size="sm" color="secondary" isDisabled={currentStep === 0} onClick={() => setStep(Math.max(0, currentStep - 1))}>
                  {copy.questionnaire.back_label}
                </Button>
                <Button
                  size="sm"
                  isDisabled={!answers[current.key]}
                  onClick={continueFinder}
                  iconTrailing={ChevronRight}
                >
                  {currentStep === activeQuestions.length - 1
                    ? copy.questionnaire.recommendations_label
                    : copy.questionnaire.continue_label}
                </Button>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              {copy.questionnaire.no_questions_heading && (
                <h2 className="text-xl font-semibold text-primary">{copy.questionnaire.no_questions_heading}</h2>
              )}
              {copy.questionnaire.no_questions_description && (
                <p className="mx-auto mt-2 max-w-lg text-sm text-tertiary">
                  {copy.questionnaire.no_questions_description}
                </p>
              )}
            </div>
          )}
        </div>

        <aside className="self-start rounded-2xl bg-secondary p-5 ring-1 ring-secondary lg:sticky lg:top-24 md:p-6">
          {copy.situation.eyebrow && (
            <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
              {copy.situation.eyebrow}
            </p>
          )}
          {situationHeading && <h2 className="mt-2 text-xl font-semibold text-primary">{situationHeading}</h2>}
          {(hasEnoughAnswers ? copy.situation.ready_description : copy.situation.waiting_description) && (
            <p className="mt-2 text-sm text-tertiary">
              {hasEnoughAnswers ? copy.situation.ready_description : copy.situation.waiting_description}
            </p>
          )}

          {answerItems.length > 0 ? (
            <dl className="mt-5 space-y-3">
              {answerItems.map(({ question, selected, index }) => (
                <div key={question.key} className="rounded-xl bg-primary p-3 ring-1 ring-secondary">
                  <dt className="text-xs font-medium text-quaternary">{question.eyebrow}</dt>
                  <dd className="mt-1 flex items-center justify-between gap-3 text-sm font-semibold text-primary">
                    <span>{selected.label}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const quickIndex = quickQuestions.findIndex((item) => item.key === question.key);
                        if (mode === "quick" && quickIndex >= 0) {
                          setStep(quickIndex);
                        } else {
                          setMode("advanced");
                          setStep(index);
                        }
                      }}
                      className="text-xs font-semibold text-brand-secondary hover:underline"
                    >
                      {copy.situation.edit_label}
                    </button>
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            copy.situation.empty_answers && (
              <div className="mt-5 rounded-xl border border-dashed border-secondary p-4 text-sm text-quaternary">
                {copy.situation.empty_answers}
              </div>
            )
          )}
        </aside>
      </section>

      {mode === "advanced" && (
        <details className="group rounded-2xl bg-primary ring-1 ring-secondary">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 md:p-6">
            <div>
              {copy.fineTune.eyebrow && (
                <p className="text-xs font-medium tracking-[0.18em] text-brand-secondary uppercase">
                  {copy.fineTune.eyebrow}
                </p>
              )}
              {copy.fineTune.heading && (
                <h2 className="mt-1 text-lg font-semibold text-primary">{copy.fineTune.heading}</h2>
              )}
              {copy.fineTune.description && (
                <p className="mt-1 text-sm text-tertiary">{copy.fineTune.description}</p>
              )}
            </div>
            <ChevronRight className="size-5 shrink-0 text-tertiary transition group-open:rotate-90" />
          </summary>
          <div className="border-t border-secondary p-5 md:p-6">
            <div className="flex flex-wrap gap-2">
              {goals.map((goal) => {
                const selected = selectedGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleGoal(goal.id)}
                    className={cx(
                      "rounded-full px-3 py-2 text-sm font-semibold ring-1 ring-inset transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                      selected ? "bg-brand-solid text-white ring-transparent" : "bg-secondary text-secondary ring-secondary hover:ring-brand",
                    )}
                    title={goal.detail}
                  >
                    {goal.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {(Object.keys(weights) as WeightKey[]).map((key) => (
                <label key={key} className="block rounded-xl bg-secondary p-4 ring-1 ring-secondary">
                  <span className="flex items-center justify-between gap-3 text-sm font-semibold text-primary">
                    <span>{copy.weightLabels[key]}</span>
                    <span className="text-brand-secondary">{weights[key]}</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={weights[key]}
                    onChange={(event) => setWeights((currentWeights) => ({ ...currentWeights, [key]: Number(event.target.value) }))}
                    className="mt-3 h-2 w-full accent-[var(--color-bg-brand-solid)]"
                  />
                </label>
              ))}
            </div>
          </div>
        </details>
      )}

      <section id="finder-results" className="scroll-mt-24">
        {!hasEnoughAnswers || !primary ? (
          <div className="rounded-2xl border border-dashed border-secondary bg-secondary p-8 text-center md:p-12">
            <IconBadge icon={Target04} className="mx-auto" />
            {copy.results.empty_heading && (
              <h2 className="mt-4 text-xl font-semibold text-primary">{copy.results.empty_heading}</h2>
            )}
            {copy.results.empty_description && (
              <p className="mx-auto mt-2 max-w-xl text-sm text-tertiary">
                {copy.results.empty_description}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                {copy.results.eyebrow && (
                  <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
                    {copy.results.eyebrow}
                  </p>
                )}
                {copy.results.heading && (
                  <h2 className="mt-2 text-display-xs font-semibold text-primary md:text-display-sm">
                    {copy.results.heading}
                  </h2>
                )}
                {copy.results.description && (
                  <p className="mt-2 max-w-2xl text-sm text-tertiary">{copy.results.description}</p>
                )}
              </div>
              <Button
                size="md"
                href={contactHref}
                iconTrailing={ArrowRight}
                onClick={() => pushEvent("consultation_cta_clicked", { location: "solution_finder_results" })}
              >
                {copy.results.contact_label}
              </Button>
            </div>

            <FinderResultCard
              solution={primary}
              featured
              cardCopy={copy.cards}
              reasonCopy={copy.reasons}
            />

            <div>
              {copy.results.supporting_heading && (
                <h3 className="text-lg font-semibold text-primary">{copy.results.supporting_heading}</h3>
              )}
              {copy.results.supporting_description && (
                <p className="mt-1 text-sm text-tertiary">{copy.results.supporting_description}</p>
              )}
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                {supporting.map((solution) => (
                  <FinderResultCard
                    key={solution.slug}
                    solution={solution}
                    cardCopy={copy.cards}
                    reasonCopy={copy.reasons}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export function SolutionFinderPromo({
  className,
  eyebrow = "Solution finder",
  heading = "Find a clear starting solution from your workload, risk, and timing.",
  cta = { label: "Open finder", href: "/solutions/find" },
}: {
  className?: string;
  eyebrow?: string;
  heading?: string;
  cta?: { label?: string; href?: string };
}) {
  return (
    <div className={cx("rounded-2xl bg-secondary p-6 ring-1 ring-secondary", className)}>
      <p className="text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">{eyebrow}</p>
      <p className="mt-2 text-lg font-semibold text-primary">{heading}</p>
      <Button href={cta.href ?? "/solutions/find"} size="md" className="mt-4" iconTrailing={ArrowRight}>
        {cta.label ?? "Open finder"}
      </Button>
    </div>
  );
}
