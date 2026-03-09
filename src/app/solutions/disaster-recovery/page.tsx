"use client";

import {
  RefreshCcw,
  Timer,
  Globe,
  Zap,
  ClipboardCheck,
  FileText,
  Users,
} from "lucide-react";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import ComparisonTable from "@/components/solutions/ComparisonTable";
import DisasterRecoveryHero from "@/components/solutions/heroes/DisasterRecoveryHero";

const comparisonData = [
  { label: "Automated failover & failback", withoutICE: false, withICE: true },
  { label: "Guaranteed RTO / RPO SLAs", withoutICE: false, withICE: true },
  { label: "Geographic redundancy", withoutICE: false, withICE: true },
  { label: "Regular DR testing & validation", withoutICE: false, withICE: true },
  { label: "24/7 DR operations team", withoutICE: false, withICE: true },
  { label: "Comprehensive runbooks & documentation", withoutICE: false, withICE: true },
  { label: "Monthly subscription (no CapEx)", withoutICE: false, withICE: true },
];

const features = [
  {
    icon: <Timer className="h-6 w-6" />,
    title: "Guaranteed RTO / RPO",
    description:
      "Contractually guaranteed Recovery Time and Recovery Point Objectives backed by SLAs. Know exactly when your systems will be back online.",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Geographic Redundancy",
    description:
      "Data replicated across geographically diverse data centers ensures survivability against regional outages, natural disasters, and infrastructure failures.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Automated Failover",
    description:
      "One-click or fully automated failover procedures bring your critical workloads online at your DR site within your defined RTO window.",
  },
  {
    icon: <ClipboardCheck className="h-6 w-6" />,
    title: "Automated Testing & Validation",
    description:
      "Automated DR testing and validation ensures your recovery plan works. Scheduled drills run without disrupting production, with detailed reports identifying gaps.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Comprehensive Documentation",
    description:
      "Complete runbooks, escalation procedures, and recovery documentation maintained and updated by our DR team after every change or test.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "24/7 DR Operations Team",
    description:
      "Dedicated disaster recovery specialists available around the clock to execute recovery procedures and coordinate with your team during events.",
  },
];

const process = [
  {
    step: "01",
    title: "Discovery & Planning",
    description:
      "Business impact analysis, RTO/RPO definition, application dependency mapping, and DR strategy design aligned to your risk tolerance.",
  },
  {
    step: "02",
    title: "Infrastructure Build-Out",
    description:
      "Provision DR infrastructure at our secondary data center, configure replication, and establish secure connectivity between primary and DR sites.",
  },
  {
    step: "03",
    title: "Runbook Development",
    description:
      "Create detailed recovery runbooks for every protected workload, including step-by-step failover and failback procedures with assigned responsibilities.",
  },
  {
    step: "04",
    title: "Testing & Validation",
    description:
      "Execute a full DR test to validate recovery meets defined RTOs and RPOs. Document results, identify improvements, and refine the plan.",
  },
];

const benefits = [
  "Keep revenue-generating systems operational through any disruption",
  "ISO 27001, SOC 2, HIPAA, PCI-DSS, and GDPR compliant DR infrastructure",
  "Real-time data replication with instant failover capabilities",
  "Automated testing and validation ensures recovery readiness",
  "Monthly subscription model eliminates large capital expenditures",
  "ICE's certified engineers handle every aspect of DR execution",
];

export default function DisasterRecoveryPage() {
  return (
    <SolutionPageLayout
      metricsPreset="disaster-recovery"
      title='Disaster Recovery <span class="gradient-text-glow">as a Service</span>'
      subtitle="Full disaster recovery with guaranteed RTOs and RPOs, geographic redundancy across data centers, automated failover testing, and comprehensive DR planning -- all managed by ICE's 24/7 DR operations team."
      categoryBadge={{ label: "Managed Data Protection", icon: <RefreshCcw className="h-4 w-4 text-sky-400" /> }}
      heroVisualization={<DisasterRecoveryHero />}
      features={features}
      process={process}
      benefits={benefits}
      extraSections={
        <ComparisonTable
          mode="features"
          title="DIY vs. ICE Managed DR"
          data={comparisonData}
        />
      }
      ctaTitle='Don&#39;t Wait for a Disaster to <span class="gradient-text">Plan Your Recovery</span>'
      ctaSubtitle="Our DR architects will assess your environment and design a recovery strategy that meets your business continuity objectives."
      ctaButtonLabel="Start Your DR Assessment"
      breadcrumbLabel="Disaster Recovery"
    />
  );
}
