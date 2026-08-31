import type { Metadata } from "next";
import { getPageContent, type PageWithSections } from "@/lib/cms";
import { isCmsSectionVisible } from "@/lib/cms/sectionManifest";
import {
  MARKETING_PREFERENCE_KEYS,
  MARKETING_PREFERENCE_LABELS,
} from "@/lib/marketing/preferences";
import { buildPageMetadata } from "@/lib/seo/pageMetadata";
import {
  SubscriptionPreferenceForm,
  type SubscribeConsentCopy,
  type SubscribeFormCopy,
  type SubscribeMessageCopy,
  type SubscribeSuccessCopy,
} from "./SubscriptionPreferenceForm";
import { notFound } from "next/navigation";

const PAGE_SLUG = "subscribe";

const FALLBACK_METADATA = {
  title: "Subscribe and manage email preferences | International Computer Exchange",
  description: "Choose the International Computer Exchange messages you want to receive.",
};

const DEFAULT_FORM: SubscribeFormCopy = {
  eyebrow: "ICE communications",
  headline: "Subscribe and manage email preferences",
  description:
    "Tell us where to reach you, then choose exactly which messages you want. You can unsubscribe from every category below.",
  fields: {
    name_label: "Name",
    email_label: "Email",
    phone_label: "Phone number",
  },
  preference_heading: "Choose your message types",
  preference_description:
    "Toggle any category on or off. Required account or security notices may still be sent when needed to provide a service.",
  preference_types: MARKETING_PREFERENCE_KEYS.map((key) => ({
    key,
    ...MARKETING_PREFERENCE_LABELS[key],
  })),
  submit_label: "Save my preferences",
};

const DEFAULT_SUCCESS: SubscribeSuccessCopy = {
  headline: "Your preferences are saved",
  description:
    "You can change these choices at any time. We will only send the types of messages you selected.",
  preference_link_label: "Open your preference center",
};

const DEFAULT_MESSAGES: SubscribeMessageCopy = {
  save_error: "We could not save your preferences.",
  network_error: "We could not save your preferences.",
};

const DEFAULT_CONSENT: SubscribeConsentCopy = {
  prefix: "By submitting, you consent to the selected communications.",
  privacy_label: "Read our privacy notice",
  privacy_href: "/privacy",
  suffix: ".",
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
  if (!page) notFound();
  return buildPageMetadata(page, {
    fallbackTitle: FALLBACK_METADATA.title,
    fallbackDescription: FALLBACK_METADATA.description,
    defaultPath: "/subscribe",
  });
}

export default async function SubscribePage() {
  const page = await getPageContent(PAGE_SLUG);
  const form = sectionContent(page, "form", DEFAULT_FORM);
  const success = sectionContent(page, "success", DEFAULT_SUCCESS);
  const messages = sectionContent(page, "messages", DEFAULT_MESSAGES);
  const consent = sectionContent(page, "consent", DEFAULT_CONSENT);

  return (
    <main className="min-h-[70vh] bg-secondary px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <SubscriptionPreferenceForm
          form={isCmsSectionVisible(page?.orderedSections, "form") ? form : null}
          successCopy={isCmsSectionVisible(page?.orderedSections, "success") ? success : null}
          messages={isCmsSectionVisible(page?.orderedSections, "messages") ? messages : null}
          consent={isCmsSectionVisible(page?.orderedSections, "consent") ? consent : null}
        />
      </div>
    </main>
  );
}
