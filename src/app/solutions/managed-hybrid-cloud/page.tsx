"use client";

import {
  Globe,
  Workflow,
  ArrowLeftRight,
  Shield,
  Zap,
  Server,
  Eye,
} from "lucide-react";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import CloudHero from "@/components/solutions/heroes/CloudHero";

const features = [
  {
    icon: <Workflow className="h-6 w-6" />,
    title: "Unified Management",
    description:
      "A single control plane to manage workloads across on-premises, private cloud, and public cloud environments.",
  },
  {
    icon: <ArrowLeftRight className="h-6 w-6" />,
    title: "Workload Portability",
    description:
      "Move applications and data between environments seamlessly based on performance, cost, or compliance requirements.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Consistent Security",
    description:
      "Unified security policies enforced across all environments — identity management, encryption, and threat detection.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Elastic Scaling",
    description:
      "Burst into cloud resources during peak demand while keeping steady-state workloads on-premises for cost efficiency.",
  },
  {
    icon: <Server className="h-6 w-6" />,
    title: "Multi-Platform Integration",
    description:
      "Deep integration with IBM Power, AIX, and x86 infrastructure, plus Microsoft 365, Google Workspace, AWS, Azure, and GCP through secure connectivity.",
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: "Single Pane of Glass",
    description:
      "Comprehensive visibility into all environments with unified monitoring, logging, alerting, and reporting dashboards.",
  },
];

const process = [
  {
    step: "01",
    title: "Connect",
    description:
      "Establish secure, high-performance connections between your on-premises data center and cloud environments using dedicated links and encrypted tunnels.",
  },
  {
    step: "02",
    title: "Orchestrate",
    description:
      "Intelligent workload placement and orchestration ensures each application runs in the optimal environment based on your defined policies.",
  },
  {
    step: "03",
    title: "Optimize",
    description:
      "AI-driven analytics continuously analyze utilization patterns and recommend optimizations for cost, performance, and compliance.",
  },
  {
    step: "04",
    title: "Manage",
    description:
      "24/7 managed operations across the entire hybrid estate with unified monitoring, incident response, and continuous improvement.",
  },
];

const benefits = [
  "Extend the life of on-premises investments while adopting cloud innovation",
  "Optimize costs by placing workloads in the most efficient environment",
  "Maintain data sovereignty with flexible data residency controls",
  "Scale instantly without rearchitecting existing applications",
  "Unified compliance posture across all infrastructure",
  "Reduce vendor lock-in with multi-cloud portability",
  "Accelerate time-to-market for new digital initiatives",
  "24/7 managed operations across the entire hybrid estate",
];

export default function ManagedHybridCloudPage() {
  return (
    <SolutionPageLayout
      metricsPreset="managed-hybrid-cloud"
      title='Managed Hybrid <span class="gradient-text-glow">Cloud</span>'
      subtitle="Bridge on-premises infrastructure with the cloud seamlessly. Unified management, workload mobility, and consistent security policies across every environment — all fully managed by ICE."
      categoryBadge={{ label: "Hybrid Cloud", icon: <Globe className="h-4 w-4 text-sky-400" /> }}
      heroVisualization={<CloudHero />}
      features={features}
      process={process}
      benefits={benefits}
      ctaTitle='Bridge Your Infrastructure <span class="gradient-text">Seamlessly</span>'
      ctaSubtitle="Extend your on-premises investments into the cloud without compromise. Our hybrid cloud architects will design a unified strategy for your enterprise."
      ctaButtonLabel="Start Your Hybrid Journey"
      breadcrumbLabel="Managed Hybrid Cloud"
    />
  );
}
