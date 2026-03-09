"use client";

import {
  Shield,
  MonitorSmartphone,
  Wifi,
  Mail,
  Globe,
  Settings2,
  Zap,
} from "lucide-react";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import ProtectionSuiteHero from "@/components/solutions/heroes/ProtectionSuiteHero";

const features = [
  {
    icon: <MonitorSmartphone className="h-6 w-6" />,
    title: "Endpoint Protection",
    description:
      "Advanced endpoint defense with real-time malware detection, ransomware prevention, and device-level firewall management across all operating systems.",
  },
  {
    icon: <Wifi className="h-6 w-6" />,
    title: "Network Security",
    description:
      "Next-generation firewall management, intrusion detection/prevention, and network segmentation to stop lateral movement and unauthorized access.",
  },
  {
    icon: <Mail className="h-6 w-6" />,
    title: "Email Filtering",
    description:
      "AI-powered email security that blocks phishing, business email compromise, spam, and malicious attachments before they reach your inbox.",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Web Security",
    description:
      "Secure web gateway with URL filtering, SSL inspection, and cloud application visibility to protect users from web-borne threats.",
  },
  {
    icon: <Settings2 className="h-6 w-6" />,
    title: "Unified Management",
    description:
      "Single-pane-of-glass console for centralized policy management, threat visibility, and coordinated response across all security layers.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Automated Response",
    description:
      "SOAR-driven automated playbooks for instant threat containment, quarantine, and remediation without manual intervention.",
  },
];

const process = [
  {
    step: "01",
    title: "Unified Threat Management",
    description:
      "The Protection Suite integrates endpoint, network, email, and web security into a single coordinated platform. Threats detected at one layer automatically trigger defensive actions across all others.",
  },
  {
    step: "02",
    title: "Real-Time Threat Intelligence",
    description:
      "Continuous feeds from global threat intelligence networks enrich your security posture with up-to-the-minute indicators of compromise, emerging attack patterns, and zero-day vulnerability data.",
  },
  {
    step: "03",
    title: "Automated Policy Enforcement",
    description:
      "Define security policies once and enforce them uniformly across every endpoint, network segment, email flow, and web session. Automated compliance checks ensure policies stay effective.",
  },
  {
    step: "04",
    title: "Continuous Optimization",
    description:
      "Ongoing tuning of detection rules, policy refinements, and threat model updates ensure the Protection Suite evolves alongside your threat landscape and business requirements.",
  },
];

const benefits = [
  "Multi-cloud protection for Microsoft 365, AWS, Google Cloud, SharePoint, and Salesforce",
  "500,000+ automation scripts with MDR/XDR/SOAR capabilities",
  "Faster incident response with automated playbooks across 100+ operating systems",
  "Stay ahead of threats with real-time intelligence",
  "ISO 27001, SOC 2, HIPAA, PCI-DSS, and GDPR compliance reporting",
  "Scalable cloud-native architecture that grows with your business",
];

export default function ProtectionSuitePage() {
  return (
    <SolutionPageLayout
      metricsPreset="protection-suite"
      title='Protection <span class="gradient-text-glow">Suite</span>'
      subtitle="Multi-layered security protection combining endpoint, network, email, and web security into a unified threat management platform with real-time intelligence and automated policy enforcement."
      categoryBadge={{
        label: "Multi-Layered Defense",
        icon: <Shield className="h-3.5 w-3.5" />,
      }}
      heroVisualization={<ProtectionSuiteHero />}
      features={features}
      process={process}
      benefits={benefits}
      ctaTitle='Elevate Your <span class="gradient-text">Security Posture</span>'
      ctaSubtitle="Let our security architects design a Protection Suite deployment tailored to your threat landscape and compliance requirements."
      ctaButtonLabel="Talk to an Expert"
      breadcrumbLabel="Protection Suite"
    />
  );
}
