"use client";

import {
  ShieldAlert,
  Lock,
  Wifi,
  FlaskConical,
  ScanSearch,
  Vault,
  Zap,
} from "lucide-react";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import RansomwareRecoveryHero from "@/components/solutions/heroes/RansomwareRecoveryHero";

const features = [
  {
    icon: <Lock className="h-6 w-6" />,
    title: "Immutable Backups",
    description:
      "Write-once, read-many backup copies that cannot be encrypted, modified, or deleted by ransomware -- even with admin credentials. Your last line of defense.",
  },
  {
    icon: <Wifi className="h-6 w-6" />,
    title: "Air-Gapped Storage",
    description:
      "Physically and logically isolated storage that is unreachable from your production network. Ransomware cannot encrypt what it cannot reach.",
  },
  {
    icon: <FlaskConical className="h-6 w-6" />,
    title: "Clean Room Recovery",
    description:
      "Isolated recovery environment where backups are validated, scanned for threats, and restored before reconnecting to production infrastructure.",
  },
  {
    icon: <ScanSearch className="h-6 w-6" />,
    title: "Threat Scanning",
    description:
      "Proactive scanning of backup data for ransomware signatures, dormant malware, and indicators of compromise before any restore operation.",
  },
  {
    icon: <Vault className="h-6 w-6" />,
    title: "Cyber Vault Technology",
    description:
      "Automated data vaulting with time-locked retention policies. A digital bunker that keeps clean copies safe from any cyber threat.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Rapid Restoration",
    description:
      "Streamlined recovery procedures that bring critical systems back online within hours, not days. Prioritized restore based on business impact analysis.",
  },
];

const process = [
  {
    step: "01",
    title: "Prevention",
    description:
      "Immutable backups and air-gapped storage ensure clean copies always exist. Cyber vault technology creates a secure data bunker that ransomware cannot compromise.",
  },
  {
    step: "02",
    title: "Detection",
    description:
      "Continuous monitoring of backup data integrity and proactive threat scanning identify anomalies and potential compromise indicators before they escalate.",
  },
  {
    step: "03",
    title: "Isolation",
    description:
      "Upon detection, affected systems are immediately isolated. Clean room environments are spun up and uncompromised backup copies are identified and verified.",
  },
  {
    step: "04",
    title: "Recovery",
    description:
      "Validated clean backups are restored in the isolated clean room, scanned again for threats, then promoted to production. Systems come online in priority order.",
  },
];

const benefits = [
  "Immutable and air-gapped copies guarantee a clean restore point",
  "Clean room recovery prevents reinfection during restoration",
  "Up to 70% cost reduction compared to unprepared organizations",
  "Proactive threat scanning detects dormant malware in backups",
  "ISO 27001, ISO 27701, SOC 1 & 2, HIPAA, PCI-DSS, GDPR, and NIST-800-53 compliant",
  "24/7 incident response team with ransomware recovery expertise",
  "Regular recovery drills prove your readiness before an attack",
  "Compliance documentation for cyber insurance requirements",
];

export default function RansomwareRecoveryPage() {
  return (
    <SolutionPageLayout
      metricsPreset="ransomware-recovery"
      title='Ransomware <span class="gradient-text">Recovery</span>'
      subtitle="Protection against ransomware with immutable backups, air-gapped storage, and rapid recovery procedures. Proactive threat scanning, clean room recovery environments, and cyber vault technology -- because when ransomware strikes, your recovery plan is everything."
      categoryBadge={{
        label: "Cyber Resilience",
        icon: <ShieldAlert className="h-3.5 w-3.5" />,
      }}
      heroVisualization={<RansomwareRecoveryHero />}
      features={features}
      process={process}
      benefits={benefits}
      ctaTitle='Don&apos;t Let Ransomware Define <span class="gradient-text">Your Future</span>'
      ctaSubtitle="Talk to our cyber resilience team about building a ransomware recovery strategy that keeps your business safe -- and your data recoverable."
      ctaButtonLabel="Get a Readiness Assessment"
      breadcrumbLabel="Ransomware Recovery"
    />
  );
}
