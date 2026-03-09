"use client";

import {
  Lock,
  Fingerprint,
  SlidersHorizontal,
  FileCheck2,
  Cpu,
  Settings,
  ShieldCheck,
} from "lucide-react";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import CloudHero from "@/components/solutions/heroes/CloudHero";

const features = [
  {
    icon: <Fingerprint className="h-6 w-6" />,
    title: "Single-Tenant Isolation",
    description:
      "Your environment runs on dedicated hardware with complete physical and logical separation — no noisy neighbors, no shared resources.",
  },
  {
    icon: <SlidersHorizontal className="h-6 w-6" />,
    title: "Custom Configurations",
    description:
      "Tailor every layer of the stack — compute, storage, networking, and security policies — to your exact specifications.",
  },
  {
    icon: <FileCheck2 className="h-6 w-6" />,
    title: "Compliance Ready",
    description:
      "Purpose-built for regulated industries with ISO 27001, SOC 2, HIPAA, PCI-DSS, GDPR, and NIST-800-53 certifications.",
  },
  {
    icon: <Cpu className="h-6 w-6" />,
    title: "Dedicated Resources",
    description:
      "Guaranteed CPU, memory, and storage allocations that are never oversubscribed, ensuring predictable performance at all times.",
  },
  {
    icon: <Settings className="h-6 w-6" />,
    title: "Full Root Access & Control",
    description:
      "Maintain complete administrative control over your environment while we handle the underlying infrastructure management.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Enterprise SLA",
    description:
      "Industry-leading SLAs with uptime guarantees. Up to 40% lower TCO and 70% savings in IT management time compared to self-managed environments.",
  },
];

const process = [
  {
    step: "01",
    title: "Requirements Analysis",
    description:
      "We assess your compliance needs, workload profiles, and security requirements to design a private cloud architecture tailored to your organization.",
  },
  {
    step: "02",
    title: "Architecture Design",
    description:
      "Our engineers design your dedicated environment — custom network topologies, storage configurations, and security frameworks aligned to your policies.",
  },
  {
    step: "03",
    title: "Build & Deploy",
    description:
      "We provision dedicated hardware, configure your environment, and migrate workloads with full testing and validation at every stage.",
  },
  {
    step: "04",
    title: "Managed Operations",
    description:
      "Ongoing 24/7 management including patching, monitoring, backups, and incident response — all adhering to your specific change management processes.",
  },
];

const benefits = [
  "Complete physical and logical isolation from other tenants",
  "Meet ISO 27001, SOC 2, HIPAA, PCI-DSS, GDPR, and NIST-800-53 compliance mandates",
  "Up to 40% lower TCO compared to self-managed private infrastructure",
  "Save up to 70% in IT management time with fully managed operations",
  "Full administrative control with custom network topologies",
  "Run any workload -- from legacy IBM i to modern containers",
];

export default function ManagedPrivateCloudPage() {
  return (
    <SolutionPageLayout
      metricsPreset="managed-private-cloud"
      title='Managed Private <span class="gradient-text-glow">Cloud</span>'
      subtitle="Dedicated single-tenant cloud environments with complete isolation, custom configurations, and compliance-ready infrastructure. Ideal for regulated industries demanding the highest levels of security and control."
      categoryBadge={{ label: "Private Cloud", icon: <Lock className="h-4 w-4 text-sky-400" /> }}
      heroVisualization={<CloudHero />}
      features={features}
      process={process}
      benefits={benefits}
      ctaTitle='Your Cloud. Your Rules. <span class="gradient-text">Our Expertise.</span>'
      ctaSubtitle="Experience the security of dedicated infrastructure with the convenience of fully managed operations. Talk to our architects today."
      ctaButtonLabel="Build Your Private Cloud"
      breadcrumbLabel="Managed Private Cloud"
    />
  );
}
