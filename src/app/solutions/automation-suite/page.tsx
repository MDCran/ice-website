"use client";

import {
  Bot,
  Workflow,
  CalendarClock,
  Zap,
  Plug,
  BarChart3,
} from "lucide-react";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";
import AutomationSuiteHero from "@/components/solutions/heroes/AutomationSuiteHero";

const features = [
  {
    icon: <Bot className="h-6 w-6" />,
    title: "AI-Powered Automation",
    description:
      "Intelligent automation that handles patch management, vulnerability remediation, and security policy enforcement across your entire infrastructure -- powered by AI.",
  },
  {
    icon: <Workflow className="h-6 w-6" />,
    title: "Patch Automation",
    description:
      "Automated patch deployment across operating systems and applications. Test, stage, and roll out updates with intelligent scheduling and rollback protection.",
  },
  {
    icon: <CalendarClock className="h-6 w-6" />,
    title: "Vulnerability Management",
    description:
      "Continuous vulnerability scanning with automated remediation workflows. Identify, prioritize, and resolve security gaps before they become threats.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Endpoint Security Automation",
    description:
      "Automated endpoint protection policies, threat response playbooks, and compliance enforcement across Windows, macOS, Linux, and mobile platforms.",
  },
  {
    icon: <Plug className="h-6 w-6" />,
    title: "Cloud Gateway Protection",
    description:
      "Automated security policies for Microsoft 365, AWS, Google Cloud, SharePoint, and Salesforce. Enforce consistent protection across all cloud services.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Analytics Dashboard",
    description:
      "Real-time visibility into automation performance. Track patch compliance, vulnerability trends, and remediation metrics from a unified dashboard.",
  },
];

const process = [
  {
    step: "01",
    title: "Assess",
    description:
      "Evaluate your infrastructure across endpoints, cloud services, and on-premises systems to identify automation opportunities for patching, security, and operations.",
  },
  {
    step: "02",
    title: "Automate",
    description:
      "Deploy AI-powered automation for patch management, vulnerability remediation, endpoint security, and cloud gateway protection across your environment.",
  },
  {
    step: "03",
    title: "Optimize",
    description:
      "Real-time analytics track patch compliance, vulnerability trends, and security posture. Continuously improve automation rules and remediation workflows.",
  },
  {
    step: "04",
    title: "Scale",
    description:
      "Expand automation across 100+ operating systems and cloud platforms. Handle growing infrastructure demands without additional headcount.",
  },
];

const benefits = [
  "Reduce downtime by up to 50% with automated patch and vulnerability management",
  "Support for 100+ operating systems across on-premises and cloud environments",
  "Automated security enforcement across Microsoft 365, AWS, Google Cloud, and more",
  "Full audit trail with timestamps, inputs, and outputs for compliance",
  "AI-powered prioritization ensures critical vulnerabilities are remediated first",
  "Intelligent exception handling with smart routing and escalation",
];

export default function AutomationSuitePage() {
  return (
    <SolutionPageLayout
      metricsPreset="automation-suite"
      title='Enterprise <span class="gradient-text">Automation Suite</span>'
      subtitle="AI-powered automation for patch management, vulnerability remediation, endpoint security, and cloud gateway protection. Reduce downtime by up to 50% and automate operations across 100+ operating systems and cloud platforms."
      categoryBadge={{ label: "Intelligent Automation", icon: <Workflow className="h-3.5 w-3.5 text-sky-400" /> }}
      heroVisualization={<AutomationSuiteHero />}
      features={features}
      process={process}
      benefits={benefits}
      ctaTitle='Ready to Automate Your <span class="gradient-text">Operations?</span>'
      ctaSubtitle="See how the ICE Automation Suite can eliminate manual work and accelerate your business processes. Schedule a personalized demo with our automation engineers."
      ctaButtonLabel="Schedule a Demo"
      breadcrumbLabel="Automation Suite"
    />
  );
}
