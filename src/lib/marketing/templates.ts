export type EmailBlockType = "hero" | "text" | "button" | "service" | "notice" | "metric" | "divider" | "spacer";

export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  heading?: string;
  body?: string;
  label?: string;
  href?: string;
  eyebrow?: string;
  value?: string;
  tone?: "brand" | "neutral" | "warning" | "success";
}

export interface MarketingTemplatePreset {
  id: string;
  name: string;
  category: "services" | "billing" | "messages" | "maintenance" | "holidays";
  description: string;
  subject: string;
  preheader: string;
  blocks: EmailBlock[];
  transactional?: boolean;
}

const block = (id: string, type: EmailBlockType, values: Omit<EmailBlock, "id" | "type"> = {}): EmailBlock => ({ id, type, ...values });

function serviceTemplate(id: string, name: string, outcome: string, detail: string): MarketingTemplatePreset {
  return {
    id,
    name,
    category: "services",
    description: `Promote ${name} with an outcome-first message.`,
    subject: `${outcome} with ICE ${name}`,
    preheader: detail,
    blocks: [
      block(`${id}-hero`, "hero", { eyebrow: "ICE SOLUTIONS", heading: outcome, body: detail }),
      block(`${id}-service`, "service", { heading: name, body: "Engineer-led planning, implementation, validation, and ongoing support from International Computer Exchange." }),
      block(`${id}-button`, "button", { label: `Explore ${name}`, href: `https://www.icesales.com/solutions/${id}` }),
    ],
  };
}

function holidayTemplate(id: string, name: string, message: string): MarketingTemplatePreset {
  return {
    id: `holiday-${id}`,
    name,
    category: "holidays",
    description: `Respectful ${name} customer message.`,
    subject: `${name} wishes from International Computer Exchange`,
    preheader: message,
    blocks: [
      block(`${id}-hero`, "hero", { eyebrow: "A MESSAGE FROM ICE", heading: name, body: message }),
      block(`${id}-text`, "text", { body: "Thank you for the trust you place in our team. We appreciate the opportunity to support your business and technology." }),
      block(`${id}-button`, "button", { label: "Visit ICE", href: "https://www.icesales.com" }),
    ],
  };
}

export const MARKETING_TEMPLATE_PRESETS: MarketingTemplatePreset[] = [
  serviceTemplate("managed-cloud-hosting", "Managed Cloud Hosting", "Run critical workloads without adding operational burden", "24/7 operations for IBM Power, Windows, Linux, and hybrid estates."),
  serviceTemplate("managed-private-cloud", "Managed Private Cloud", "Gain dedicated control without managing every layer", "Private infrastructure, predictable performance, and compliance-ready controls."),
  serviceTemplate("managed-hybrid-cloud", "Managed Hybrid Cloud", "Operate cloud and on-prem systems as one environment", "Connect legacy platforms, private infrastructure, and public cloud with one operating model."),
  serviceTemplate("cloud-migration", "Cloud Migration", "Move workloads with a controlled cutover plan", "Discovery, dependency mapping, migration sequencing, and validation from ICE engineers."),
  serviceTemplate("disaster-recovery", "Disaster Recovery", "Recover operations on a business-defined timeline", "Translate recovery priorities into tested RPO, RTO, failover, and ownership plans."),
  serviceTemplate("managed-backup", "Managed Backup", "Know your data can be restored before an incident", "Managed backups, retention, monitoring, and recovery validation."),
  serviceTemplate("high-availability", "High Availability", "Reduce disruption for always-on workloads", "Architecture and operations designed around fast failover and workload continuity."),
  serviceTemplate("ransomware-recovery", "Ransomware Recovery", "Create a clean recovery path before an attack", "Immutable protection, recovery isolation, validation, and incident-ready runbooks."),
  serviceTemplate("cybersecurity", "Cybersecurity Services", "Improve visibility across users, systems, and endpoints", "Practical monitoring, hardening, detection, and response support."),
  serviceTemplate("ibm-i-services", "IBM i Services", "Modernize IBM i without losing operational stability", "Hosting, support, security, backup, HA, DR, and modernization planning."),
  serviceTemplate("ibm-power-vs", "IBM Power Virtual Server", "Extend IBM Power workloads into cloud capacity", "PowerVS planning, connectivity, migration, licensing, and managed operations."),
  serviceTemplate("microsoft-services", "Microsoft and Azure Services", "Simplify Microsoft cloud and infrastructure operations", "Azure, Microsoft 365, identity, Windows Server, migration, and managed support."),
  {
    id: "invoice-available", name: "Balance due notice", category: "billing", transactional: true,
    description: "Notify a client that their QuickBooks balance is ready to pay. Add the QuickBooks payment link to the button.", subject: "Your ICE account balance is ready", preheader: "Your current ICE account balance and payment options.",
    blocks: [block("balance-hero", "hero", { eyebrow: "ACCOUNT NOTICE", heading: "Your account balance is ready", body: "Hello {{first_name}}, your current balance due is {{amount_due}}." }), block("balance-notice", "notice", { heading: "Payment options", body: "Review your account balance and use the secure QuickBooks payment link provided by ICE.", tone: "neutral" }), block("balance-button", "button", { label: "Pay your balance", href: "https://quickbooks.intuit.com" })],
  },
  {
    id: "payment-due", name: "Balance due reminder", category: "billing", transactional: true,
    description: "Friendly reminder for an outstanding QuickBooks balance.", subject: "Friendly reminder: balance due", preheader: "A friendly payment reminder from ICE.",
    blocks: [block("due-hero", "hero", { eyebrow: "PAYMENT REMINDER", heading: "A friendly balance reminder", body: "Hello {{first_name}}, this is a friendly reminder that your current balance due is {{amount_due}}." }), block("due-button", "button", { label: "Pay your balance", href: "https://quickbooks.intuit.com" })],
  },
  {
    id: "payment-overdue", name: "Balance overdue", category: "billing", transactional: true,
    description: "Clear, professional notice for an overdue QuickBooks balance.", subject: "Action requested: balance overdue", preheader: "Please review your outstanding ICE balance.",
    blocks: [block("overdue-hero", "hero", { eyebrow: "ACCOUNT ACTION", heading: "Your balance needs attention", body: "Your account balance of {{amount_due}} is overdue." }), block("overdue-notice", "notice", { heading: "Need help?", body: "If payment has already been sent or you need assistance, reply to this email and our team will help.", tone: "warning" }), block("overdue-button", "button", { label: "Pay your balance", href: "https://quickbooks.intuit.com" })],
  },
  {
    id: "payment-received", name: "Payment received", category: "billing", transactional: true,
    description: "Payment confirmation and thank-you for a QuickBooks payment.", subject: "Payment received — thank you", preheader: "Thank you—your payment has been recorded.",
    blocks: [block("paid-hero", "hero", { eyebrow: "PAYMENT CONFIRMATION", heading: "Thank you—payment received", body: "We received your payment of {{amount_paid}}. Thank you for taking care of your ICE account." }), block("paid-notice", "notice", { heading: "Payment recorded", body: "No further action is required. Reply to this email if you need a receipt or account assistance.", tone: "success" }), block("paid-button", "button", { label: "Open client portal", href: "{{portal_url}}" })],
  },
  {
    id: "special-message", name: "Special company message", category: "messages",
    description: "Flexible executive or company announcement.", subject: "A message from International Computer Exchange", preheader: "An update for our customers and partners.",
    blocks: [block("special-hero", "hero", { eyebrow: "COMPANY UPDATE", heading: "A message from ICE", body: "Hello {{first_name}}, we wanted to share an important update with you." }), block("special-text", "text", { body: "Add the complete message here. Keep the most important information first, explain what changes, and state whether the recipient needs to act." }), block("special-button", "button", { label: "Learn more", href: "https://www.icesales.com" })],
  },
  {
    id: "customer-newsletter", name: "Customer newsletter", category: "messages",
    description: "Monthly or quarterly customer update.", subject: "The latest from ICE: {{month}}", preheader: "Service updates, practical guidance, and resources.",
    blocks: [block("news-hero", "hero", { eyebrow: "ICE CUSTOMER UPDATE", heading: "What’s new this {{month}}", body: "Practical infrastructure guidance, service news, and resources for your team." }), block("news-service", "service", { heading: "Featured insight", body: "Add the lead story, customer resource, or service update here." }), block("news-button", "button", { label: "Read the update", href: "https://www.icesales.com/resources" })],
  },
  {
    id: "scheduled-maintenance", name: "Scheduled maintenance", category: "maintenance", transactional: true,
    description: "Advance notice with time, scope, and impact.", subject: "Scheduled maintenance: {{maintenance_date}}", preheader: "Maintenance window, expected impact, and support details.",
    blocks: [block("maint-hero", "hero", { eyebrow: "SERVICE NOTICE", heading: "Scheduled maintenance", body: "ICE will perform maintenance on {{service_name}} during the window below." }), block("maint-notice", "notice", { heading: "{{maintenance_date}} · {{maintenance_window}}", body: "Expected impact: {{expected_impact}}. No action is required unless noted below.", tone: "warning" }), block("maint-text", "text", { heading: "What to expect", body: "{{maintenance_details}}" })],
  },
  {
    id: "maintenance-reminder", name: "Maintenance reminder", category: "maintenance", transactional: true,
    description: "Short reminder before a maintenance window.", subject: "Reminder: maintenance begins {{maintenance_window}}", preheader: "A reminder about the upcoming ICE service window.",
    blocks: [block("reminder-hero", "hero", { eyebrow: "MAINTENANCE REMINDER", heading: "Maintenance begins soon", body: "The scheduled {{service_name}} maintenance window begins {{maintenance_window}}." }), block("reminder-notice", "notice", { heading: "Expected impact", body: "{{expected_impact}}", tone: "warning" })],
  },
  {
    id: "maintenance-complete", name: "Maintenance completed", category: "maintenance", transactional: true,
    description: "Confirm completion and service status.", subject: "Maintenance complete: {{service_name}}", preheader: "The scheduled work is complete.",
    blocks: [block("complete-hero", "hero", { eyebrow: "SERVICE UPDATE", heading: "Maintenance is complete", body: "The scheduled work for {{service_name}} has been completed." }), block("complete-notice", "notice", { heading: "Current status", body: "Services are operating normally. If you notice an issue, reply to this email or call 1-800-786-9188.", tone: "success" })],
  },
  {
    id: "security-advisory", name: "Security advisory", category: "maintenance", transactional: true,
    description: "Urgent but calm customer security notice.", subject: "Security advisory: {{advisory_title}}", preheader: "Important information and recommended action from ICE.",
    blocks: [block("security-hero", "hero", { eyebrow: "SECURITY ADVISORY", heading: "{{advisory_title}}", body: "ICE is sharing an important security update relevant to {{affected_systems}}." }), block("security-notice", "notice", { heading: "Recommended action", body: "{{recommended_action}}", tone: "warning" }), block("security-button", "button", { label: "Contact the security team", href: "https://www.icesales.com/contact" })],
  },
  holidayTemplate("new-year", "Happy New Year", "Wishing you and your team a healthy, successful year ahead."),
  holidayTemplate("mlk-day", "Martin Luther King Jr. Day", "Today we reflect on Dr. King’s legacy of service, leadership, and progress."),
  holidayTemplate("presidents-day", "Presidents Day", "Warm wishes from the International Computer Exchange team."),
  holidayTemplate("memorial-day", "Memorial Day", "ICE remembers and honors the service members who gave their lives in service to the United States."),
  holidayTemplate("juneteenth", "Juneteenth", "Today we recognize Juneteenth and reflect on its enduring significance in American history."),
  holidayTemplate("independence-day", "Independence Day", "Wishing you a safe and enjoyable Fourth of July."),
  holidayTemplate("labor-day", "Labor Day", "We appreciate the people whose work, skill, and dedication keep organizations moving forward."),
  holidayTemplate("indigenous-peoples-day", "Indigenous Peoples’ Day", "Today we recognize the histories, cultures, and contributions of Indigenous communities."),
  holidayTemplate("veterans-day", "Veterans Day", "With gratitude, ICE honors all who have served in the United States Armed Forces."),
  holidayTemplate("thanksgiving", "Happy Thanksgiving", "We are grateful for our customers, partners, and the trust you place in our team."),
  holidayTemplate("christmas", "Merry Christmas", "Wishing you and your family a peaceful and joyful Christmas."),
];

export function cloneTemplateBlocks(blocks: EmailBlock[]) {
  return blocks.map((item, index) => ({ ...item, id: `${item.type}-${Date.now()}-${index}` }));
}
