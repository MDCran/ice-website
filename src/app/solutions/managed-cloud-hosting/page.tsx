"use client";

import {
  Cloud,
  Shield,
  Server,
  Monitor,
  Zap,
  Users,
  Lock,
} from "lucide-react";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import CloudHostingHero from "@/components/solutions/heroes/CloudHostingHero";

const features = [
  {
    icon: <Monitor className="h-6 w-6" />,
    title: "24/7 Proactive Monitoring",
    description:
      "Round-the-clock infrastructure monitoring with automated alerting and rapid incident response by our expert operations team.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Tier-3 Data Centers",
    description:
      "Tier-3 data centers with PCI, HIPAA, SOX, and GDPR compliance. Flash Systems Storage delivers enterprise-grade performance and reliability.",
  },
  {
    icon: <Server className="h-6 w-6" />,
    title: "Redundant Infrastructure",
    description:
      "Fully redundant power, cooling, and network connectivity across geographically separated Tier-3 data centers with automatic failover.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Scalable Resources",
    description:
      "Instantly scale compute, storage, and network resources up or down to match evolving business demands without downtime.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Dedicated Support Team",
    description:
      "Named account managers and certified engineers providing personalized support with guaranteed response times.",
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: "Multi-Tenant Isolation",
    description:
      "Enterprise-grade logical isolation ensuring your workloads, data, and network traffic remain completely separated.",
  },
];

const process = [
  {
    step: "01",
    title: "Assessment",
    description:
      "We evaluate your current infrastructure, workloads, and performance requirements to design the optimal hosting architecture.",
  },
  {
    step: "02",
    title: "Provisioning",
    description:
      "Our team provisions your environment on IBM Power systems or x86 platforms with redundant storage, networking, and security layers.",
  },
  {
    step: "03",
    title: "Migration",
    description:
      "We execute a seamless migration of your workloads with minimal disruption, thoroughly tested at every stage.",
  },
  {
    step: "04",
    title: "Management",
    description:
      "Ongoing 24/7 monitoring, patching, backups, and performance optimization keep your environment running at peak efficiency.",
  },
];

const benefits = [
  "Reduce infrastructure costs by over 50% on average over 3 years",
  "Save over 70% of time spent on infrastructure management",
  "Guaranteed uptime at Tier-3 data centers",
  "IBM Power and x86 environments with Flash Systems Storage",
  "Automatic failover to geographically separated backup data centers",
  "PCI, HIPAA, SOX, and GDPR compliant infrastructure",
];

export default function ManagedCloudHostingPage() {
  return (
    <SolutionPageLayout
      metricsPreset="managed-cloud-hosting"
      title='Managed Cloud <span class="gradient-text-glow">Hosting</span>'
      subtitle="Enterprise-grade cloud hosting powered by Tier-3 data centers with Flash Systems Storage. 24/7 monitoring, fully managed infrastructure, and PCI, HIPAA, SOX, and GDPR compliance."
      categoryBadge={{ label: "Cloud Services", icon: <Cloud className="h-4 w-4 text-sky-400" /> }}
      heroVisualization={<CloudHostingHero />}
      features={features}
      process={process}
      benefits={benefits}
      ctaTitle='Ready to Move to the <span class="gradient-text">Cloud?</span>'
      ctaSubtitle="Let our enterprise architects design a managed hosting solution tailored to your workloads, compliance needs, and budget."
      breadcrumbLabel="Managed Cloud Hosting"
    />
  );
}
