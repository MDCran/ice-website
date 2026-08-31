export type SalesCta = {
  label: string;
  href: string;
};

export type SalesModuleId =
  | "hero"
  | "proof"
  | "personas"
  | "outcomes"
  | "stories"
  | "trust"
  | "risk"
  | "roi"
  | "roadmap"
  | "procurement"
  | "briefing_form"
  | "faq"
  | "final_cta";

export type SalesModuleVisibility = Record<SalesModuleId, boolean>;

export interface SalesEnablementConfig {
  version: 1;
  enabled: boolean;
  seo: {
    title: string;
    description: string;
  };
  visibility: {
    showEnterprisePage: boolean;
    showHomePreview: boolean;
    showStickyCta: boolean;
    showSoftLeadCapture: boolean;
  };
  modules: SalesModuleVisibility;
  sectionOrder: SalesModuleId[];
  hero: {
    eyebrow: string;
    headline: string;
    description: string;
    primaryCta: SalesCta;
    secondaryCta: SalesCta;
    responsePromise: string;
    qualificationNote: string;
    platforms: string[];
  };
  proof: {
    eyebrow: string;
    heading: string;
    description: string;
    metrics: Array<{
      value: string;
      label: string;
      detail: string;
    }>;
  };
  personas: {
    eyebrow: string;
    heading: string;
    description: string;
    items: Array<{
      role: string;
      title: string;
      challenge: string;
      outcome: string;
      ctaLabel: string;
      ctaHref: string;
    }>;
  };
  outcomes: {
    eyebrow: string;
    heading: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      evidence: string;
    }>;
  };
  stories: {
    eyebrow: string;
    heading: string;
    description: string;
    disclaimer: string;
    items: Array<{
      industry: string;
      title: string;
      challenge: string;
      outcome: string;
      metric: string;
      metricLabel: string;
      href: string;
    }>;
  };
  trust: {
    eyebrow: string;
    heading: string;
    description: string;
    certifications: Array<{
      name: string;
      detail: string;
      href: string;
    }>;
    commitments: Array<{
      value: string;
      label: string;
      detail: string;
    }>;
    cta: SalesCta;
  };
  risk: {
    eyebrow: string;
    heading: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  roi: {
    eyebrow: string;
    heading: string;
    description: string;
    defaultAnnualSpend: number;
    minimumAnnualSpend: number;
    maximumAnnualSpend: number;
    savingsLowPercent: number;
    savingsHighPercent: number;
    disclaimer: string;
    cta: SalesCta;
  };
  roadmap: {
    eyebrow: string;
    heading: string;
    description: string;
    steps: Array<{
      phase: string;
      title: string;
      description: string;
      owner: string;
      timing: string;
    }>;
  };
  procurement: {
    eyebrow: string;
    heading: string;
    description: string;
    resources: Array<{
      kind: string;
      title: string;
      description: string;
      href: string;
      ctaLabel: string;
      enabled: boolean;
    }>;
  };
  briefingForm: {
    eyebrow: string;
    heading: string;
    description: string;
    submitLabel: string;
    successHeading: string;
    successDescription: string;
    serviceValue: string;
    responsePromise: string;
    priorities: string[];
    timelines: string[];
  };
  faq: {
    eyebrow: string;
    heading: string;
    description: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  finalCta: {
    eyebrow: string;
    heading: string;
    description: string;
    primaryCta: SalesCta;
    secondaryCta: SalesCta;
    reassurance: string;
  };
  global: {
    stickyTitle: string;
    stickyDescription: string;
    stickySolutionTitleTemplate: string;
    stickySolutionDescriptionTemplate: string;
    stickyBrandLabel: string;
    stickySupportNote: string;
    buyerActionsAriaLabel: string;
    stickyPrimaryCta: SalesCta;
    callbackTriggerLabel: string;
    callbackDialogAriaLabel: string;
    callbackTitle: string;
    callbackDescription: string;
    callbackSuccessHeading: string;
    callbackSuccessDescription: string;
    callbackPhoneLabel: string;
    callbackPhonePlaceholder: string;
    callbackPreferredTimeLabel: string;
    callbackSubmitLabel: string;
    callbackErrorMessage: string;
    callbackContextFallback: string;
    callbackTimeOptions: Array<{
      id: string;
      label: string;
    }>;
    softLeadHeadline: string;
    softLeadDescription: string;
    softLead: {
      image_src: string;
      image_alt: string;
      dismiss_aria_label: string;
      close_aria_label: string;
      name_label: string;
      name_placeholder: string;
      email_label: string;
      email_placeholder: string;
      phone_label: string;
      phone_placeholder: string;
      company_label: string;
      company_placeholder: string;
      marketing_consent_aria_label: string;
      marketing_consent_text: string;
      sending_label: string;
      submit_label: string;
      phone_error: string;
      submit_error: string;
      generic_error: string;
      success_heading: string;
      success_description: string;
      success_close_label: string;
      lead_service: string;
      lead_message: string;
      lead_form_key: string;
      lead_source: string;
      analytics_form: string;
    };
    homePreviewEyebrow: string;
    homePreviewHeading: string;
    homePreviewDescription: string;
    homePreviewCta: SalesCta;
    homePreviewMetrics: Array<{
      value: string;
      label: string;
      detail: string;
    }>;
  };
}

export const SALES_UPGRADE_CATALOG = [
  {
    id: "enterprise-positioning",
    label: "Enterprise positioning and executive-level value proposition",
    module: "hero",
  },
  {
    id: "response-expectation",
    label: "Clear response-time and discovery expectations",
    module: "hero",
  },
  {
    id: "platform-fit",
    label: "Immediate platform and workload fit signals",
    module: "hero",
  },
  {
    id: "proof-metrics",
    label: "Fact-based proof metrics with supporting context",
    module: "proof",
  },
  {
    id: "buying-committee",
    label: "Role-specific paths for CIO, CISO, CFO, and operations",
    module: "personas",
  },
  {
    id: "business-outcomes",
    label: "Outcome-led value cards instead of product-only messaging",
    module: "outcomes",
  },
  {
    id: "evidence-stories",
    label: "Representative engagement stories with measurable signals",
    module: "stories",
  },
  {
    id: "compliance-evidence",
    label: "Centralized compliance and assurance evidence",
    module: "trust",
  },
  {
    id: "service-commitments",
    label: "Visible SLA, support, and operating commitments",
    module: "trust",
  },
  {
    id: "trust-center-path",
    label: "Dedicated trust and security review path",
    module: "trust",
  },
  {
    id: "risk-reversal",
    label: "Implementation and vendor-risk mitigation disclosures",
    module: "risk",
  },
  {
    id: "roi-planner",
    label: "Interactive TCO and savings planning scenario",
    module: "roi",
  },
  {
    id: "implementation-roadmap",
    label: "Buyer-visible implementation roadmap with owners and timing",
    module: "roadmap",
  },
  {
    id: "procurement-center",
    label: "Procurement-ready resource center",
    module: "procurement",
  },
  {
    id: "security-pack",
    label: "Security and compliance review-pack request",
    module: "procurement",
  },
  {
    id: "rfp-support",
    label: "RFP and requirements-mapping support",
    module: "procurement",
  },
  {
    id: "reference-call",
    label: "Qualified reference-call request path",
    module: "procurement",
  },
  {
    id: "qualified-briefing",
    label: "On-page qualified executive briefing form",
    module: "briefing_form",
  },
  {
    id: "buyer-faq",
    label: "Procurement, transition, security, and contracting FAQ",
    module: "faq",
  },
  {
    id: "persistent-conversion",
    label: "Site-wide architect CTA and CMS-controlled lead capture",
    module: "final_cta",
  },
] as const;

export const SALES_MODULE_LABELS: Record<SalesModuleId, string> = {
  hero: "Enterprise positioning",
  proof: "Executive proof",
  personas: "Buying committee",
  outcomes: "Business outcomes",
  stories: "Evidence stories",
  trust: "Trust and commitments",
  risk: "Risk controls",
  roi: "ROI planner",
  roadmap: "Implementation roadmap",
  procurement: "Procurement center",
  briefing_form: "Executive briefing form",
  faq: "Buyer FAQ",
  final_cta: "Final conversion",
};

export const DEFAULT_SALES_ENABLEMENT: SalesEnablementConfig = {
  version: 1,
  enabled: true,
  seo: {
    title: "Enterprise IT Services and Buyer Enablement",
    description:
      "Evaluate ICE managed cloud, security, data protection, and IBM Power services with proof, SLAs, planning tools, and procurement resources.",
  },
  visibility: {
    showEnterprisePage: true,
    showHomePreview: true,
    showStickyCta: true,
    showSoftLeadCapture: true,
  },
  modules: {
    hero: true,
    proof: true,
    personas: true,
    outcomes: true,
    stories: true,
    trust: true,
    risk: true,
    roi: true,
    roadmap: true,
    procurement: true,
    briefing_form: true,
    faq: true,
    final_cta: true,
  },
  sectionOrder: [
    "hero",
    "proof",
    "personas",
    "outcomes",
    "stories",
    "trust",
    "risk",
    "roi",
    "roadmap",
    "procurement",
    "briefing_form",
    "faq",
    "final_cta",
  ],
  hero: {
    eyebrow: "Enterprise buyer center",
    headline: "Build the business case before the first sales call.",
    description:
      "Review operating commitments, platform fit, risk controls, implementation stages, and planning economics for ICE-managed infrastructure.",
    primaryCta: {
      label: "Request an executive briefing",
      href: "#executive-briefing",
    },
    secondaryCta: {
      label: "Explore solutions",
      href: "/solutions",
    },
    responsePromise:
      "A senior ICE specialist reviews qualified requests and responds within one business day.",
    qualificationNote:
      "Designed for teams evaluating IBM Power, IBM i, Microsoft, cloud, continuity, or managed security programs.",
    platforms: ["IBM Power", "IBM i", "AIX", "Microsoft", "Hybrid Cloud", "Cybersecurity"],
  },
  proof: {
    eyebrow: "Decision-grade proof",
    heading: "The operating signals enterprise buyers ask for first",
    description:
      "Each proof point is paired with context so buyers can validate fit during discovery and contracting.",
    metrics: [
      {
        value: "35+",
        label: "Years in enterprise IT",
        detail: "IBM Business Partner since 1990.",
      },
      {
        value: "24/7/365",
        label: "Operations coverage",
        detail: "Monitoring and support for mission-critical environments.",
      },
      {
        value: "99.99%",
        label: "Target uptime SLA",
        detail: "Service-specific commitments are finalized in the agreement.",
      },
      {
        value: "US-based",
        label: "Support organization",
        detail: "Direct access to infrastructure specialists and account ownership.",
      },
    ],
  },
  personas: {
    eyebrow: "Buying committee",
    heading: "Give every stakeholder a reason to move forward",
    description:
      "Switch perspectives to see how the same operating model addresses executive, security, financial, and delivery priorities.",
    items: [
      {
        role: "CIO",
        title: "Modernize without destabilizing core operations",
        challenge:
          "Legacy constraints, fragmented vendors, and modernization pressure compete for limited internal capacity.",
        outcome:
          "A sequenced roadmap with accountable operations, platform options, and clear transition ownership.",
        ctaLabel: "Plan the operating model",
        ctaHref: "/contact?service=Executive%20Architecture%20Review&source=enterprise_cio",
      },
      {
        role: "CISO",
        title: "Create defensible controls across critical workloads",
        challenge:
          "Security teams need evidence, continuous visibility, recovery readiness, and defined escalation paths.",
        outcome:
          "Layered controls, documented responsibilities, monitored environments, and review-ready operating evidence.",
        ctaLabel: "Request a security review",
        ctaHref: "/contact?service=Security%20and%20Compliance%20Review&source=enterprise_ciso",
      },
      {
        role: "CFO",
        title: "Turn infrastructure uncertainty into a planning model",
        challenge:
          "Capital refreshes, downtime exposure, staffing gaps, and overlapping tools make total cost difficult to forecast.",
        outcome:
          "A transparent scope, scenario-based economics, and a phased plan tied to business risk.",
        ctaLabel: "Build a TCO scenario",
        ctaHref: "#roi-planner",
      },
      {
        role: "IT Operations",
        title: "Reduce operational drag without losing control",
        challenge:
          "Teams are stretched across monitoring, patching, backup, recovery testing, incidents, and vendor coordination.",
        outcome:
          "A practical responsibility model, runbooks, escalation paths, and specialist capacity around the clock.",
        ctaLabel: "Review delivery responsibilities",
        ctaHref: "#implementation-roadmap",
      },
    ],
  },
  outcomes: {
    eyebrow: "Business outcomes",
    heading: "Tie the technology decision to operating results",
    description:
      "ICE engagements are framed around resilience, control, speed, and staff capacity rather than infrastructure alone.",
    items: [
      {
        title: "Operational resilience",
        description:
          "Define recovery targets, test cadence, escalation ownership, and failover expectations before an incident.",
        evidence: "RPO, RTO, runbooks, and testing documented in scope",
      },
      {
        title: "Predictable operations",
        description:
          "Consolidate monitoring, support, lifecycle tasks, and vendor coordination into an accountable service model.",
        evidence: "Named responsibilities and service review cadence",
      },
      {
        title: "Security assurance",
        description:
          "Align platform hardening, monitoring, access, and recovery controls to the organization’s risk profile.",
        evidence: "Control mapping and review-ready operating evidence",
      },
      {
        title: "Modernization capacity",
        description:
          "Free internal teams from repetitive infrastructure work while preserving visibility and decision authority.",
        evidence: "Phased transition with knowledge transfer",
      },
    ],
  },
  stories: {
    eyebrow: "Evidence patterns",
    heading: "Representative enterprise engagement patterns",
    description:
      "These examples show the kind of operating problem, decision path, and measurable signal ICE can validate with a buyer.",
    disclaimer:
      "Representative engagement patterns; final outcomes depend on scope, source environment, and agreed service levels.",
    items: [
      {
        industry: "IBM Power operations",
        title: "Continuity modernization for a critical IBM i estate",
        challenge:
          "A same-region recovery model and manual procedures created uncertainty around a regional event.",
        outcome:
          "A geographically separated recovery design, replicated data path, documented runbook, and testing cadence.",
        metric: "Defined",
        metricLabel: "RPO and RTO targets",
        href: "/solutions/disaster-recovery",
      },
      {
        industry: "Regulated infrastructure",
        title: "A clearer security operating model",
        challenge:
          "Multiple tools and vendors made ownership, escalation, and evidence collection difficult.",
        outcome:
          "Consolidated monitoring, control ownership, incident paths, and recurring service review.",
        metric: "24/7",
        metricLabel: "Monitoring coverage",
        href: "/solutions/security-monitoring",
      },
      {
        industry: "Cloud transformation",
        title: "A phased migration with business checkpoints",
        challenge:
          "Core workloads required modernization without an open-ended cutover or unclear rollback plan.",
        outcome:
          "Discovery, target architecture, rehearsal, cutover, validation, and post-transition optimization.",
        metric: "6-stage",
        metricLabel: "Controlled transition plan",
        href: "/solutions/cloud-migration",
      },
    ],
  },
  trust: {
    eyebrow: "Trust and assurance",
    heading: "Make security and service review part of the sales process",
    description:
      "Buyers can evaluate operating controls, responsibilities, and evidence before commercial commitment.",
    certifications: [
      {
        name: "SOC 2 Type II",
        detail: "Service organization controls supporting enterprise assurance reviews.",
        href: "/contact?service=Security%20and%20Compliance%20Pack&source=enterprise_trust",
      },
      {
        name: "IBM Business Partner",
        detail: "Long-standing IBM platform experience dating to 1990.",
        href: "/partners",
      },
      {
        name: "Regulated workload readiness",
        detail: "Scope controls for HIPAA, PCI, and other buyer-specific requirements during discovery.",
        href: "/contact?service=Compliance%20Scoping&source=enterprise_trust",
      },
    ],
    commitments: [
      {
        value: "24/7/365",
        label: "Monitoring and support",
        detail: "Coverage and escalation paths defined by service.",
      },
      {
        value: "Named",
        label: "Account ownership",
        detail: "Commercial and operational points of contact.",
      },
      {
        value: "Documented",
        label: "Service responsibilities",
        detail: "Clear division of ICE and customer obligations.",
      },
      {
        value: "Recurring",
        label: "Service reviews",
        detail: "Performance, risk, capacity, and roadmap checkpoints.",
      },
    ],
    cta: {
      label: "Request the assurance pack",
      href: "/contact?service=Security%20and%20Compliance%20Pack&source=enterprise_trust",
    },
  },
  risk: {
    eyebrow: "Risk controls",
    heading: "Surface transition risk before it becomes a procurement objection",
    description:
      "The enterprise sales process should show how scope, migration, access, continuity, and exit concerns are handled.",
    items: [
      {
        title: "Phased discovery and validation",
        description:
          "Architecture, dependencies, service levels, and success criteria are validated before final scope.",
      },
      {
        title: "Rehearsed transition plan",
        description:
          "Cutover, rollback, validation, and communications are documented for the agreed workload.",
      },
      {
        title: "Shared responsibility matrix",
        description:
          "Customer, ICE, and third-party ownership is made explicit across operations and security.",
      },
      {
        title: "Portability and exit planning",
        description:
          "Data access, knowledge transfer, and transition responsibilities are addressed during contracting.",
      },
    ],
  },
  roi: {
    eyebrow: "Planning economics",
    heading: "Build a first-pass TCO scenario",
    description:
      "Adjust annual infrastructure and operations spend to model a planning range for consolidation, avoided refresh, and staff-capacity gains.",
    defaultAnnualSpend: 500000,
    minimumAnnualSpend: 100000,
    maximumAnnualSpend: 5000000,
    savingsLowPercent: 15,
    savingsHighPercent: 30,
    disclaimer:
      "Planning scenario only, not a quote or guaranteed savings. ICE validates assumptions, scope, and one-time transition costs during discovery.",
    cta: {
      label: "Validate the business case",
      href: "/contact?service=TCO%20and%20Business%20Case%20Review&source=enterprise_roi",
    },
  },
  roadmap: {
    eyebrow: "Implementation roadmap",
    heading: "Give buyers a visible path from discovery to steady state",
    description:
      "A clear sequence reduces internal uncertainty and gives procurement, security, finance, and operations common checkpoints.",
    steps: [
      {
        phase: "01",
        title: "Executive discovery",
        description:
          "Confirm business drivers, decision criteria, stakeholders, constraints, and target outcomes.",
        owner: "ICE + executive sponsor",
        timing: "Week 1",
      },
      {
        phase: "02",
        title: "Technical and security validation",
        description:
          "Inventory dependencies, architecture, data flows, controls, recovery targets, and integration requirements.",
        owner: "Architecture + security teams",
        timing: "Weeks 1-2",
      },
      {
        phase: "03",
        title: "Commercial and service design",
        description:
          "Finalize scope, responsibilities, service levels, assumptions, pricing, and governance.",
        owner: "ICE + procurement",
        timing: "Weeks 2-3",
      },
      {
        phase: "04",
        title: "Transition planning",
        description:
          "Build implementation, testing, cutover, rollback, communications, and knowledge-transfer plans.",
        owner: "Joint delivery team",
        timing: "Before kickoff",
      },
      {
        phase: "05",
        title: "Implementation and validation",
        description:
          "Execute the agreed plan with checkpoints, acceptance criteria, and business validation.",
        owner: "Joint delivery team",
        timing: "Scope dependent",
      },
      {
        phase: "06",
        title: "Operate and improve",
        description:
          "Run service reviews covering performance, risk, capacity, incidents, and the optimization roadmap.",
        owner: "Service delivery",
        timing: "Ongoing",
      },
    ],
  },
  procurement: {
    eyebrow: "Procurement center",
    heading: "Equip the team that has to approve the decision",
    description:
      "Route security, architecture, finance, legal, and sourcing stakeholders to the evidence or working session they need.",
    resources: [
      {
        kind: "Security",
        title: "Security and compliance review pack",
        description:
          "Request control context, responsibility mapping, and the evidence path for your assurance review.",
        href: "/contact?service=Security%20and%20Compliance%20Pack&source=enterprise_procurement",
        ctaLabel: "Request the pack",
        enabled: true,
      },
      {
        kind: "Sourcing",
        title: "RFP and requirements mapping",
        description:
          "Bring an RFP, requirements matrix, or current-state summary for a structured response workshop.",
        href: "/contact?service=RFP%20and%20Requirements%20Mapping&source=enterprise_procurement",
        ctaLabel: "Start requirements mapping",
        enabled: true,
      },
      {
        kind: "Architecture",
        title: "Architecture review session",
        description:
          "Validate workload fit, dependencies, connectivity, recovery targets, and transition constraints.",
        href: "/contact?service=Executive%20Architecture%20Review&source=enterprise_procurement",
        ctaLabel: "Book an architecture review",
        enabled: true,
      },
      {
        kind: "References",
        title: "Qualified reference conversation",
        description:
          "Discuss reference availability after ICE confirms scope, industry relevance, and mutual timing.",
        href: "/contact?service=Qualified%20Reference%20Request&source=enterprise_procurement",
        ctaLabel: "Request a reference",
        enabled: true,
      },
    ],
  },
  briefingForm: {
    eyebrow: "Executive briefing",
    heading: "Give ICE enough context to make the first conversation useful",
    description:
      "Share the priority, timing, and current environment. A specialist will route the request to the right technical and commercial owners.",
    submitLabel: "Request the briefing",
    successHeading: "Your briefing request is in.",
    successDescription:
      "An ICE specialist will review the context and follow up with a focused next step.",
    serviceValue: "Enterprise Executive Briefing",
    responsePromise: "Typical response: within one business day.",
    priorities: [
      "Modernize IBM Power or IBM i",
      "Improve backup and disaster recovery",
      "Strengthen security and compliance",
      "Consolidate infrastructure operations",
      "Plan a cloud or data-center transition",
      "Build a business case or RFP",
    ],
    timelines: ["Immediate / active incident", "0-3 months", "3-6 months", "6-12 months", "Researching"],
  },
  faq: {
    eyebrow: "Buyer FAQ",
    heading: "Questions enterprise teams ask before formal evaluation",
    description:
      "Use these answers as a starting point; final commitments are documented in the applicable proposal and agreement.",
    items: [
      {
        question: "Can ICE work from an existing RFP or requirements matrix?",
        answer:
          "Yes. ICE can map requirements, flag assumptions, identify missing discovery inputs, and structure technical and commercial responses around the buyer’s evaluation process.",
      },
      {
        question: "How are security and compliance requirements handled?",
        answer:
          "ICE reviews workload scope, data flows, access, monitoring, recovery, evidence, and shared responsibilities. Applicable controls and deliverables are then documented in the proposed service.",
      },
      {
        question: "What happens before pricing is finalized?",
        answer:
          "ICE validates the current environment, dependencies, capacity, service levels, transition requirements, responsibilities, and material assumptions so pricing reflects a supportable scope.",
      },
      {
        question: "Can a program be phased?",
        answer:
          "Yes. Buyers can sequence discovery, remediation, migration, recovery, security, and managed operations around business priorities and change windows.",
      },
      {
        question: "How does ICE reduce transition risk?",
        answer:
          "The delivery plan can include inventory validation, rehearsals, checkpoints, rollback criteria, communications, acceptance tests, and post-transition monitoring based on scope.",
      },
      {
        question: "Are customer references available?",
        answer:
          "Reference conversations may be coordinated for qualified opportunities when scope, relevance, confidentiality, and customer availability align.",
      },
    ],
  },
  finalCta: {
    eyebrow: "Next step",
    heading: "Turn the evaluation into a focused working session.",
    description:
      "Bring the current environment, business priority, and decision timeline. ICE will help structure the technical, financial, and risk questions.",
    primaryCta: {
      label: "Request an executive briefing",
      href: "#executive-briefing",
    },
    secondaryCta: {
      label: "Call 1-800-786-9188",
      href: "tel:18007869188",
    },
    reassurance: "No generic pitch deck. The first session is organized around your environment and decision criteria.",
  },
  global: {
    stickyTitle: "Planning a major infrastructure decision?",
    stickyDescription: "Talk it through with a US-based IBM Power and cloud infrastructure specialist.",
    stickySolutionTitleTemplate: "Questions about {solution}? Talk with a specialist.",
    stickySolutionDescriptionTemplate:
      "Get a practical review from ICE’s US-based infrastructure team—without starting with a generic sales presentation.",
    stickyBrandLabel: "ICE",
    stickySupportNote: "ICE Solutions Desk · US-based infrastructure specialists",
    buyerActionsAriaLabel: "Enterprise buyer actions",
    stickyPrimaryCta: {
      label: "Call now",
      href: "tel:18007869188",
    },
    callbackTriggerLabel: "Request a callback",
    callbackDialogAriaLabel: "Request a callback",
    callbackTitle: "Request a callback",
    callbackDescription:
      "Share your number and the most convenient time. No long form required.",
    callbackSuccessHeading: "Callback requested",
    callbackSuccessDescription:
      "An ICE specialist will use the timing you selected.",
    callbackPhoneLabel: "Phone number",
    callbackPhonePlaceholder: "(555) 123-4567",
    callbackPreferredTimeLabel: "Preferred time",
    callbackSubmitLabel: "Request my callback",
    callbackErrorMessage:
      "We couldn’t save the request. Please call 1-800-786-9188.",
    callbackContextFallback: "Enterprise infrastructure planning",
    callbackTimeOptions: [
      { id: "Today", label: "Today · Any time" },
      { id: "Tomorrow morning", label: "Tomorrow · Morning" },
      { id: "Tomorrow afternoon", label: "Tomorrow · Afternoon" },
      { id: "This week", label: "This week · Flexible" },
    ],
    softLeadHeadline: "Want an executive infrastructure assessment?",
    softLeadDescription:
      "Share your contact details and an ICE specialist will help frame the business, technical, and risk questions.",
    softLead: {
      image_src: "/images/marketing/executive-infrastructure-assessment.webp",
      image_alt: "",
      dismiss_aria_label: "Dismiss assessment request",
      close_aria_label: "Close assessment request",
      name_label: "Name",
      name_placeholder: "",
      email_label: "Work email",
      email_placeholder: "",
      phone_label: "Phone",
      phone_placeholder: "(561) 555-0100",
      company_label: "Company",
      company_placeholder: "",
      marketing_consent_aria_label: "Email marketing consent",
      marketing_consent_text: "Send me occasional ICE infrastructure guidance and service updates. I can unsubscribe at any time.",
      sending_label: "Sending…",
      submit_label: "Request assessment",
      phone_error: "Please enter a valid 10-digit phone number.",
      submit_error: "Unable to submit. Please try again.",
      generic_error: "Something went wrong.",
      success_heading: "Thanks — we got it.",
      success_description: "An ICE specialist will follow up shortly.",
      success_close_label: "Close",
      lead_service: "Free Assessment",
      lead_message: "Soft lead capture — requested a free infrastructure assessment.",
      lead_form_key: "soft_lead",
      lead_source: "soft_lead_capture",
      analytics_form: "soft_lead",
    },
    homePreviewEyebrow: "For enterprise buying teams",
    homePreviewHeading: "Make the next infrastructure decision easier to defend.",
    homePreviewDescription:
      "Explore operating commitments, stakeholder outcomes, implementation stages, planning economics, and procurement resources before the first call.",
    homePreviewCta: {
      label: "Plan an executive briefing",
      href: "/contact?service=Enterprise%20Infrastructure%20Planning&source=home_sales_preview",
    },
    homePreviewMetrics: [
      { value: "35+", label: "Years in enterprise IT", detail: "IBM Business Partner since 1990." },
      { value: "24/7/365", label: "Operations coverage", detail: "Monitoring and support for mission-critical environments." },
      { value: "99.99%", label: "Target uptime SLA", detail: "Service-specific commitments are finalized in the agreement." },
      { value: "US-based", label: "Support organization", detail: "Direct access to infrastructure specialists and account ownership." },
    ],
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function pointsToRetiredEnterprisePage(value: string): boolean {
  const normalized = value.trim();
  return (
    /^\/enterprise(?:[/?#]|$)/i.test(normalized) ||
    /^https?:\/\/(?:www\.)?icesales\.com\/enterprise(?:[/?#]|$)/i.test(
      normalized,
    )
  );
}

function safeHref(value: string, fallback: string): string {
  const normalized = value.trim();
  if (pointsToRetiredEnterprisePage(normalized)) return fallback;

  if (
    normalized.startsWith("/") ||
    normalized.startsWith("#") ||
    /^(https?:|tel:|mailto:|sms:)/i.test(normalized)
  ) {
    return normalized;
  }
  return fallback;
}

function safeCta(candidate: SalesCta, fallback: SalesCta): SalesCta {
  if (pointsToRetiredEnterprisePage(candidate.href)) return fallback;

  return {
    label: candidate.label,
    href: safeHref(candidate.href, fallback.href),
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, value));
}

function safeCallbackTimeOptions(
  candidate: SalesEnablementConfig["global"]["callbackTimeOptions"],
  fallback: SalesEnablementConfig["global"]["callbackTimeOptions"],
): SalesEnablementConfig["global"]["callbackTimeOptions"] {
  const seen = new Set<string>();
  const options = candidate
    .map((item) => ({ id: item.id.trim(), label: item.label.trim() }))
    .filter((item) => {
      if (!item.id || !item.label || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

  return options.length > 0 ? options : fallback;
}

function deepMerge<T>(fallback: T, candidate: unknown): T {
  if (Array.isArray(fallback)) {
    if (!Array.isArray(candidate)) return fallback;
    if (fallback.length === 0) return candidate as T;

    const exemplar = fallback[0];
    if (isRecord(exemplar)) {
      return candidate
        .filter(isRecord)
        .map((item) => deepMerge(exemplar, item)) as T;
    }

    return candidate.filter((item) => typeof item === typeof exemplar) as T;
  }

  if (isRecord(fallback)) {
    const source = isRecord(candidate) ? candidate : {};
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fallback)) {
      result[key] = deepMerge(value, source[key]);
    }
    return result as T;
  }

  if (candidate === undefined || candidate === null) return fallback;
  if (typeof candidate !== typeof fallback) return fallback;
  return candidate as T;
}

export function resolveSalesEnablement(raw: unknown): SalesEnablementConfig {
  const merged = deepMerge(DEFAULT_SALES_ENABLEMENT, raw);
  const allowed = new Set<SalesModuleId>(Object.keys(SALES_MODULE_LABELS) as SalesModuleId[]);
  const requested = Array.isArray(merged.sectionOrder)
    ? merged.sectionOrder.filter(
        (item, index, all): item is SalesModuleId =>
          allowed.has(item as SalesModuleId) && all.indexOf(item) === index,
      )
    : [];
  const missing = DEFAULT_SALES_ENABLEMENT.sectionOrder.filter((item) => !requested.includes(item));
  const minimumAnnualSpend = Math.max(1_000, merged.roi.minimumAnnualSpend);
  const maximumAnnualSpend = Math.max(minimumAnnualSpend, merged.roi.maximumAnnualSpend);
  const savingsLowPercent = clamp(merged.roi.savingsLowPercent, 0, 100);
  const savingsHighPercent = clamp(
    merged.roi.savingsHighPercent,
    savingsLowPercent,
    100,
  );

  return {
    ...merged,
    version: 1,
    sectionOrder: [...requested, ...missing],
    hero: {
      ...merged.hero,
      primaryCta: safeCta(merged.hero.primaryCta, DEFAULT_SALES_ENABLEMENT.hero.primaryCta),
      secondaryCta: safeCta(
        merged.hero.secondaryCta,
        DEFAULT_SALES_ENABLEMENT.hero.secondaryCta,
      ),
    },
    personas: {
      ...merged.personas,
      items: merged.personas.items.map((item, index) => ({
        ...item,
        ctaHref: safeHref(
          item.ctaHref,
          DEFAULT_SALES_ENABLEMENT.personas.items[index]?.ctaHref ??
            DEFAULT_SALES_ENABLEMENT.personas.items[0].ctaHref,
        ),
      })),
    },
    stories: {
      ...merged.stories,
      items: merged.stories.items.map((item, index) => ({
        ...item,
        href: safeHref(
          item.href,
          DEFAULT_SALES_ENABLEMENT.stories.items[index]?.href ??
            DEFAULT_SALES_ENABLEMENT.stories.items[0].href,
        ),
      })),
    },
    trust: {
      ...merged.trust,
      certifications: merged.trust.certifications.map((item, index) => ({
        ...item,
        href: safeHref(
          item.href,
          DEFAULT_SALES_ENABLEMENT.trust.certifications[index]?.href ??
            DEFAULT_SALES_ENABLEMENT.trust.certifications[0].href,
        ),
      })),
      cta: safeCta(merged.trust.cta, DEFAULT_SALES_ENABLEMENT.trust.cta),
    },
    roi: {
      ...merged.roi,
      minimumAnnualSpend,
      maximumAnnualSpend,
      defaultAnnualSpend: clamp(
        merged.roi.defaultAnnualSpend,
        minimumAnnualSpend,
        maximumAnnualSpend,
      ),
      savingsLowPercent,
      savingsHighPercent,
      cta: safeCta(merged.roi.cta, DEFAULT_SALES_ENABLEMENT.roi.cta),
    },
    procurement: {
      ...merged.procurement,
      resources: merged.procurement.resources.map((item, index) => ({
        ...item,
        href: safeHref(
          item.href,
          DEFAULT_SALES_ENABLEMENT.procurement.resources[index]?.href ??
            DEFAULT_SALES_ENABLEMENT.procurement.resources[0].href,
        ),
      })),
    },
    finalCta: {
      ...merged.finalCta,
      primaryCta: safeCta(
        merged.finalCta.primaryCta,
        DEFAULT_SALES_ENABLEMENT.finalCta.primaryCta,
      ),
      secondaryCta: safeCta(
        merged.finalCta.secondaryCta,
        DEFAULT_SALES_ENABLEMENT.finalCta.secondaryCta,
      ),
    },
    global: {
      ...merged.global,
      callbackTimeOptions: safeCallbackTimeOptions(
        merged.global.callbackTimeOptions,
        DEFAULT_SALES_ENABLEMENT.global.callbackTimeOptions,
      ),
      stickyPrimaryCta: safeCta(
        merged.global.stickyPrimaryCta,
        DEFAULT_SALES_ENABLEMENT.global.stickyPrimaryCta,
      ),
      homePreviewCta: safeCta(
        merged.global.homePreviewCta,
        DEFAULT_SALES_ENABLEMENT.global.homePreviewCta,
      ),
    },
  };
}
