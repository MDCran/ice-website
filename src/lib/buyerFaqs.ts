export const BUYER_FAQS = [
  {
    id: "response",
    question: "How quickly will ICE respond to a new inquiry?",
    answer: "The typical response time is within one business day. Active incidents and urgent recovery requests are prioritized.",
  },
  {
    id: "ibmi",
    question: "Does ICE support IBM i and AS/400 environments?",
    answer: "Yes. ICE supports IBM i and IBM Power across hosting, security, backup, disaster recovery, high availability, migration, and managed operations.",
  },
  {
    id: "rpo-rto",
    question: "What RPO and RTO targets can ICE support?",
    answer: "Targets range from near-zero data loss and sub-hour recovery for suitable workloads to daily backup policies. Final commitments follow discovery, design, and testing.",
  },
  {
    id: "cloud",
    question: "Can ICE manage hybrid and Azure environments?",
    answer: "Yes. ICE manages mixed environments spanning on-premises infrastructure, private cloud, Microsoft Azure, IBM Power, and hosted platforms.",
  },
  {
    id: "security",
    question: "Does ICE provide 24/7 security and infrastructure monitoring?",
    answer: "Managed offerings can include 24/7/365 monitoring, alert triage, escalation, and coordinated response through US-based operations.",
  },
  {
    id: "dr-tests",
    question: "Are disaster recovery tests included?",
    answer: "Testing cadence and scope are defined in the service design. ICE emphasizes documented runbooks, recovery exercises, and validation against agreed targets.",
  },
  {
    id: "industries",
    question: "Which industries does ICE work with?",
    answer: "ICE commonly supports manufacturing, financial services, healthcare, insurance, legal, distribution, and other infrastructure-dependent organizations.",
  },
  {
    id: "start",
    question: "What information should I bring to the first call?",
    answer: "A rough platform inventory, business priorities, pain points, compliance needs, and desired timeline are enough to begin. ICE can help structure the deeper discovery.",
  },
];

export function getBuyerFaqAnchor(id: string) {
  return `faq-${id}`;
}

export function getBuyerFaqHref(id: string) {
  return `/faq#${getBuyerFaqAnchor(id)}`;
}
