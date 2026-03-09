"use client";

import {
  Cloud,
  Server,
  DollarSign,
  Settings,
  GitMerge,
  Award,
  Cpu,
} from "lucide-react";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import ManagedServicesHero from "@/components/solutions/heroes/ManagedServicesHero";

const features = [
  {
    icon: <Cloud className="h-6 w-6" />,
    title: "Cloud-Based Power",
    description:
      "Run IBM Power infrastructure in the cloud without capital expenditure. Elastic compute and storage scale on demand to match your workload requirements.",
  },
  {
    icon: <Server className="h-6 w-6" />,
    title: "IBM i & AIX Support",
    description:
      "Full support for IBM i (AS/400) and AIX workloads. Run your existing RPG, COBOL, and CL applications without modification in a cloud-native environment.",
  },
  {
    icon: <DollarSign className="h-6 w-6" />,
    title: "Flexible Pricing",
    description:
      "Pay-as-you-go consumption model with no long-term commitments. Scale up for peak periods and scale down during off-hours to optimize costs.",
  },
  {
    icon: <Settings className="h-6 w-6" />,
    title: "Managed Operations",
    description:
      "ICE manages the full stack: OS patching, security hardening, backup, monitoring, and performance optimization -- you focus on your applications.",
  },
  {
    icon: <GitMerge className="h-6 w-6" />,
    title: "Hybrid Integration",
    description:
      "Seamlessly connect Power VS cloud instances with your on-premises Power Systems. Shared storage, networking, and unified management.",
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Certified Engineers",
    description:
      "ICE's IBM-certified Power Systems engineers have 35+ years of expertise. Your environment is managed by specialists, not generalists.",
  },
];

const process = [
  {
    step: "01",
    title: "Discovery & Planning",
    description:
      "We assess your current Power workloads, identify migration candidates, and design a tailored Power VS architecture and migration plan.",
  },
  {
    step: "02",
    title: "Environment Provisioning",
    description:
      "New Power LPARs deployed up to 15x faster than traditional provisioning, with networking, storage, and security configurations aligned to your requirements.",
  },
  {
    step: "03",
    title: "Migration & Testing",
    description:
      "Zero-downtime migration of IBM i and AIX workloads with comprehensive validation testing before production cutover.",
  },
  {
    step: "04",
    title: "Managed Operations",
    description:
      "24/7 monitoring, patching, backup, and performance optimization by ICE's certified Power Systems engineers.",
  },
];

const benefits = [
  "IBM Business Partner since 1990 with direct escalation to IBM engineering",
  "Up to 40% cost savings compared to on-premises Power infrastructure",
  "15x faster provisioning -- no hardware lead times or rack-and-stack",
  "70% reduction in on-premises infrastructure footprint",
  "50% faster disaster recovery and 80% lower DR costs",
  "Pay-as-you-go pricing eliminates capital expenditure and long-term commitments",
];

export default function IBMPowerVSPage() {
  return (
    <SolutionPageLayout
      metricsPreset="ibm-power-vs"
      title='IBM <span class="gradient-text">Power VS</span>'
      subtitle="Run IBM i and AIX workloads on IBM Power infrastructure in the cloud, fully managed by ICE's certified engineers. Flexible consumption, hybrid integration, and 35+ years of IBM expertise -- without the capital expenditure."
      categoryBadge={{ label: "IBM Power Systems", icon: <Cpu className="h-3.5 w-3.5 text-sky-400" /> }}
      heroVisualization={<ManagedServicesHero />}
      features={features}
      process={process}
      benefits={benefits}
      ctaTitle='Move Your Power Workloads to the <span class="gradient-text">Cloud</span>'
      ctaSubtitle="Let ICE's IBM-certified team design a Power VS solution tailored to your business. Whether it's dev/test, DR, or full production migration -- we'll get you there."
      ctaButtonLabel="Contact a Specialist"
      breadcrumbLabel="IBM Power VS"
    />
  );
}
