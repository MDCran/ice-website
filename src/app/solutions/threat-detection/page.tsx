"use client";

import {
  Crosshair,
  BrainCircuit,
  Activity,
  ShieldOff,
  Search,
  FileSearch,
  Siren,
} from "lucide-react";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import ThreatDetectionHero from "@/components/solutions/heroes/ThreatDetectionHero";

const features = [
  {
    icon: <BrainCircuit className="h-6 w-6" />,
    title: "AI-Driven Detection",
    description:
      "Machine learning detection enriched by global threat intelligence feeds identifies malicious patterns, zero-day exploits, and advanced persistent threats in real time.",
  },
  {
    icon: <Activity className="h-6 w-6" />,
    title: "Behavioral Analysis",
    description:
      "User and entity behavior analytics (UEBA) establish baselines and detect deviations that signal insider threats, compromised credentials, or lateral movement.",
  },
  {
    icon: <ShieldOff className="h-6 w-6" />,
    title: "Automated Containment",
    description:
      "When a threat is confirmed, automated playbooks isolate affected systems, block malicious IPs, and disable compromised accounts within seconds.",
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: "Proactive Threat Hunting",
    description:
      "Our threat hunters proactively search your environment for hidden adversaries using hypothesis-driven investigation and MITRE ATT&CK mapping.",
  },
  {
    icon: <FileSearch className="h-6 w-6" />,
    title: "Forensic Investigation",
    description:
      "Full-spectrum digital forensics including memory analysis, disk imaging, network traffic capture, and timeline reconstruction for complete incident understanding.",
  },
  {
    icon: <Siren className="h-6 w-6" />,
    title: "Incident Response",
    description:
      "Structured incident response with clear escalation paths, stakeholder communication, evidence preservation, and regulatory notification support.",
  },
];

const process = [
  {
    step: "01",
    title: "Detect",
    description:
      "AI/ML-driven anomaly detection, behavioral baseline monitoring, network traffic analysis, and endpoint telemetry correlation identify threats in real time.",
  },
  {
    step: "02",
    title: "Investigate",
    description:
      "Automated alert triage, threat intelligence enrichment, MITRE ATT&CK mapping, and root cause analysis provide deep understanding of each threat.",
  },
  {
    step: "03",
    title: "Respond",
    description:
      "Automated containment, orchestrated remediation, forensic evidence collection, and post-incident reporting ensure threats are fully neutralized.",
  },
  {
    step: "04",
    title: "Improve",
    description:
      "Every incident strengthens detection models through feedback loops that refine algorithms, update threat intelligence, and reduce future dwell time.",
  },
];

const benefits = [
  "24/7 MDR with AI-powered detection reduces false positives significantly",
  "Full stack visibility across endpoints, network, cloud, and identity",
  "Continuous improvement through detection model feedback loops",
  "Proactive threat hunting reduces adversary dwell time dramatically",
  "Structured incident response with clear escalation paths",
  "MITRE ATT&CK framework mapping for complete attack chain visibility",
];

export default function ThreatDetectionPage() {
  return (
    <SolutionPageLayout
      metricsPreset="threat-detection"
      title='Threat Detection <span class="gradient-text">&amp; Response</span>'
      subtitle="Advanced threat hunting powered by AI/ML-driven analytics with behavioral analysis, anomaly detection, and automated containment. Stay ahead of adversaries with proactive intelligence and rapid forensic investigation."
      categoryBadge={{
        label: "Advanced Threat Defense",
        icon: <Crosshair className="h-3.5 w-3.5" />,
      }}
      heroVisualization={<ThreatDetectionHero />}
      features={features}
      process={process}
      benefits={benefits}
      ctaTitle='Hunt Threats Before They <span class="gradient-text">Hunt You</span>'
      ctaSubtitle="Don't wait for a breach to invest in threat detection. Talk to our security experts about proactive threat hunting and automated response."
      ctaButtonLabel="Contact Security Team"
      breadcrumbLabel="Threat Detection & Response"
    />
  );
}
