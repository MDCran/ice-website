import type { Metadata } from "next";
import { getPageContent, type PageWithSections } from "@/lib/cms";
import { isCmsSectionVisible } from "@/lib/cms/sectionManifest";
import {
  MARKETING_PREFERENCE_KEYS,
  MARKETING_PREFERENCE_LABELS,
} from "@/lib/marketing/preferences";
import { buildPageMetadata } from "@/lib/seo/pageMetadata";
import PreferenceCenterClient, {
  type PreferenceCenterCopy,
  type PreferenceCenterMessageCopy,
  type PreferenceCenterSuccessCopy,
} from "./PreferenceCenterClient";

const PAGE_SLUG = "subscribe";

const DEFAULT_CENTER: PreferenceCenterCopy = {
  eyebrow: "ICE communications",
  headline: "Manage email preferences",
  description: "Update your details and choose which types of messages you want to receive.",
  loading_label: "Loading your preferences…",
  error_heading: "Email preferences",
  fields: { name_label: "Name", email_label: "Email", phone_label: "Phone number" },
  preference_heading: "Message types",
  preference_types: MARKETING_PREFERENCE_KEYS.map((key) => ({ key, ...MARKETING_PREFERENCE_LABELS[key] })),
  save_label: "Save preferences",
  unsubscribe_all_label: "Unsubscribe from all",
  return_label: "Return to ICE",
  return_href: "/",
};

const DEFAULT_SUCCESS: PreferenceCenterSuccessCopy = {
  headline: "Preferences updated",
  description: "Your choices are saved. Messages will follow the categories you selected.",
};

const DEFAULT_MESSAGES: PreferenceCenterMessageCopy = {
  expired_error: "This preference link is no longer available.",
  load_error: "We could not load your preferences.",
  update_error: "We could not update your preferences.",
  network_error: "We could not update your preferences.",
};

function hasSection(page: PageWithSections | null, key: string): boolean {
  return page?.orderedSections.some((section) => section.section_key === key) ?? false;
}

function sectionContent<T>(page: PageWithSections | null, key: string, fallback: T): T {
  if (!hasSection(page, key)) return fallback;
  return (page?.sections[key] ?? {}) as T;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent(PAGE_SLUG);
  return buildPageMetadata(page, {
    fallbackTitle: "Manage email preferences | International Computer Exchange",
    fallbackDescription: "Update your International Computer Exchange email preferences.",
    defaultPath: "/subscribe",
  });
}

export default async function UnsubscribePage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, page] = await Promise.all([params, getPageContent(PAGE_SLUG)]);
  const content = sectionContent(page, "preference_center", DEFAULT_CENTER);
  const successCopy = sectionContent(page, "preference_center_success", DEFAULT_SUCCESS);
  const messages = sectionContent(page, "preference_center_messages", DEFAULT_MESSAGES);

  return (
    <PreferenceCenterClient
      id={id}
      content={isCmsSectionVisible(page?.orderedSections, "preference_center") ? content : null}
      successCopy={isCmsSectionVisible(page?.orderedSections, "preference_center_success") ? successCopy : null}
      messages={isCmsSectionVisible(page?.orderedSections, "preference_center_messages") ? messages : null}
    />
  );
}
