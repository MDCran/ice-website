"use client";

import {
  Monitor,
  Cloud,
  Mail,
  Users,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import ManagedMicrosoftHero from "@/components/solutions/heroes/ManagedMicrosoftHero";

const features = [
  {
    icon: <Monitor className="h-6 w-6" />,
    title: "Microsoft 365 Management",
    description:
      "Full lifecycle administration of Exchange Online, SharePoint, OneDrive, and the entire M365 suite. Provisioning, configuration, and ongoing optimization.",
  },
  {
    icon: <Cloud className="h-6 w-6" />,
    title: "Azure Infrastructure",
    description:
      "Design, deploy, and manage Azure virtual machines, networking, storage, and PaaS services tailored to your enterprise workloads.",
  },
  {
    icon: <Mail className="h-6 w-6" />,
    title: "Exchange Administration",
    description:
      "Expert management of Exchange Online and hybrid environments. Mail flow policies, retention rules, compliance archiving, and migration support.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Teams Optimization",
    description:
      "Microsoft Teams governance, voice integration, meeting room configuration, and user adoption strategies to maximize collaboration ROI.",
  },
  {
    icon: <KeyRound className="h-6 w-6" />,
    title: "License Management",
    description:
      "Continuous license auditing and right-sizing. Eliminate waste, reassign unused seats, and align subscriptions with actual usage patterns.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Security & Compliance",
    description:
      "Conditional Access policies, MFA enforcement, DLP rules, sensitivity labels, and Microsoft Defender configuration to protect your environment.",
  },
];

const process = [
  {
    step: "01",
    title: "Assessment & Discovery",
    description:
      "We audit your current Microsoft environment, licensing, security posture, and identify gaps and cost-saving opportunities.",
  },
  {
    step: "02",
    title: "Architecture & Planning",
    description:
      "Our architects design an optimized M365 and Azure blueprint aligned with your business objectives and compliance requirements.",
  },
  {
    step: "03",
    title: "Migration & Deployment",
    description:
      "Zero-downtime migration from on-premises Exchange, Active Directory, and file shares to the Microsoft cloud platform.",
  },
  {
    step: "04",
    title: "Ongoing Management",
    description:
      "24/7 proactive monitoring, patching, license optimization, and expert support ensure your Microsoft environment runs flawlessly.",
  },
];

const benefits = [
  "Up to 38% cost savings through continuous optimization and right-sizing",
  "Prevent misconfigurations -- the primary source of cloud security incidents for 60% of organizations",
  "Dedicated Microsoft-certified engineers on call 24/7 who know your environment",
  "Seamless hybrid integration bridging on-premises AD, Exchange, and file servers",
  "Zero-downtime migrations with proven methodology and rollback protection",
  "Continuous compliance monitoring aligned with industry regulations",
];

export default function ManagedMicrosoftPage() {
  return (
    <SolutionPageLayout
      metricsPreset="managed-microsoft"
      title='Managed <span class="gradient-text">Microsoft Services</span>'
      subtitle="Complete Microsoft 365 and Azure management by ICE's certified engineers. From Exchange Online and SharePoint to Azure infrastructure and security configuration -- we handle everything so you can focus on your business."
      categoryBadge={{ label: "Managed Services", icon: <Monitor className="h-3.5 w-3.5 text-sky-400" /> }}
      heroVisualization={<ManagedMicrosoftHero />}
      features={features}
      process={process}
      benefits={benefits}
      ctaTitle='Ready to Optimize Your <span class="gradient-text">Microsoft Environment?</span>'
      ctaSubtitle="Schedule a free assessment with our Microsoft-certified engineers. We'll identify cost savings, security gaps, and optimization opportunities in your M365 and Azure environment."
      ctaButtonLabel="Schedule Assessment"
      breadcrumbLabel="Managed Microsoft"
    />
  );
}
