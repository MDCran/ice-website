export const MARKETING_PREFERENCE_KEYS = [
  "marketing_materials",
  "billing",
  "private_messages",
  "special_messages",
  "service_updates",
  "events",
] as const;

export type MarketingPreferenceKey = (typeof MARKETING_PREFERENCE_KEYS)[number];
export type MarketingPreferences = Record<MarketingPreferenceKey, boolean>;

export const DEFAULT_MARKETING_PREFERENCES: MarketingPreferences = {
  marketing_materials: true,
  billing: true,
  private_messages: true,
  special_messages: true,
  service_updates: true,
  events: true,
};

export const MARKETING_PREFERENCE_LABELS: Record<MarketingPreferenceKey, { label: string; description: string }> = {
  marketing_materials: { label: "Marketing materials", description: "Service news, practical guides, and offers from ICE." },
  billing: { label: "Billing and account messages", description: "Balance reminders, payment confirmations, and account notices." },
  private_messages: { label: "Private messages", description: "Direct messages intended for you or your organization." },
  special_messages: { label: "Special messages", description: "Occasional company updates, seasonal notes, and invitations." },
  service_updates: { label: "Service updates", description: "Maintenance, security, and operational notices for ICE services." },
  events: { label: "Events and webinars", description: "Invitations and follow-ups for ICE events and webinars." },
};

export function normalizeMarketingPreferences(value: unknown, fallback = DEFAULT_MARKETING_PREFERENCES): MarketingPreferences {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  return MARKETING_PREFERENCE_KEYS.reduce((result, key) => {
    result[key] = typeof input[key] === "boolean" ? input[key] as boolean : fallback[key];
    return result;
  }, {} as MarketingPreferences);
}

export function campaignPreferenceKey(campaignType: string): MarketingPreferenceKey | null {
  if (campaignType === "marketing") return "marketing_materials";
  if (campaignType === "billing" || campaignType === "transactional") return "billing";
  if (campaignType === "private_message") return "private_messages";
  if (campaignType === "special_message") return "special_messages";
  if (campaignType === "event") return "events";
  if (["service_update", "maintenance", "service_alert"].includes(campaignType)) return "service_updates";
  return null;
}

export function campaignTypeLabel(campaignType: string) {
  const labels: Record<string, string> = {
    marketing: "Marketing materials",
    billing: "Billing",
    transactional: "Transactional",
    private_message: "Private message",
    special_message: "Special message",
    event: "Event / webinar",
    service_update: "Service update",
    maintenance: "Maintenance",
    service_alert: "Service alert",
  };
  return labels[campaignType] ?? campaignType.replace(/_/g, " ");
}
