"use client";

import {
  Cpu,
  MonitorSmartphone,
  Wrench,
  AppWindow,
  Fingerprint,
  Smartphone,
  Bug,
} from "lucide-react";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import EndpointSecurityHero from "@/components/solutions/heroes/EndpointSecurityHero";

const features = [
  {
    icon: <Cpu className="h-6 w-6" />,
    title: "AI Threat Prevention",
    description:
      "Next-generation AI engine that predicts and prevents malware, ransomware, and fileless attacks before execution, without relying on signatures.",
  },
  {
    icon: <MonitorSmartphone className="h-6 w-6" />,
    title: "Device Management",
    description:
      "Comprehensive device lifecycle management including enrollment, configuration, compliance monitoring, and remote wipe capabilities.",
  },
  {
    icon: <Wrench className="h-6 w-6" />,
    title: "Patch Management",
    description:
      "Automated vulnerability patching across operating systems and third-party applications with testing, scheduling, and rollback support.",
  },
  {
    icon: <AppWindow className="h-6 w-6" />,
    title: "Application Control",
    description:
      "Whitelist/blacklist application policies, privilege elevation management, and shadow IT detection to control what runs on your endpoints.",
  },
  {
    icon: <Fingerprint className="h-6 w-6" />,
    title: "Zero-Trust Verification",
    description:
      "Continuous endpoint posture assessment ensures only healthy, compliant, and verified devices gain access to corporate resources.",
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: "Mobile Support",
    description:
      "Full protection for iOS and Android devices including mobile threat defense, app security, and secure container management.",
  },
];

const process = [
  {
    step: "01",
    title: "Endpoint Assessment",
    description:
      "We audit your current endpoint landscape, identify unmanaged devices, and assess your security posture across all platforms.",
  },
  {
    step: "02",
    title: "Policy Design",
    description:
      "Our engineers design tailored security policies, patch schedules, and application control rules aligned with your compliance requirements.",
  },
  {
    step: "03",
    title: "Agent Deployment",
    description:
      "Zero-disruption rollout of endpoint agents across Windows, macOS, Linux, and mobile devices with automated enrollment.",
  },
  {
    step: "04",
    title: "Continuous Protection",
    description:
      "24/7 threat monitoring, automated patching, and ongoing policy tuning ensure every endpoint stays protected and compliant.",
  },
];

const benefits = [
  "AI-powered EDR with real-time blocking stops threats before execution",
  "Continuous endpoint posture assessment verifies every device, every time",
  "Automated patching closes vulnerability windows in hours, not weeks",
  "Unified management across Windows, macOS, Linux, and mobile",
  "Full EDR with behavioral detection and automated investigation",
  "Cloud-native console with role-based access and compliance dashboards",
];

export default function EndpointSecurityPage() {
  return (
    <SolutionPageLayout
      metricsPreset="endpoint-security"
      title='Endpoint <span class="gradient-text-glow">Security</span>'
      subtitle="Next-generation endpoint protection with AI-driven threat prevention, automated patch management, application control, and zero-trust device verification across every platform your team uses."
      categoryBadge={{ label: "Next-Gen Protection", icon: <Bug className="h-3.5 w-3.5 text-sky-400" /> }}
      heroVisualization={<EndpointSecurityHero />}
      features={features}
      process={process}
      benefits={benefits}
      ctaTitle='Secure Every Device, <span class="gradient-text">Everywhere</span>'
      ctaSubtitle="From laptops to mobile devices, let ICE protect every endpoint in your organization with AI-driven, zero-trust security."
      ctaButtonLabel="Get Protected"
      breadcrumbLabel="Endpoint Security"
    />
  );
}
