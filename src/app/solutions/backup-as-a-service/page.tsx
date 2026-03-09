"use client";

import {
  HardDrive,
  Clock,
  Lock,
  Zap,
  Server,
  FileCheck,
} from "lucide-react";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import DataProtectionHero from "@/components/solutions/heroes/DataProtectionHero";

const features = [
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Automated Scheduling",
    description:
      "Set-and-forget backup policies with intelligent scheduling that adapts to your workload patterns. Full, incremental, and differential backups run on your terms.",
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: "End-to-End Encryption",
    description:
      "Enterprise-grade encryption at rest and in transit ensures your data is protected from unauthorized access. Immutable storage prevents ransomware from altering backup copies.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Rapid Restore",
    description:
      "Granular recovery options let you restore individual files, folders, databases, or entire systems in minutes, not hours. Minimize downtime when it matters most.",
  },
  {
    icon: <Server className="h-6 w-6" />,
    title: "Multi-Platform Support",
    description:
      "Native support for IBM i (AS/400), AIX, Linux, and Windows environments. A single pane of glass for all your heterogeneous backup operations.",
  },
  {
    icon: <HardDrive className="h-6 w-6" />,
    title: "Immutable & Tape Archive Storage",
    description:
      "Immutable storage plus monthly tape archiving ensures your backups survive even regional disasters. Elastic storage with pay-as-you-grow pricing scales with your needs.",
  },
  {
    icon: <FileCheck className="h-6 w-6" />,
    title: "Self-Service Portal & Reporting",
    description:
      "Self-service portal for on-demand restores and compliance-ready reports for SOC 2, HIPAA, PCI-DSS, GDPR, and other regulatory frameworks.",
  },
];

const process = [
  {
    step: "01",
    title: "Assessment",
    description:
      "We analyze your infrastructure, data volumes, and recovery requirements to design a backup strategy tailored to your environment.",
  },
  {
    step: "02",
    title: "Configuration",
    description:
      "Our engineers deploy and configure backup agents, set retention policies, encryption keys, and replication targets across all your systems.",
  },
  {
    step: "03",
    title: "Automation",
    description:
      "Intelligent scheduling takes over, running backups at optimal intervals with automatic verification and integrity checks after every job.",
  },
  {
    step: "04",
    title: "Monitoring & Management",
    description:
      "ICE's 24/7 operations team monitors every backup job, resolves issues proactively, and provides monthly health reports to your team.",
  },
];

const benefits = [
  "Eliminate data loss risk with immutable, policy-driven backups",
  "Reduce RTO with instant granular and bare-metal restore options",
  "Pay-as-you-grow pricing with elastic storage that scales to your needs",
  "Meet compliance requirements with built-in audit trails and self-service portal",
  "Free your IT team from manual backup management tasks",
  "Monthly tape archiving provides an additional layer of long-term protection",
];

export default function BackupAsAServicePage() {
  return (
    <SolutionPageLayout
      metricsPreset="backup-as-a-service"
      title='Backup as a <span class="gradient-text-glow">Service</span>'
      subtitle="Automated, encrypted backups with rapid restore capabilities -- managed 24/7 by ICE's operations team. Protect IBM i, AIX, Linux, and Windows environments with on-site and off-site replication built for enterprise resilience."
      categoryBadge={{ label: "Managed Data Protection", icon: <HardDrive className="h-4 w-4 text-sky-400" /> }}
      heroVisualization={<DataProtectionHero />}
      features={features}
      process={process}
      benefits={benefits}
      ctaTitle='Ready to Protect Your <span class="gradient-text">Critical Data?</span>'
      ctaSubtitle="Talk to our backup architects about a solution tailored to your infrastructure, compliance requirements, and budget."
      breadcrumbLabel="Backup as a Service"
    />
  );
}
