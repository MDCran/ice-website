/**
 * Hardcoded fallbacks for solution detail pages when CMS content is
 * unavailable (missing env, unpublished rows, RLS, etc.). Keeps
 * `/solutions/[slug]` rendering instead of hard-404ing.
 */

export const SOLUTION_SLUGS = [
  "managed-cloud-hosting",
  "managed-private-cloud",
  "managed-hybrid-cloud",
  "cloud-migration",
  "backup-as-a-service",
  "disaster-recovery",
  "high-availability",
  "ransomware-recovery",
  "as400",
  "ibm-i-security",
  "protection-suite",
  "security-monitoring",
  "threat-detection",
  "endpoint-security",
  "managed-microsoft",
  "automation-suite",
  "systems-management",
  "ibm-power-vs",
] as const;

export type SolutionSlug = (typeof SOLUTION_SLUGS)[number];

export function isSolutionSlug(slug: string): slug is SolutionSlug {
  return (SOLUTION_SLUGS as readonly string[]).includes(slug);
}

type SectionMap = {
  hero: {
    headline: string;
    subheadline: string;
    proof_labels: string[];
  };
  features?: {
    eyebrow?: string;
    heading?: string;
    description?: string;
    items: { icon: string; title: string; description: string }[];
  };
  process: {
    items: { step: string; title: string; description: string }[];
  };
  benefits: {
    items: string[];
  };
  cta: {
    heading: string;
    description: string;
  };
  [key: string]: unknown;
};

export type SolutionFallbackPage = {
  title: string;
  meta_title: string;
  meta_description: string;
  sections: SectionMap;
  orderedSections: {
    section_key: string;
    section_type: string;
    content: Record<string, unknown>;
    sort_order: number;
    is_visible: boolean;
  }[];
};

const DEFAULT_PROCESS = {
  items: [
    { step: "01", title: "Understand your environment", description: "Review your applications, platforms, dependencies, and priorities." },
    { step: "02", title: "Agree on the service", description: "Set the scope, responsibilities, costs, and success measures before work begins." },
    { step: "03", title: "Plan the transition", description: "Document the implementation steps, timing, and validation plan." },
    { step: "04", title: "Support and improve", description: "Manage the agreed services and revisit the plan as your needs change." },
  ],
};

const DEFAULT_BENEFITS = {
  items: [
    "Reduce the burden of maintaining infrastructure in-house",
    "Keep business-critical applications while updating the platform around them",
    "Plan protection and recovery around application priorities",
    "Set clear service responsibilities before implementation",
  ],
};

const PROOF = ["IBM Business Partner since 1990", "AS400 and IBM i experience", "Cloud hosting", "Disaster recovery planning"];

function buildOrdered(sections: SectionMap): SolutionFallbackPage["orderedSections"] {
  const order: SolutionFallbackPage["orderedSections"] = [];
  let i = 0;
  for (const key of ["hero", "features", "process", "benefits", "cta"] as const) {
    const content = sections[key];
    if (!content) continue;
    order.push({
      section_key: key,
      section_type: key,
      content: content as Record<string, unknown>,
      sort_order: i++,
      is_visible: true,
    });
  }
  return order;
}

function page(
  title: string,
  subheadline: string,
  features?: SectionMap["features"],
): SolutionFallbackPage {
  const sections: SectionMap = {
    hero: { headline: title, subheadline, proof_labels: PROOF },
    features,
    process: DEFAULT_PROCESS,
    benefits: DEFAULT_BENEFITS,
    cta: {
      heading: `Ready to modernize with ${title}?`,
      description: "Talk with ICE about your environment, priorities, and the right next step.",
    },
  };

  return {
    title,
    meta_title: title,
    meta_description: subheadline.slice(0, 155),
    sections,
    orderedSections: buildOrdered(sections),
  };
}

const FALLBACKS: Record<SolutionSlug, SolutionFallbackPage> = {
  "managed-cloud-hosting": page(
    "Managed Cloud Hosting",
    "Managed cloud hosting for business applications, with workload assessment, operations, and protection scoped to your needs.",
    {
      eyebrow: "Key capabilities",
        heading: "Hosting shaped around your workloads",
      items: [
        { icon: "Monitor", title: "Managed operations", description: "Define monitoring, maintenance, escalation, and administration responsibilities for your service." },
        { icon: "Server", title: "Workload-fit hosting", description: "Select a platform based on application, operating-system, and performance requirements." },
        { icon: "Database", title: "Backup and recovery options", description: "Choose protection and recovery arrangements that fit the workload and agreed service scope." },
        { icon: "Zap", title: "Capacity planning", description: "Plan compute, storage, and network capacity around current use and expected change." },
        { icon: "Users", title: "Experienced support", description: "Work with an IBM-focused team that understands business-critical infrastructure." },
        { icon: "Lock", title: "Access and connectivity", description: "Review network design, user access, and application integrations before implementation." },
      ],
    },
  ),
  "managed-private-cloud": page(
    "Managed Private Cloud",
    "Dedicated private cloud environments with complete isolation, custom configurations, and enterprise SLAs.",
  ),
  "managed-hybrid-cloud": page(
    "Managed Hybrid Cloud",
    "Seamlessly bridge on-premises and cloud infrastructure with unified management and security.",
  ),
  "cloud-migration": page(
    "Cloud Migration Services",
    "Plan and execute cloud migrations with minimal downtime, full data integrity, and clear cutover runbooks.",
  ),
  "backup-as-a-service": page(
    "Backup as a Service",
    "Managed backup with verified recoverability, retention policies, and offsite protection for critical data.",
  ),
  "disaster-recovery": page(
    "Disaster Recovery",
    "Plan disaster recovery around application dependencies, acceptable data loss, restoration time, and recovery exercises.",
  ),
  "high-availability": page(
    "High Availability",
    "Always-on architectures that eliminate single points of failure and keep mission-critical systems online.",
  ),
  "ransomware-recovery": page(
    "Ransomware Recovery",
    "Immutable backups, rapid restore paths, and incident response to get operations back online after an attack.",
  ),
  "as400": (() => {
    const sections: SectionMap = {
      hero: {
        headline: "AS400",
        subheadline:
          "Keep your AS400 and IBM i applications running while you plan the next stage of hosting, support, backup, and recovery with an IBM-focused team with 30+ years in business.",
        proof_labels: ["IBM Business Partner since 1990", "AS400 and IBM i experience", "Hosting and support", "Recovery planning"],
      },
      features: {
        eyebrow: "AS400 services",
        heading: "AS400 hosting, IBM i support, security, backup, HA, and DR",
        description:
          "Start with your applications and operating requirements. ICE can help assess hosting, support, security, backup, availability, and recovery needs.",
        items: [
          {
            icon: "Server",
            title: "AS400 hosting and IBM i cloud hosting",
            description:
              "Move AS400, AS/400, iSeries, and IBM i workloads to ICE-managed IBM Power infrastructure with secure connectivity, monitored capacity, and predictable service levels.",
          },
          {
            icon: "Shield",
            title: "AS400 security hardening",
            description:
              "Harden object authority, user access, exit points, audit settings, and monitoring for IBM i environments that support regulated or uptime-sensitive operations.",
          },
          {
            icon: "Database",
            title: "AS400 backup and restore testing",
            description:
              "Protect IBM i data with managed backup policies, encrypted offsite copies, restore testing, and ransomware-aware recovery planning.",
          },
          {
            icon: "Zap",
            title: "AS400 high availability and disaster recovery",
            description:
              "Design replication, failover, RPO/RTO targets, and recovery runbooks for AS/400 and IBM i systems that cannot tolerate extended downtime.",
          },
          {
            icon: "RefreshCw",
            title: "AS400 migration and modernization",
            description:
              "Plan migrations from aging AS/400 hardware, iSeries, and IBM Power environments with dependency mapping, testing, rollback planning, and validated cutover steps.",
          },
          {
            icon: "Monitor",
            title: "IBM i managed services",
            description:
              "Add experienced IBM i administrators for monitoring, PTF planning, performance tuning, capacity planning, reporting, and daily operational ownership.",
          },
        ],
      },
      process: {
        items: [
          {
            step: "01",
            title: "Assess the AS400 environment",
            description:
              "We review IBM i release level, hardware lifecycle, LPARs, storage, backups, security posture, users, integrations, dependencies, and uptime requirements.",
          },
          {
            step: "02",
            title: "Map hosting, security, HA, and DR",
            description:
              "ICE designs the right mix of AS400 hosting, IBM i cloud hosting, security hardening, backup, high availability, disaster recovery, and managed services.",
          },
          {
            step: "03",
            title: "Migrate and validate",
            description:
              "We coordinate replication, cutover, testing, access, rollback planning, and business validation around your workload window.",
          },
          {
            step: "04",
            title: "Operate with specialists",
            description:
              "Your AS400 estate is monitored, tuned, protected, and supported by engineers who understand IBM i, IBM Power Systems, and enterprise operations.",
          },
        ],
      },
      benefits: {
        items: [
          "Keep AS400 applications running without buying and maintaining aging hardware",
          "Improve IBM i security posture with prioritized, auditable controls",
          "Add tested AS400 backup, high availability, and disaster recovery for critical workloads",
          "Get a practical roadmap from AS/400 terminology to modern IBM i cloud hosting and operations",
        ],
      },
      cta: {
        heading: "Need help with AS400?",
        description:
          "Talk with ICE about AS400 hosting, AS/400 support, IBM i cloud hosting, iSeries managed services, security hardening, backup, high availability, or disaster recovery.",
      },
    };

    const orderedSections = buildOrdered(sections);
    orderedSections.splice(
      3,
      0,
      {
        section_key: "as400_faq",
        section_type: "faq",
        content: {
          eyebrow: "AS400 FAQ",
          heading: "AS400 questions buyers ask first",
          items: [
            {
              question: "What is AS400 called now?",
              answer:
                "AS400 is commonly written as AS/400. The platform evolved through iSeries and is now known as IBM i running on IBM Power Systems. Many teams still search for AS400 when they need IBM i hosting, AS/400 support, iSeries managed services, security, backup, or disaster recovery.",
            },
            {
              question: "Does ICE support AS400 and IBM i systems?",
              answer:
                "Yes. ICE supports AS400, AS/400, iSeries, IBM i, and IBM Power environments across AS400 hosting, IBM i cloud hosting, security hardening, backup, high availability, disaster recovery, migration, and ongoing operations.",
            },
            {
              question: "Can AS400 workloads move to the cloud?",
              answer:
                "Yes. ICE helps organizations move AS400, AS/400, iSeries, and IBM i workloads to managed cloud or hosted IBM Power infrastructure while preserving critical applications, data, access patterns, integrations, and recovery requirements.",
            },
            {
              question: "What AS400 services does ICE provide?",
              answer:
                "ICE provides AS400 hosting, AS/400 support, IBM i cloud hosting, iSeries managed services, security assessment and hardening, backup, disaster recovery, high availability, migration planning, monitoring, performance support, and lifecycle support.",
            },
            {
              question: "Who is AS400 hosting best for?",
              answer:
                "AS400 hosting can suit organizations that rely on IBM i applications and want to reduce aging hardware risk, improve resilience, clarify operational responsibilities, or plan recovery without rewriting the application.",
            },
            {
              question: "Can ICE help with AS400 backup and disaster recovery?",
              answer:
                "Yes. ICE can design AS400 backup, high availability, and disaster recovery plans with encrypted copies, replication, recovery testing, failover planning, and RPO/RTO targets matched to the workload.",
            },
          ],
        },
        sort_order: 3,
        is_visible: true,
      },
      {
        section_key: "as400_comparison",
        section_type: "comparison",
        content: {
          eyebrow: "Modernization",
          heading: "AS400 support without staying stuck on old hardware",
          description:
            "ICE helps teams keep trusted AS400 applications while improving IBM i hosting, infrastructure lifecycle, resilience, security, and operational coverage.",
          before_label: "Aging AS400 estate",
          after_label: "ICE-managed IBM i platform",
          rows: [
            {
              label: "Infrastructure",
              before: "Aging on-prem hardware and limited refresh options",
              after: "Managed IBM Power capacity with lifecycle planning",
            },
            {
              label: "Operations",
              before: "Knowledge concentrated in a small internal team",
              after: "Support from IBM i and enterprise infrastructure specialists",
            },
            {
              label: "Recovery",
              before: "Backups or DR plans that may not be regularly tested",
              after: "Managed backup, HA, DR runbooks, and restore validation",
            },
            {
              label: "Security",
              before: "Legacy access patterns and audit gaps",
              after: "IBM i hardening, access review, audit posture, and monitoring",
            },
          ],
        },
        sort_order: 4,
        is_visible: true,
      },
    );
    orderedSections.forEach((section, index) => {
      section.sort_order = index;
    });

    return {
      title: "AS400",
      meta_title: "AS400 Hosting | AS/400 IBM i Cloud Hosting & Support | ICE",
      meta_description:
        "AS400 hosting, AS/400 support, IBM i cloud hosting, iSeries managed services, security, backup, HA, and disaster recovery from ICE.",
      sections,
      orderedSections,
    };
  })(),
  "ibm-i-security": page(
    "IBM i Security",
    "Hardened IBM i environments with monitoring, access controls, and compliance-ready security operations.",
  ),
  "protection-suite": page(
    "Protection Suite",
    "Layered security controls that protect endpoints, networks, and critical workloads end to end.",
  ),
  "security-monitoring": page(
    "Security Monitoring",
    "Security monitoring and alert response scoped to your environment, risk priorities, and service requirements.",
  ),
  "threat-detection": page(
    "Threat Detection and Response",
    "Identify, contain, and remediate threats quickly with engineer-led detection and response workflows.",
  ),
  "endpoint-security": page(
    "Endpoint Security",
    "Protect laptops, servers, and devices with managed endpoint controls and continuous oversight.",
  ),
  "managed-microsoft": page(
    "Managed Microsoft Services",
    "Expert management of Microsoft environments — from infrastructure to productivity platforms.",
  ),
  "automation-suite": page(
    "Automation Suite",
    "Reduce manual operations with automation that improves reliability, speed, and consistency.",
  ),
  "systems-management": page(
    "Systems Management",
    "Proactive monitoring, patching, and performance management for enterprise systems.",
  ),
  "ibm-power-vs": page(
    "IBM Power VS",
    "IBM Power Virtual Server management in the cloud with enterprise reliability and support.",
  ),
};

export function getSolutionFallback(slug: string): SolutionFallbackPage | null {
  if (!isSolutionSlug(slug)) return null;
  return FALLBACKS[slug];
}
