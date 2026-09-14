"use client";

import LegalPolicyPage, { type LegalPolicyDefaults } from "../terms-of-service/Client";
import type { CMSRenderableSection } from "@/components/cms/GenericCMSSections";

export const PRIVACY_POLICY_DEFAULTS: LegalPolicyDefaults = {
  hero: {
    eyebrow: "Legal · Privacy",
    headline: "Privacy Policy",
    subheadline: "How International Computer Exchange collects, uses, and protects information.",
    last_updated: "September 14, 2026",
    badge_note: "Applies to icesales.com",
    document_title: "Privacy Policy",
    document_intro:
      "This Privacy Policy explains how International Computer Exchange, Inc. (\"ICE\", \"we\", \"us\", or \"our\") handles personal information collected through icesales.com, SMS communications, and related services.",
    related_label: "SMS Consent Policy",
    related_href: "/sms-consent",
  },
  sections: [
    {
      id: "information-we-collect",
      title: "1. Information We Collect",
      content: `We collect personal and service-related information you provide directly, such as your name, business email address, phone number, SMS opt-in status, company, service interests, and messages when you contact us, request an assessment, subscribe, or otherwise communicate with us.

We may also collect information generated when you use the Site, including IP address, browser and device information, pages viewed, referring URL, approximate location derived from IP address, and cookie or similar-technology data.`,
    },
    {
      id: "how-we-collect-information",
      title: "2. How We Collect Information",
      content: `We collect information when you sign up for services, subscribe to SMS messages, complete a website form, request a consultation, communicate with customer service, or provide information during service delivery.`,
    },
    {
      id: "how-we-use-information",
      title: "3. How We Use Information",
      content: `We use information to provide, maintain, and improve our services; respond to inquiries; coordinate project and appointment scheduling; process transactions; provide service and account notices; improve the Site and our offerings; maintain security; meet legal obligations; and send communications you have requested or agreed to receive.

We do not use a phone number for promotional text messages merely because you submitted a form. Promotional SMS messages require the separate, optional SMS consent described on the form and in our SMS Consent Policy.`,
    },
    {
      id: "sms-privacy",
      title: "4. Mobile and SMS Privacy",
      content: `No mobile opt-in or text message consent will be shared with third parties or affiliates for their marketing or promotional purposes.

If you opt in to SMS messages, we may retain your phone number, the date and method of consent, the form or source, the disclosure version, and message or opt-out records to operate the program, honor your choices, prevent abuse, and document consent. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.`,
    },
    {
      id: "how-we-share-information",
      title: "5. How We Share Information",
      content: `We do not sell or share personal information with third parties for their marketing purposes. We do not share personal information without your consent except as required by law or with essential service providers that help us host the Site, operate customer relationship and communications systems, secure our systems, or deliver services on our behalf. Those providers may use information only to perform services for ICE and not for their own marketing.

We may also disclose information when required by law, to protect rights, safety, or security, or in connection with a corporate transaction. We do not sell personal information.`,
    },
    {
      id: "cookies-and-analytics",
      title: "6. Cookies and Analytics",
      content: `We may use cookies and similar technologies to keep the Site functioning, understand how it is used, and improve performance. Your browser settings may allow you to limit or block cookies; some Site features may not work correctly if you do so.`,
    },
    {
      id: "retention-and-security",
      title: "7. Retention and Security",
      content: `We retain personal information only as long as reasonably necessary for the purposes described here, including to provide services, maintain required records, resolve disputes, and meet legal obligations. We use reasonable administrative, technical, and organizational measures designed to protect information, but no internet transmission or storage system is completely secure.`,
    },
    {
      id: "your-choices",
      title: "8. Your Choices",
      content: `You may request access to, correction of, or deletion of personal information, subject to applicable law and our legitimate business obligations. You can opt out of marketing emails using the unsubscribe link in the message. For text messages, reply STOP to any ICE message. To ask a privacy question or make a request, contact us using the details below.`,
    },
    {
      id: "children-and-links",
      title: "9. Children and Third-Party Links",
      content: `The Site is not directed to children under 13, and we do not knowingly collect personal information from children under 13. The Site may link to third-party websites; their privacy practices are governed by their own policies, not this one.`,
    },
    {
      id: "updates-and-contact",
      title: "10. Updates and Contact",
      content: `We may update this Privacy Policy from time to time. The updated version will be posted here with a revised effective date.

International Computer Exchange, Inc.
Email: info@icesales.com
Phone: 1-800-786-9188`,
    },
  ],
};

export default function PrivacyPolicyClient({
  cmsData,
  orderedSections,
}: {
  cmsData?: Record<string, unknown>;
  orderedSections?: CMSRenderableSection[];
}) {
  return (
    <LegalPolicyPage
      cmsData={cmsData}
      orderedSections={orderedSections}
      defaults={PRIVACY_POLICY_DEFAULTS}
    />
  );
}
