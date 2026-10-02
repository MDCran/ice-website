/**
 * Publish reviewed SMS disclosures to the three CMS legal pages and the
 * floating contact-widget copy. Dry-run by default; --apply performs writes.
 * Existing policy sections and navigation are preserved.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

nextEnv.loadEnvConfig(process.cwd());
const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const slugs = ["privacy-policy", "terms-of-service", "sms-consent"];
const { data: pages, error: pageError } = await client
  .from("pages").select("id,slug,title").in("slug", slugs);
if (pageError) throw pageError;
if (pages.length !== slugs.length) throw new Error("Expected all three published legal pages.");

const { data: sections, error: sectionError } = await client
  .from("page_sections").select("id,page_id,section_key,content,updated_at")
  .in("page_id", pages.map((page) => page.id));
if (sectionError) throw sectionError;
const pageBySlug = new Map(pages.map((page) => [page.slug, page]));
const findSection = (slug, key) => sections.find(
  (section) => section.page_id === pageBySlug.get(slug)?.id && section.section_key === key,
);

const changes = [
  {
    slug: "privacy-policy", key: "hero",
    patch: { last_updated: "October 1, 2026" },
  },
  {
    slug: "privacy-policy", key: "sections",
    patch: { items: { "sms-privacy": {
      content: `Mobile opt-in, SMS consent, and phone numbers collected for SMS communication purposes will not be shared with any third party or affiliates for marketing purposes. We do not share mobile opt-in or text message consent with any third party or affiliate for its own marketing or promotional purposes.\n\nIf you opt in to SMS messages, we may retain your phone number, the date and method of consent, the form or source, the disclosure version, and message or opt-out records to operate the program, honor your choices, prevent abuse, and document consent. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.`,
    } } },
  },
  {
    slug: "terms-of-service", key: "hero",
    patch: { last_updated: "October 1, 2026", headline: "Terms and Conditions", document_title: "Terms and Conditions" },
  },
  {
    slug: "terms-of-service", key: "sections",
    patch: { items: { "sms-terms": {
      content: `If you separately and affirmatively opt in using the optional SMS checkbox on our website, you agree to receive messages from International Computer Exchange, Inc. about your inquiry, service and support, project updates, and appointment scheduling. Submitting a phone number alone is not SMS consent. Consent is not a condition of purchase. Message frequency varies, and message and data rates may apply. This opt-in does not cover promotional messages.\n\nReply STOP to any ICE text message to opt out. Reply HELP for help. You can also contact us at 1-800-786-9188 or info@icesales.com. Rejoining after opting out requires a new affirmative opt-in. See our SMS Consent and Privacy Policy pages for details.`,
    } } },
  },
  {
    slug: "sms-consent", key: "hero",
    patch: { last_updated: "October 1, 2026" },
  },
  {
    slug: "sms-consent", key: "sections",
    patch: { items: {
      "website-opt-in": {
        title: "1. Website Opt-In",
        content: `You opt in to SMS messages on our website only by selecting the separate, optional SMS consent checkbox beside the disclosure. Providing a phone number alone does not opt you in to text messages. Consent is not a condition of purchase, and you can submit a form without checking the box.\n\nBy selecting that checkbox, you consent to receive SMS messages from International Computer Exchange, Inc. ("ICE") about your inquiry, service and support, project updates, and appointment scheduling at the number you provide. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. This opt-in does not cover promotional messages.`,
      },
      "opting-out": {
        content: `You can opt out of receiving SMS text messages from ICE at any time by replying STOP to any SMS message you receive from us, emailing info@icesales.com with the subject "SMS Opt-Out", or calling 1-800-786-9188 during business hours (9:00 AM – 5:00 PM ET).\n\nWe will stop sending SMS messages to that number after the opt-out is processed. To receive messages again, submit a new request and affirmatively select the SMS consent checkbox.`,
      },
      help: {
        title: "3. Help",
        content: `Reply HELP for assistance. You can also contact ICE at info@icesales.com or 1-800-786-9188. Reply STOP to opt out.`,
      },
      frequency: {
        content: `Message frequency varies. You may receive responses to your inquiries or support requests, project updates, appointment scheduling messages, and follow-up communications related to your inquiry or ongoing project. Standard message and data rates may apply. Carriers are not liable for delayed or undelivered messages.\n\nExample: “International Computer Exchange: We received your request and will follow up about your project. Reply STOP to opt out.”`,
      },
      "consent-records": {
        content: `When you opt in through our website, ICE may retain your phone number, the date and method of consent, the form or source, the disclosure version, and message or opt-out records to operate the messaging program, honor your choices, and document consent.\n\nMobile opt-in, SMS consent, and phone numbers collected for SMS communication purposes will not be shared with any third party or affiliates for marketing purposes. We do not share mobile opt-in or text message consent with any third party or affiliate for its own marketing or promotional purposes. Essential service providers may process information only on ICE's behalf to provide messaging and related services, not for their own marketing. See our Privacy Policy for more detail.`,
      },
      "program-availability": {
        content: `ICE may use communications providers to deliver messages. Delivery depends on provider, device, and carrier availability; delivery is not guaranteed. This website disclosure describes the SMS program but does not itself confirm carrier or campaign registration or approval.`,
      },
    } },
  },
];

const { data: widgetRows, error: widgetError } = await client
  .from("page_sections").select("id,page_id,content,updated_at")
  .eq("section_key", "contact_widget");
if (widgetError) throw widgetError;
if (widgetRows.length !== 1) throw new Error("Expected exactly one site-wide contact widget settings row.");

const before = [...sections, ...widgetRows];
const backupDir = `.vercel/sms-copy-backup-${new Date().toISOString().replace(/[:.]/g, "-")}`;
mkdirSync(backupDir, { recursive: true });
writeFileSync(`${backupDir}/before.json`, JSON.stringify({ pages, sections: before }, null, 2));

const apply = process.argv.includes("--apply");
console.log(`${apply ? "Publishing" : "DRY RUN"}: ${changes.length} policy sections and the site-wide SMS disclosure. Backup: ${backupDir}`);

for (const change of changes) {
  const row = findSection(change.slug, change.key);
  if (!row) throw new Error(`Missing ${change.slug}/${change.key}`);
  const next = structuredClone(row.content ?? {});
  if (change.key === "sections") {
    if (!Array.isArray(next.items)) throw new Error(`Unexpected section format for ${change.slug}`);
    for (const [id, itemPatch] of Object.entries(change.patch.items)) {
      const item = next.items.find((entry) => entry.id === id);
      if (!item) throw new Error(`Missing ${change.slug} policy section ${id}`);
      Object.assign(item, itemPatch);
    }
  } else {
    Object.assign(next, change.patch);
  }
  if (apply) {
    const { error } = await client.from("page_sections").update({ content: next })
      .eq("id", row.id).eq("updated_at", row.updated_at);
    if (error) throw new Error(`${change.slug}/${change.key}: ${error.message}`);
  }
}

const widget = widgetRows[0];
const nextWidget = {
  ...widget.content,
  sms_consent_aria_label: "Optional SMS consent",
  sms_consent_prefix: "By checking this optional box, you agree to receive SMS messages from International Computer Exchange, Inc. about your inquiry, service and support, project updates, and appointment scheduling. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is not a condition of purchase. See our ",
  sms_consent_link_label: "Privacy Policy",
  sms_consent_link_href: "/privacy-policy",
  sms_consent_suffix: " and our Terms and Conditions at /terms-of-service.",
};
if (apply) {
  const { error } = await client.from("page_sections").update({ content: nextWidget })
    .eq("id", widget.id).eq("updated_at", widget.updated_at);
  if (error) throw new Error(`contact widget: ${error.message}`);
  console.log("CMS policy copy and contact widget SMS disclosure are now published.");
}
