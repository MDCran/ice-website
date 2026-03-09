"use client";

import {
  Radar,
  Eye,
  BarChart3,
  Bell,
  BrainCircuit,
  ClipboardCheck,
  Siren,
} from "lucide-react";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import SecurityMonitoringHero from "@/components/solutions/heroes/SecurityMonitoringHero";

const features = [
  {
    icon: <Eye className="h-6 w-6" />,
    title: "24/7 SOC",
    description:
      "Round-the-clock Security Operations Center staffed by certified analysts who monitor, triage, and escalate threats in real time.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "SIEM Integration",
    description:
      "Seamless integration with leading SIEM platforms for centralized log collection, correlation, and advanced threat analytics.",
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: "Real-Time Alerting",
    description:
      "Intelligent alerting with tunable thresholds, reducing noise while ensuring critical events are never missed.",
  },
  {
    icon: <BrainCircuit className="h-6 w-6" />,
    title: "Threat Intelligence",
    description:
      "Correlation with global threat intelligence feeds to identify indicators of compromise and emerging attack campaigns.",
  },
  {
    icon: <ClipboardCheck className="h-6 w-6" />,
    title: "Compliance Monitoring",
    description:
      "Continuous compliance posture monitoring with automated audit trails for ISO 27001, SOC 2, HIPAA, PCI-DSS, GDPR, and NIST-800-53.",
  },
  {
    icon: <Siren className="h-6 w-6" />,
    title: "Incident Response",
    description:
      "Coordinated incident response with documented runbooks, forensic investigation support, and post-incident reporting.",
  },
];

const process = [
  {
    step: "01",
    title: "Collect",
    description:
      "We deploy log collectors and agents across your infrastructure to gather security events from endpoints, network devices, cloud workloads, and applications.",
  },
  {
    step: "02",
    title: "Correlate",
    description:
      "Our SIEM engine normalizes and correlates billions of events, applying threat intelligence and behavioral analytics to surface genuine threats.",
  },
  {
    step: "03",
    title: "Detect",
    description:
      "SOC analysts review correlated alerts, investigate anomalies, and classify threats by severity using established frameworks like MITRE ATT&CK.",
  },
  {
    step: "04",
    title: "Respond",
    description:
      "Confirmed threats trigger coordinated response actions including containment, stakeholder notification, forensic investigation, and remediation guidance.",
  },
];

const benefits = [
  "Detect threats before they become breaches",
  "Reduce alert fatigue with intelligent correlation",
  "Meet regulatory compliance monitoring requirements",
  "Gain complete visibility across hybrid environments",
  "Access expert analysts without building an in-house SOC",
  "Continuous improvement through threat hunting and reporting",
];

export default function SecurityMonitoringPage() {
  return (
    <SolutionPageLayout
      metricsPreset="security-monitoring"
      title='Security <span class="gradient-text">Monitoring</span>'
      subtitle="Around-the-clock Security Operations Center monitoring with SIEM integration, real-time alerting, threat intelligence correlation, and coordinated incident response for complete threat visibility."
      categoryBadge={{
        label: "24/7 Threat Surveillance",
        icon: <Radar className="h-3.5 w-3.5" />,
      }}
      heroVisualization={<SecurityMonitoringHero />}
      features={features}
      process={process}
      benefits={benefits}
      ctaTitle='Stop Threats in Their <span class="gradient-text">Tracks</span>'
      ctaSubtitle="Connect with our security team to learn how 24/7 monitoring can transform your threat detection and response capabilities."
      ctaButtonLabel="Get Started"
      breadcrumbLabel="Security Monitoring"
    />
  );
}
