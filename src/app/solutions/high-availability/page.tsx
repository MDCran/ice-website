"use client";

import {
  Database,
  RefreshCcw,
  Gauge,
  Server,
  AppWindow,
  BarChart3,
  Clock,
} from "lucide-react";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import ComparisonTable from "@/components/solutions/ComparisonTable";
import HighAvailabilityHero from "@/components/solutions/heroes/HighAvailabilityHero";

const comparisonData = [
  { label: "Recovery Time (RTO)", before: 72, after: 30 },
  { label: "Data Loss Window (RPO)", before: 60, after: 10 },
  { label: "System Availability", before: 95, after: 100 },
  { label: "Failover Automation", before: 15, after: 95 },
  { label: "Monitoring Coverage", before: 40, after: 100 },
];

const features = [
  {
    icon: <RefreshCcw className="h-6 w-6" />,
    title: "Real-Time Replication",
    description:
      "Journal-based and continuous data replication captures every transaction in real time, ensuring no data is ever lost between primary and standby systems.",
  },
  {
    icon: <Gauge className="h-6 w-6" />,
    title: "Automatic Failover",
    description:
      "Intelligent monitoring detects failures and triggers automatic role swap to your standby system. Users experience minimal interruption -- often just a reconnect.",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Minutes-Range RPO",
    description:
      "Recovery Point Objectives of 5-10 minutes ensure minimal data loss. IBM Storwize Flash System SAN with Global Mirror provides continuous data protection across sites.",
  },
  {
    icon: <Server className="h-6 w-6" />,
    title: "Multi-Platform HA",
    description:
      "Purpose-built solutions for IBM i (HA4i), AIX (PowerHA), Linux, and Windows Server failover clusters. IBM Storwize Flash System SAN delivers enterprise-grade storage resilience.",
  },
  {
    icon: <AppWindow className="h-6 w-6" />,
    title: "Application-Aware",
    description:
      "Our HA solutions understand your application stack. Database-aware replication, application health checks, and coordinated failover for complex multi-tier systems.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Monitoring Dashboard",
    description:
      "Real-time visibility into replication lag, journal apply rates, system health, and failover readiness through a single-pane monitoring console.",
  },
];

const process = [
  {
    step: "01",
    title: "Replicate",
    description:
      "Every data change on your production system is captured and replicated to your standby system in real time. Journal-based replication ensures transactional consistency.",
  },
  {
    step: "02",
    title: "Monitor",
    description:
      "Automated monitoring tracks replication health, system performance, network connectivity, and application availability. Anomalies trigger instant alerts to our operations team.",
  },
  {
    step: "03",
    title: "Failover",
    description:
      "When a failure is detected, the standby system is promoted to production automatically. DNS updates, IP switching, and application startups are orchestrated seamlessly.",
  },
  {
    step: "04",
    title: "Recover",
    description:
      "Once your primary system is restored, reverse replication synchronizes changes and a controlled failback returns operations to normal with zero data loss.",
  },
];

const benefits = [
  "RPO of 5-10 minutes with IBM Storwize Flash System SAN and Global Mirror",
  "Automatic failover with approximately 30-minute RTO",
  "99.999% target uptime for mission-critical systems",
  "24/7/365 monitoring by ICE operations team",
  "Multi-platform support: IBM i, AIX, Linux, and Windows",
  "IBM Storwize Flash System SAN with intelligent compression and replication",
];

export default function HighAvailabilityPage() {
  return (
    <SolutionPageLayout
      metricsPreset="high-availability"
      title='High Availability <span class="gradient-text-glow">as a Service</span>'
      subtitle="Real-time data replication and automatic failover for mission-critical systems. Minutes-range RPO, 30-minute RTO. Continuous uptime for IBM i, AIX, Linux, and Windows environments -- managed by ICE."
      categoryBadge={{
        label: "Managed Data Protection",
        icon: <Database className="h-3.5 w-3.5" />,
      }}
      heroVisualization={<HighAvailabilityHero />}
      features={features}
      process={process}
      benefits={benefits}
      extraSections={
        <ComparisonTable
          mode="beforeAfter"
          title="Traditional vs. ICE High Availability"
          data={comparisonData}
        />
      }
      ctaTitle='Achieve <span class="gradient-text">Five-Nines Uptime</span>'
      ctaSubtitle="Let our HA specialists design a high availability solution that keeps your critical systems running -- no matter what."
      ctaButtonLabel="Talk to an HA Specialist"
      breadcrumbLabel="High Availability"
    />
  );
}
