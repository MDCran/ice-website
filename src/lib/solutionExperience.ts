export type SolutionExperience = {
  outcome: string;
  proof: string;
  industries: string[];
  platforms: string[];
  architecture: string[];
  resources: { title: string; kind: string; href: string }[];
};

const DEFAULT_EXPERIENCE: SolutionExperience = {
  outcome: "Move from reactive IT to measurable service levels",
  proof: "US-based operations · Enterprise infrastructure · 24/7 escalation",
  industries: ["Manufacturing", "Finance", "Healthcare"],
  platforms: ["Hybrid"],
  architecture: ["Your environment", "ICE secure edge", "Managed platform", "24/7 operations"],
  resources: [
    { title: "Enterprise infrastructure assessment checklist", kind: "Checklist", href: "/resources" },
    { title: "How to evaluate a managed services partner", kind: "Guide", href: "/resources" },
  ],
};

export const SOLUTION_EXPERIENCE: Record<string, SolutionExperience> = {
  "managed-cloud-hosting": {
    outcome: "Run critical workloads at 99.99% target availability",
    proof: "Manufacturing · IBM Power + x86 · Consolidated hosting with 24/7 operations",
    industries: ["Manufacturing", "Finance", "Healthcare"],
    platforms: ["IBM i", "Hybrid"],
    architecture: ["Users & sites", "Secure connectivity", "ICE cloud", "Managed compute", "Backup"],
    resources: [
      { title: "Managed cloud for IBM Power workloads", kind: "Buyer guide", href: "/resources" },
      { title: "Cloud hosting readiness checklist", kind: "Checklist", href: "/contact?service=Managed%20Cloud%20Hosting" },
    ],
  },
  "managed-private-cloud": {
    outcome: "Gain dedicated cloud control without owning the operations",
    proof: "Financial services · Dedicated compute · Isolated, managed infrastructure",
    industries: ["Finance", "Healthcare", "Manufacturing"],
    platforms: ["Hybrid", "Azure"],
    architecture: ["Private network", "Policy edge", "Dedicated cluster", "Protected storage", "Operations"],
    resources: DEFAULT_EXPERIENCE.resources,
  },
  "managed-hybrid-cloud": {
    outcome: "Unify on-prem and cloud operations under one accountable team",
    proof: "Distribution · IBM i + Azure · One operating model across mixed infrastructure",
    industries: ["Manufacturing", "Finance"],
    platforms: ["IBM i", "Azure", "Hybrid"],
    architecture: ["On-prem systems", "Private link", "ICE cloud", "Azure services", "Unified monitoring"],
    resources: DEFAULT_EXPERIENCE.resources,
  },
  "cloud-migration": {
    outcome: "Move workloads with a controlled, rollback-ready cutover",
    proof: "Enterprise IT · IBM i + Windows · Dependency-mapped migration plan",
    industries: ["Manufacturing", "Finance", "Healthcare"],
    platforms: ["IBM i", "Azure", "Hybrid"],
    architecture: ["Discovery", "Landing zone", "Replication", "Cutover", "Validation"],
    resources: DEFAULT_EXPERIENCE.resources,
  },
  "backup-as-a-service": {
    outcome: "Restore protected data in minutes—not after a crisis",
    proof: "Healthcare · Hybrid workloads · Encrypted copies with restore validation",
    industries: ["Healthcare", "Finance", "Manufacturing"],
    platforms: ["IBM i", "Azure", "Hybrid"],
    architecture: ["Production data", "Backup agent", "Encrypted transfer", "Immutable copy", "Restore validation"],
    resources: [
      { title: "Backup policy and retention worksheet", kind: "Worksheet", href: "/resources" },
      { title: "Ransomware-resilient backup checklist", kind: "Checklist", href: "/resources" },
    ],
  },
  "disaster-recovery": {
    outcome: "Recover priority systems in under 4 hours",
    proof: "Manufacturing · IBM i + Windows · Tested failover with defined RPO/RTO",
    industries: ["Manufacturing", "Finance", "Healthcare"],
    platforms: ["IBM i", "Azure", "Hybrid"],
    architecture: ["Production", "Continuous replication", "ICE recovery site", "Orchestration", "Business validation"],
    resources: [
      { title: "DR readiness and RPO/RTO worksheet", kind: "Runbook", href: "/resources" },
      { title: "What to require from a DRaaS partner", kind: "Buyer guide", href: "/resources" },
    ],
  },
  "high-availability": {
    outcome: "Fail over critical systems with near-zero disruption",
    proof: "Financial services · IBM Power · Continuously replicated standby capacity",
    industries: ["Finance", "Manufacturing"],
    platforms: ["IBM i", "Hybrid"],
    architecture: ["Primary system", "Journal replication", "Standby system", "Health monitor", "Automated failover"],
    resources: DEFAULT_EXPERIENCE.resources,
  },
  "ransomware-recovery": {
    outcome: "Recover from a clean, immutable point after an attack",
    proof: "Mid-market enterprise · Hybrid stack · Isolated recovery copies and guided restore",
    industries: ["Healthcare", "Finance", "Manufacturing"],
    platforms: ["IBM i", "Azure", "Hybrid"],
    architecture: ["Production", "Threat monitoring", "Immutable vault", "Clean room", "Validated recovery"],
    resources: DEFAULT_EXPERIENCE.resources,
  },
  "as400": {
    outcome: "Modernize AS400 without rewriting mission-critical applications",
    proof: "IBM i enterprise - AS/400 hosting, security, backup, HA, and DR under one managed model",
    industries: ["Manufacturing", "Finance", "Healthcare"],
    platforms: ["IBM i", "Hybrid"],
    architecture: ["AS400 workloads", "Secure connectivity", "IBM Power platform", "Protected storage", "ICE operations"],
    resources: [
      { title: "AS400 modernization assessment", kind: "Assessment", href: "/contact?service=AS400" },
      { title: "IBM i security hardening checklist", kind: "Checklist", href: "/resources" },
    ],
  },
  "ibm-i-security": {
    outcome: "Reduce IBM i exposure with prioritized, auditable controls",
    proof: "Manufacturing · IBM i · Authority, exit-point, and audit hardening",
    industries: ["Manufacturing", "Finance", "Healthcare"],
    platforms: ["IBM i"],
    architecture: ["IBM i users", "Identity controls", "Exit-point security", "Audit stream", "ICE monitoring"],
    resources: [
      { title: "IBM i security hardening checklist", kind: "Checklist", href: "/resources" },
      { title: "IBM i risk assessment guide", kind: "Guide", href: "/contact?service=IBM%20i%20Security" },
    ],
  },
  "protection-suite": {
    outcome: "Close common endpoint and identity gaps with one protection layer",
    proof: "Multi-site enterprise · Endpoints + network · Coordinated prevention and response",
    industries: ["Healthcare", "Finance", "Manufacturing"],
    platforms: ["Azure", "Hybrid"],
    architecture: ["Users & devices", "Policy enforcement", "Threat prevention", "ICE monitoring", "Response"],
    resources: DEFAULT_EXPERIENCE.resources,
  },
  "security-monitoring": {
    outcome: "Move from alert noise to 24/7 triage and escalation",
    proof: "Regulated enterprise · Hybrid infrastructure · Always-on monitoring with response paths",
    industries: ["Healthcare", "Finance", "Manufacturing"],
    platforms: ["IBM i", "Azure", "Hybrid"],
    architecture: ["Infrastructure", "Security telemetry", "ICE SOC", "Triage", "Escalation"],
    resources: DEFAULT_EXPERIENCE.resources,
  },
  "threat-detection": {
    outcome: "Detect and contain priority threats before they spread",
    proof: "Distributed enterprise · Endpoint + network telemetry · Coordinated investigation and containment",
    industries: ["Healthcare", "Finance", "Manufacturing"],
    platforms: ["Azure", "Hybrid"],
    architecture: ["Endpoints", "Telemetry", "Detection engine", "ICE analysts", "Containment"],
    resources: DEFAULT_EXPERIENCE.resources,
  },
  "endpoint-security": {
    outcome: "Protect every managed endpoint with continuously enforced policy",
    proof: "Multi-site business · Windows endpoints · Central policy and rapid isolation",
    industries: ["Healthcare", "Finance", "Manufacturing"],
    platforms: ["Azure", "Hybrid"],
    architecture: ["Devices", "Endpoint agent", "Cloud policy", "Threat analysis", "Response"],
    resources: DEFAULT_EXPERIENCE.resources,
  },
  "managed-microsoft": {
    outcome: "Keep Microsoft and Azure environments patched, governed, and supported",
    proof: "Professional services · Microsoft 365 + Azure · Proactive operations and escalation",
    industries: ["Finance", "Healthcare"],
    platforms: ["Azure", "Hybrid"],
    architecture: ["Users", "Microsoft 365", "Azure tenant", "ICE operations", "Security & reporting"],
    resources: DEFAULT_EXPERIENCE.resources,
  },
  "automation-suite": {
    outcome: "Turn repetitive remediation into governed, repeatable workflows",
    proof: "Enterprise IT · Mixed infrastructure · Automated patching and vulnerability response",
    industries: ["Manufacturing", "Finance", "Healthcare"],
    platforms: ["Azure", "Hybrid"],
    architecture: ["Systems", "Inventory", "Automation policy", "Remediation", "Reporting"],
    resources: DEFAULT_EXPERIENCE.resources,
  },
  "systems-management": {
    outcome: "Reduce operational backlog with proactive monitoring and patching",
    proof: "Mid-market enterprise · Servers + endpoints · One accountable operations queue",
    industries: ["Manufacturing", "Finance", "Healthcare"],
    platforms: ["IBM i", "Azure", "Hybrid"],
    architecture: ["Infrastructure", "Monitoring agents", "ICE operations", "Remediation", "Service reporting"],
    resources: DEFAULT_EXPERIENCE.resources,
  },
  "ibm-power-vs": {
    outcome: "Run IBM Power workloads in cloud capacity without replatforming",
    proof: "IBM i enterprise · Power Virtual Server · Managed migration and operations",
    industries: ["Manufacturing", "Finance"],
    platforms: ["IBM i", "Hybrid"],
    architecture: ["IBM i workloads", "Secure link", "PowerVS", "Managed storage", "ICE operations"],
    resources: DEFAULT_EXPERIENCE.resources,
  },
};

export function experienceFor(slug: string): SolutionExperience {
  return SOLUTION_EXPERIENCE[slug] ?? {
    ...DEFAULT_EXPERIENCE,
    architecture: [slug.replaceAll("-", " "), ...DEFAULT_EXPERIENCE.architecture.slice(1)],
  };
}
