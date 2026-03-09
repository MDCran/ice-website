"use client";

import {
  ShieldCheck,
  ScanSearch,
  Users,
  FolderLock,
  FileCheck,
  Bug,
} from "lucide-react";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import SecurityHero from "@/components/solutions/heroes/SecurityHero";

const features = [
  {
    icon: <ScanSearch className="h-6 w-6" />,
    title: "Security Assessments",
    description:
      "Comprehensive evaluation of your IBM i environment identifying vulnerabilities, misconfigurations, and compliance gaps across all system layers.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Exit Point Monitoring",
    description:
      "Real-time monitoring and control of all system exit points to prevent unauthorized access and data exfiltration through network services.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "User Profile Management",
    description:
      "Complete user lifecycle management including privileged access controls, password policies, and automated provisioning/deprovisioning workflows.",
  },
  {
    icon: <FolderLock className="h-6 w-6" />,
    title: "Object Authority Auditing",
    description:
      "Deep analysis of object-level permissions across libraries, files, and programs to ensure least-privilege access principles are enforced.",
  },
  {
    icon: <FileCheck className="h-6 w-6" />,
    title: "Compliance Reporting",
    description:
      "Automated compliance reporting for ISO 27001, SOC 1 & 2, HIPAA, PCI-DSS, GDPR, and NIST-800-53 with audit-ready documentation.",
  },
  {
    icon: <Bug className="h-6 w-6" />,
    title: "Vulnerability Scanning & MFA",
    description:
      "Continuous scanning across 12+ vulnerability categories with SIEM-ready integration. MFA and SecureShell lockdown protect access points.",
  },
];

const process = [
  {
    step: "01",
    title: "Discovery & Assessment",
    description:
      "We perform a thorough audit of your IBM i environment, cataloging all exit points, user profiles, object authorities, and system configurations.",
  },
  {
    step: "02",
    title: "Gap Analysis",
    description:
      "Our security experts identify risks against industry benchmarks and regulatory requirements, producing a prioritized remediation roadmap.",
  },
  {
    step: "03",
    title: "Hardening & Remediation",
    description:
      "We implement security controls, lock down exit points, enforce least-privilege access, and apply critical patches and configuration changes.",
  },
  {
    step: "04",
    title: "Ongoing Monitoring",
    description:
      "Continuous monitoring and periodic reassessments ensure your IBM i environment remains secure as threats and requirements evolve.",
  },
];

const benefits = [
  "Reduce risk of data breaches on mission-critical IBM i systems",
  "Achieve ISO 27001, SOC 1 & 2, HIPAA, PCI-DSS, GDPR, and NIST-800-53 compliance",
  "SIEM-ready integration for centralized security event management",
  "MFA and SecureShell lockdown for access point protection",
  "Automated audit trails for regulatory requirements",
  "Expert guidance from certified IBM i security specialists",
];

export default function IBMiSecurityPage() {
  return (
    <SolutionPageLayout
      metricsPreset="ibm-i-security"
      title='IBM i <span class="gradient-text">Security</span>'
      subtitle="Comprehensive security assessments, hardening, and ongoing monitoring for your IBM i (AS/400, iSeries) environment. Protect your most critical business systems from modern threats while maintaining compliance."
      categoryBadge={{
        label: "Managed Security",
        icon: <ShieldCheck className="h-3.5 w-3.5" />,
      }}
      heroVisualization={<SecurityHero />}
      features={features}
      process={process}
      benefits={benefits}
      ctaTitle='Ready to Secure Your <span class="gradient-text">IBM i Environment?</span>'
      ctaSubtitle="Schedule a complimentary security assessment and discover how ICE can fortify your AS/400 and iSeries systems against modern threats."
      ctaButtonLabel="Schedule Assessment"
      breadcrumbLabel="IBM i Security"
    />
  );
}
