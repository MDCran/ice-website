export interface SearchItem {
  title: string;
  description: string;
  url: string;
  category: string;
  keywords?: string[];
}

export const searchIndex: SearchItem[] = [
  // Home
  {
    title: "Home",
    description:
      "International Computer Exchange - Enterprise technology solutions. IBM Business Partner since 1990.",
    url: "/",
    category: "Pages",
    keywords: ["ice", "enterprise", "infrastructure", "cloud", "security"],
  },

  // Solutions - Managed Cloud Services
  {
    title: "Managed Cloud Hosting",
    description:
      "Fully managed cloud hosting backed by 100% uptime SLA and enterprise-grade infrastructure for AS400, iSeries, and IBM Power.",
    url: "/solutions/managed-cloud-hosting",
    category: "Managed Cloud Services",
    keywords: ["hosting", "cloud", "as400", "iseries", "power", "data center", "uptime"],
  },
  {
    title: "Managed Private Cloud",
    description:
      "Dedicated private cloud environments with full isolation, security, and compliance for mission-critical workloads.",
    url: "/solutions/managed-private-cloud",
    category: "Managed Cloud Services",
    keywords: ["private", "dedicated", "isolation", "compliance"],
  },
  {
    title: "Managed Hybrid Cloud",
    description:
      "Seamlessly bridge on-premises and cloud infrastructure with managed hybrid cloud solutions.",
    url: "/solutions/managed-hybrid-cloud",
    category: "Managed Cloud Services",
    keywords: ["hybrid", "on-premises", "bridge", "multi-cloud"],
  },
  {
    title: "Cloud Migration Services",
    description:
      "Seamless modernization from legacy systems to future-ready cloud infrastructure with minimal downtime.",
    url: "/solutions/cloud-migration",
    category: "Managed Cloud Services",
    keywords: ["migration", "modernization", "legacy", "as400", "transition"],
  },

  // Solutions - Managed Data Protection
  {
    title: "Backup as a Service",
    description:
      "Secure, automated backup and rapid restoration for Windows, IBM i, AIX, and Linux systems.",
    url: "/solutions/backup-as-a-service",
    category: "Managed Data Protection",
    keywords: ["backup", "restore", "baas", "windows", "linux", "aix", "ibm i"],
  },
  {
    title: "Disaster Recovery as a Service",
    description:
      "Fast failover and recovery in minutes with managed disaster recovery and business continuity solutions.",
    url: "/solutions/disaster-recovery",
    category: "Managed Data Protection",
    keywords: ["disaster", "recovery", "draas", "failover", "continuity", "rto", "rpo"],
  },
  {
    title: "High Availability as a Service",
    description:
      "Ensure continuous operations with real-time replication and automatic failover to eliminate downtime.",
    url: "/solutions/high-availability",
    category: "Managed Data Protection",
    keywords: ["high availability", "ha", "replication", "failover", "zero downtime"],
  },
  {
    title: "Ransomware Recovery",
    description:
      "Protect against ransomware with immutable backups, rapid recovery, and proactive threat detection.",
    url: "/solutions/ransomware-recovery",
    category: "Managed Data Protection",
    keywords: ["ransomware", "immutable", "malware", "recovery", "cyber attack"],
  },

  // Solutions - Managed Security
  {
    title: "IBM i Security",
    description:
      "Comprehensive security hardening and compliance for IBM i environments with 24/7 monitoring.",
    url: "/solutions/ibm-i-security",
    category: "Managed Security",
    keywords: ["ibm i", "as400", "iseries", "hardening", "compliance", "hipaa", "pci"],
  },
  {
    title: "Protection Suite",
    description:
      "Multi-layered security protection suite combining endpoint, network, and cloud security.",
    url: "/solutions/protection-suite",
    category: "Managed Security",
    keywords: ["protection", "multi-layer", "endpoint", "network security"],
  },
  {
    title: "Security Monitoring",
    description:
      "24/7 managed security monitoring with real-time threat detection and incident response.",
    url: "/solutions/security-monitoring",
    category: "Managed Security",
    keywords: ["monitoring", "soc", "siem", "incident response", "24/7"],
  },
  {
    title: "Threat Detection and Response",
    description:
      "Advanced threat detection using AI and behavioral analytics with rapid incident response.",
    url: "/solutions/threat-detection",
    category: "Managed Security",
    keywords: ["threat", "detection", "ai", "analytics", "edr", "xdr"],
  },
  {
    title: "Endpoint Security",
    description:
      "Protect every device and endpoint with enterprise-grade security, EDR, and zero-trust policies.",
    url: "/solutions/endpoint-security",
    category: "Managed Security",
    keywords: ["endpoint", "edr", "zero trust", "device", "antivirus"],
  },

  // Solutions - Managed Services
  {
    title: "Managed Microsoft Services",
    description:
      "Full lifecycle management of Microsoft 365, Azure, and Windows Server environments.",
    url: "/solutions/managed-microsoft",
    category: "Managed Services",
    keywords: ["microsoft", "365", "azure", "windows server", "office"],
  },
  {
    title: "Automation Suite",
    description:
      "Streamline operations with intelligent automation for monitoring, patching, and system management.",
    url: "/solutions/automation-suite",
    category: "Managed Services",
    keywords: ["automation", "patching", "monitoring", "rpa", "orchestration"],
  },
  {
    title: "Systems Management",
    description:
      "Comprehensive 24/7 proactive monitoring and management for your entire IT infrastructure.",
    url: "/solutions/systems-management",
    category: "Managed Services",
    keywords: ["systems", "management", "monitoring", "proactive", "noc"],
  },
  {
    title: "IBM Power VS",
    description:
      "IBM Power Virtual Server for flexible, scalable Power Systems workloads in the cloud.",
    url: "/solutions/ibm-power-vs",
    category: "Managed Services",
    keywords: ["power", "virtual server", "ibm", "as400", "iseries", "cloud"],
  },

  // Partners (individual partner names searchable)
  {
    title: "Technology Partners",
    description:
      "ICE partners with CloudSafe, IBM, Lenovo, Cisco, Dell, DASCOM, Printronix, Acronix, and Cybernetics.",
    url: "/partners",
    category: "Pages",
    keywords: ["partners", "cloudsafe", "ibm", "lenovo", "cisco", "dell", "dascom", "printronix", "acronix", "cybernetics"],
  },
  {
    title: "CloudSafe",
    description: "Enterprise cloud hosting and managed services partner.",
    url: "/partners",
    category: "Partners",
    keywords: ["cloudsafe", "cloud", "hosting"],
  },
  {
    title: "IBM",
    description: "World leader in enterprise technology. Power Systems, IBM i, AI, and hybrid cloud.",
    url: "/partners",
    category: "Partners",
    keywords: ["ibm", "power", "as400", "iseries", "watson"],
  },
  {
    title: "Cisco",
    description: "Networking, security, collaboration, and data center solutions.",
    url: "/partners",
    category: "Partners",
    keywords: ["cisco", "networking", "switches", "routers"],
  },
  {
    title: "Dell",
    description: "PowerEdge servers, PowerStore storage, and enterprise IT solutions.",
    url: "/partners",
    category: "Partners",
    keywords: ["dell", "poweredge", "powerstore", "servers"],
  },
  {
    title: "Lenovo",
    description: "ThinkSystem servers, ThinkAgile platforms, and data center solutions.",
    url: "/partners",
    category: "Partners",
    keywords: ["lenovo", "thinksystem", "thinkagile"],
  },

  // Why ICE
  {
    title: "Why ICE",
    description:
      "IBM Business Partner since 1990. 35+ years of experience, 730+ successful projects, 198+ satisfied clients.",
    url: "/why-ice",
    category: "Pages",
    keywords: ["about", "why", "experience", "history", "team"],
  },

  // Contact
  {
    title: "Contact Us",
    description:
      "Get in touch with ICE for enterprise technology solutions. 561-394-9188 or sales@icesales.com.",
    url: "/contact",
    category: "Pages",
    keywords: ["contact", "phone", "email", "consultation", "quote"],
  },

  // Legal
  {
    title: "Terms of Service",
    description:
      "Website terms and conditions for International Computer Exchange.",
    url: "/terms-of-service",
    category: "Legal",
    keywords: ["terms", "conditions", "legal", "policy"],
  },
  {
    title: "SMS Consent",
    description:
      "SMS text messaging opt-in and opt-out agreement for RingCentral compliance.",
    url: "/sms-consent",
    category: "Legal",
    keywords: ["sms", "text", "opt-in", "opt-out", "ringcentral"],
  },

  // Resources
  {
    title: "Resources",
    description:
      "Browse white papers, case studies, architecture guides, and technical documentation from ICE.",
    url: "/resources",
    category: "Pages",
    keywords: ["resources", "whitepaper", "case study", "documentation", "pdf"],
  },
  {
    title: "High-Security Data Centers",
    description:
      "White paper on ICE's SOC 1 SSAE 18 Type II certified data center facilities and infrastructure.",
    url: "/resources",
    category: "Resources",
    keywords: ["data center", "soc", "ssae", "whitepaper", "facility"],
  },
  {
    title: "Cloud Migration Best Practices",
    description:
      "Case study documenting seamless migration of legacy AS/400 workloads to managed cloud hosting.",
    url: "/resources",
    category: "Resources",
    keywords: ["migration", "as400", "case study", "legacy"],
  },
  {
    title: "IBM i Security Hardening Guide",
    description:
      "Technical documentation for hardening IBM i environments including exit point monitoring and compliance.",
    url: "/resources",
    category: "Resources",
    keywords: ["ibm i", "security", "hardening", "exit point", "compliance"],
  },
  {
    title: "Disaster Recovery Planning Template",
    description:
      "Architecture guide for enterprise disaster recovery planning with RTO/RPO analysis.",
    url: "/resources",
    category: "Resources",
    keywords: ["disaster recovery", "template", "rto", "rpo", "planning"],
  },
  {
    title: "Enterprise Hybrid Cloud Architecture",
    description:
      "White paper on designing hybrid cloud infrastructure bridging IBM Power with public cloud.",
    url: "/resources",
    category: "Resources",
    keywords: ["hybrid cloud", "architecture", "ibm power", "whitepaper"],
  },
  {
    title: "Ransomware Recovery Playbook",
    description:
      "Technical playbook for ransomware recovery using immutable backups and air-gapped storage.",
    url: "/resources",
    category: "Resources",
    keywords: ["ransomware", "playbook", "immutable", "air-gapped"],
  },
];
