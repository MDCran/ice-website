"use client";

import {
  RefreshCcw,
  Clock,
  Award,
  Layers,
  Shield,
  TrendingUp,
  Headphones,
} from "lucide-react";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import ComparisonTable from "@/components/solutions/ComparisonTable";
import CloudHero from "@/components/solutions/heroes/CloudHero";

const comparisonData = [
  { label: "Infrastructure Costs", before: 100, after: 45 },
  { label: "Deployment Speed", before: 30, after: 90 },
  { label: "System Uptime", before: 95, after: 100 },
  { label: "Management Overhead", before: 85, after: 25 },
  { label: "Scalability", before: 35, after: 95 },
];

const features = [
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Zero Downtime",
    description:
      "Live migration techniques ensure your business never stops. Users experience seamless transitions with no interruption.",
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Proven Methodology",
    description:
      "A battle-tested framework refined through 730+ successful ICE migration projects across every industry vertical.",
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Any Workload Support",
    description:
      "Migrate IBM i, AIX, Linux, Windows, or containerized workloads. No platform is too complex or too legacy for our team.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Risk Mitigation",
    description:
      "Comprehensive rollback plans, staged migrations, and parallel-run validation eliminate risk at every step.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Cost Optimization",
    description:
      "Right-size your target environment from day one. Our analysis identifies savings opportunities most teams overlook.",
  },
  {
    icon: <Headphones className="h-6 w-6" />,
    title: "Post-Migration Support",
    description:
      "Dedicated support during the critical 90-day stabilization period ensures a smooth transition for your teams.",
  },
];

const process = [
  {
    step: "01",
    title: "Discover & Assess",
    description:
      "Comprehensive analysis of your current environment — applications, dependencies, data flows, and performance baselines. We identify risks, quick wins, and the optimal migration sequence.",
  },
  {
    step: "02",
    title: "Plan & Architect",
    description:
      "Design the target architecture and create a detailed migration plan with timelines, resource requirements, and rollback procedures. Every scenario is accounted for.",
  },
  {
    step: "03",
    title: "Migrate & Validate",
    description:
      "Execute the migration with zero downtime using proven tools and techniques. Every workload is validated against performance baselines before cutover.",
  },
  {
    step: "04",
    title: "Optimize & Support",
    description:
      "Post-migration optimization to right-size resources, tune performance, and implement cost controls. Ongoing support ensures long-term success.",
  },
];

const benefits = [
  "3x faster deployments and 40% fewer post-migration problems",
  "Zero data loss approach with comprehensive validation at every stage",
  "40-60% reduction in infrastructure costs post-migration",
  "HIPAA, PCI-DSS, SOC II, and GDPR compliant migration processes",
  "730+ successful migrations completed by ICE",
  "Dedicated post-migration support and optimization",
];

export default function CloudMigrationPage() {
  return (
    <SolutionPageLayout
      metricsPreset="cloud-migration"
      title='Cloud Migration <span class="gradient-text-glow">Services</span>'
      subtitle="Expert-led migration with zero downtime. From assessment to optimization, we migrate any workload -- IBM i, AIX, Linux, Windows -- with 3x faster deployments and a zero data loss approach refined through 730+ ICE projects."
      categoryBadge={{ label: "Migration Services", icon: <RefreshCcw className="h-4 w-4 text-sky-400" /> }}
      heroVisualization={<CloudHero />}
      features={features}
      process={process}
      benefits={benefits}
      extraSections={
        <ComparisonTable
          mode="beforeAfter"
          title="Before & After Migration"
          data={comparisonData}
        />
      }
      ctaTitle='Ready to Modernize Your <span class="gradient-text">Infrastructure?</span>'
      ctaSubtitle="Start with a free migration assessment. Our experts will analyze your current environment and deliver a detailed plan with timelines, costs, and risk factors."
      ctaButtonLabel="Get Your Free Assessment"
      breadcrumbLabel="Cloud Migration Services"
    />
  );
}
