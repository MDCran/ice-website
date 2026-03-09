"use client";

import {
  Eye,
  Shield,
  Gauge,
  BarChart2,
  Activity,
  Headphones,
  Settings,
} from "lucide-react";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import ManagedServicesHero from "@/components/solutions/heroes/ManagedServicesHero";

const features = [
  {
    icon: <Eye className="h-6 w-6" />,
    title: "24/7 Monitoring",
    description:
      "Round-the-clock NOC operations with real-time monitoring of CPU, memory, disk, network, and application health across all platforms.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Automated Patching",
    description:
      "Scheduled patch management for IBM i, AIX, Linux, and Windows. Tested, staged, and deployed with rollback protection.",
  },
  {
    icon: <Gauge className="h-6 w-6" />,
    title: "Performance Management",
    description:
      "Continuous performance baselining, trend analysis, and optimization recommendations to keep systems running at peak efficiency.",
  },
  {
    icon: <BarChart2 className="h-6 w-6" />,
    title: "Capacity Planning",
    description:
      "Predictive capacity analytics that forecast growth, prevent resource exhaustion, and inform hardware refresh decisions.",
  },
  {
    icon: <Activity className="h-6 w-6" />,
    title: "Health Dashboards",
    description:
      "Executive and technical dashboards providing real-time system health, SLA metrics, ticket status, and historical trend data.",
  },
  {
    icon: <Headphones className="h-6 w-6" />,
    title: "Expert Support",
    description:
      "Direct access to certified IBM i, AIX, Linux, and Windows engineers. Tier 1-3 support with guaranteed response times.",
  },
];

const process = [
  {
    step: "01",
    title: "Monitor",
    description:
      "24/7 NOC monitoring with automated alerting. We detect anomalies and potential issues before they escalate into outages.",
  },
  {
    step: "02",
    title: "Detect & Alert",
    description:
      "Intelligent thresholds and pattern recognition trigger alerts. Our engineers assess severity and initiate response protocols.",
  },
  {
    step: "03",
    title: "Remediate",
    description:
      "Automated runbooks handle common issues instantly. Complex problems are escalated to certified platform specialists.",
  },
  {
    step: "04",
    title: "Optimize",
    description:
      "Monthly reviews analyze trends, identify optimization opportunities, and plan capacity for upcoming business needs.",
  },
];

const benefits = [
  "100% uptime commitment with proactive monitoring and automated remediation",
  "Up to 40% reduction in IT support costs by offloading to ICE's NOC team",
  "Proactive patching and predictive analytics prevent incidents before they escalate",
  "Certified engineers available 24/7/365 with guaranteed response times",
  "Multi-platform coverage: IBM i, AIX, Linux, and Windows under one contract",
  "Continuous performance optimization with monthly trend reviews and capacity planning",
];

export default function SystemsManagementPage() {
  return (
    <SolutionPageLayout
      metricsPreset="systems-management"
      title='Proactive <span class="gradient-text">Systems Management</span>'
      subtitle="Enterprise IT systems monitoring, patching, and performance management across IBM i, AIX, Linux, and Windows. Our 24/7 NOC operations team of expert engineers keeps your infrastructure running at peak performance."
      categoryBadge={{ label: "24/7 NOC Operations", icon: <Settings className="h-3.5 w-3.5 text-sky-400" /> }}
      heroVisualization={<ManagedServicesHero />}
      features={features}
      process={process}
      benefits={benefits}
      ctaTitle='Let Our Experts Manage Your <span class="gradient-text">Infrastructure</span>'
      ctaSubtitle="Free your IT team from firefighting. ICE's 24/7 NOC operations provide proactive systems management so you can focus on strategic initiatives that drive your business forward."
      ctaButtonLabel="Get a Free Assessment"
      breadcrumbLabel="Systems Management"
    />
  );
}
