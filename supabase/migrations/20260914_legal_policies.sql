-- Publish CMS-managed legal records. This intentionally replaces the prior
-- placeholder legal copy with the disclosure used by the website opt-in flow.

insert into public.pages (slug, title, meta_title, meta_description, page_type, is_published, sort_order)
values
  ('privacy-policy', 'Privacy Policy', 'Privacy Policy | ICE', 'How International Computer Exchange collects, uses, and protects personal information and SMS opt-in records.', 'legal', true, 49),
  ('terms-of-service', 'Terms of Service', 'Terms of Service | ICE', 'Terms and conditions governing use of the International Computer Exchange website and services.', 'legal', true, 50),
  ('sms-consent', 'SMS Consent', 'SMS Consent | ICE', 'SMS opt-in and opt-out policy for International Computer Exchange text-message communications.', 'legal', true, 51)
on conflict (slug) do update set
  title = excluded.title,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  page_type = excluded.page_type,
  is_published = excluded.is_published,
  sort_order = excluded.sort_order,
  updated_at = now();

delete from public.page_sections as section
using public.pages as page
where section.page_id = page.id
  and page.slug in ('privacy-policy', 'terms-of-service', 'sms-consent')
  and section.section_key in ('hero', 'sections');

with legal_pages as (
  select id, slug
  from public.pages
  where slug in ('privacy-policy', 'terms-of-service', 'sms-consent')
)
insert into public.page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
select id, 'hero', 'hero',
  case slug
    when 'privacy-policy' then jsonb_build_object(
      'eyebrow', 'Legal · Privacy',
      'headline', 'Privacy Policy',
      'subheadline', 'How International Computer Exchange collects, uses, and protects information.',
      'last_updated', 'September 14, 2026',
      'badge_note', 'Applies to icesales.com',
      'document_title', 'Privacy Policy',
      'document_intro', 'This Privacy Policy explains how International Computer Exchange, Inc. ("ICE", "we", "us", or "our") handles personal information collected through icesales.com, SMS communications, and related services.',
      'related_label', 'SMS Consent Policy',
      'related_href', '/sms-consent'
    )
    when 'terms-of-service' then jsonb_build_object(
      'eyebrow', 'Legal · Website Terms',
      'headline', 'Terms of Service',
      'subheadline', 'Please read these terms and conditions carefully before using the International Computer Exchange, Inc. website.',
      'last_updated', 'September 14, 2026',
      'badge_note', 'Applies to icesales.com',
      'document_title', 'Terms of Service & Conditions',
      'document_intro', 'These Terms govern your access to and use of the International Computer Exchange, Inc. website. By using the site, you agree to be bound by the sections below.',
      'related_label', 'SMS Consent Policy',
      'related_href', '/sms-consent'
    )
    else jsonb_build_object(
      'eyebrow', 'Legal · Messaging Policy',
      'headline', 'SMS Consent',
      'subheadline', 'SMS / Text messaging – opt-in & opt-out policy.',
      'last_updated', 'September 14, 2026',
      'badge_note', 'Reply STOP to opt out at any time',
      'document_title', 'SMS / Text Messaging – Opt-In & Opt-Out',
      'document_intro', 'International Computer Exchange, Inc. ("ICE") may use SMS text messaging to communicate with people who have affirmatively opted in. This policy explains the program, your choices, and how to get help.',
      'related_label', 'Privacy Policy',
      'related_href', '/privacy-policy'
    )
  end,
  0,
  true
from legal_pages
union all
select id, 'sections', 'content',
  case slug
    when 'privacy-policy' then jsonb_build_object('items', jsonb_build_array(
      jsonb_build_object('id', 'information-we-collect', 'title', '1. Information We Collect', 'content', 'We collect personal and service-related information you provide directly, such as your name, business email address, phone number, SMS opt-in status, company, service interests, and messages when you contact us, request an assessment, subscribe, or otherwise communicate with us.\n\nWe may also collect information generated when you use the Site, including IP address, browser and device information, pages viewed, referring URL, approximate location derived from IP address, and cookie or similar-technology data.'),
      jsonb_build_object('id', 'how-we-collect-information', 'title', '2. How We Collect Information', 'content', 'We collect information when you sign up for services, subscribe to SMS messages, complete a website form, request a consultation, communicate with customer service, or provide information during service delivery.'),
      jsonb_build_object('id', 'how-we-use-information', 'title', '3. How We Use Information', 'content', 'We use information to provide, maintain, and improve our services; respond to inquiries; coordinate project and appointment scheduling; process transactions; provide service and account notices; improve the Site and our offerings; maintain security; meet legal obligations; and send communications you have requested or agreed to receive.\n\nWe do not use a phone number for promotional text messages merely because you submitted a form. Promotional SMS messages require the separate, optional SMS consent described on the form and in our SMS Consent Policy.'),
      jsonb_build_object('id', 'sms-privacy', 'title', '4. Mobile and SMS Privacy', 'content', 'No mobile opt-in or text message consent will be shared with third parties or affiliates for their marketing or promotional purposes.\n\nIf you opt in to SMS messages, we may retain your phone number, the date and method of consent, the form or source, the disclosure version, and message or opt-out records to operate the program, honor your choices, prevent abuse, and document consent. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.'),
      jsonb_build_object('id', 'how-we-share-information', 'title', '5. How We Share Information', 'content', 'We do not sell or share personal information with third parties for their marketing purposes. We do not share personal information without your consent except as required by law or with essential service providers that help us host the Site, operate customer relationship and communications systems, secure our systems, or deliver services on our behalf. Those providers may use information only to perform services for ICE and not for their own marketing.\n\nWe may also disclose information to protect rights, safety, or security, or in connection with a corporate transaction.'),
      jsonb_build_object('id', 'cookies-and-analytics', 'title', '6. Cookies and Analytics', 'content', 'We may use cookies and similar technologies to keep the Site functioning, understand how it is used, and improve performance. Your browser settings may allow you to limit or block cookies; some Site features may not work correctly if you do so.'),
      jsonb_build_object('id', 'retention-and-security', 'title', '7. Retention and Security', 'content', 'We retain personal information only as long as reasonably necessary for the purposes described here, including to provide services, maintain required records, resolve disputes, and meet legal obligations. We use reasonable administrative, technical, and organizational measures designed to protect information, but no internet transmission or storage system is completely secure.'),
      jsonb_build_object('id', 'your-choices', 'title', '8. Your Choices', 'content', 'You may request access to, correction of, or deletion of personal information, subject to applicable law and our legitimate business obligations. You can opt out of marketing emails using the unsubscribe link in the message. For text messages, reply STOP to any ICE message. To ask a privacy question or make a request, contact us using the details below.'),
      jsonb_build_object('id', 'children-and-links', 'title', '9. Children and Third-Party Links', 'content', 'The Site is not directed to children under 13, and we do not knowingly collect personal information from children under 13. The Site may link to third-party websites; their privacy practices are governed by their own policies, not this one.'),
      jsonb_build_object('id', 'updates-and-contact', 'title', '10. Updates and Contact', 'content', 'We may update this Privacy Policy from time to time. The updated version will be posted here with a revised effective date.\n\nInternational Computer Exchange, Inc.\nEmail: info@icesales.com\nPhone: 1-800-786-9188')
    ))
    when 'terms-of-service' then jsonb_build_object('items', jsonb_build_array(
      jsonb_build_object('id', 'acceptance', 'title', '1. Acceptance of Terms', 'content', 'By accessing, browsing, or using the International Computer Exchange, Inc. ("ICE," "we," "us," or "our") website located at icesales.com (the "Site"), you acknowledge that you have read, understood, and agree to be bound by these Website Terms and Conditions ("Terms"). If you do not agree to these Terms, you should not use or access the Site.\n\nWe reserve the right to change, modify, or update these Terms at any time without prior notice. Your continued use of the Site following the posting of any changes constitutes your acceptance of such changes.'),
      jsonb_build_object('id', 'use-of-site', 'title', '2. Use of the Site', 'content', 'You agree to use the Site only for lawful purposes and in accordance with these Terms. You must not misuse the Site, introduce harmful code, interfere with another user, impersonate another person or entity, or use automated means to copy or monitor the Site without ICE''s written permission.'),
      jsonb_build_object('id', 'intellectual-property', 'title', '3. Intellectual Property', 'content', 'The Site and its contents, features, and functionality are owned by ICE, its licensors, or other providers and are protected by applicable intellectual-property laws. These Terms permit personal, non-commercial use of the Site only; you may not reproduce, distribute, modify, or otherwise exploit Site materials without ICE''s prior written consent.'),
      jsonb_build_object('id', 'disclaimer-of-warranties', 'title', '4. Disclaimer of Warranties', 'content', 'THE SITE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. ICE DOES NOT WARRANT THAT THE SITE OR ITS CONTENT WILL BE ACCURATE, COMPLETE, SECURE, RELIABLE, ERROR-FREE, OR AVAILABLE AT ALL TIMES.'),
      jsonb_build_object('id', 'limitation-of-liability', 'title', '5. Limitation of Liability', 'content', 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, ICE AND ITS AFFILIATES, PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, AND DIRECTORS WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM OR RELATED TO THE SITE. THIS DOES NOT LIMIT LIABILITY THAT CANNOT BE EXCLUDED UNDER APPLICABLE LAW.'),
      jsonb_build_object('id', 'third-party-links', 'title', '6. Links to Third-Party Sites', 'content', 'The Site may link to third-party websites or resources for convenience. ICE does not control or endorse them and is not responsible for their content, practices, or availability. Your use of third-party sites is subject to their terms and policies.'),
      jsonb_build_object('id', 'sms-terms', 'title', '7. SMS Terms', 'content', 'If you separately and affirmatively opt in to receive text messages from ICE, you agree to receive conversational, service and support, project or appointment scheduling, account updates, and promotional messages at the mobile number you provide. Consent is not a condition of purchase. Message frequency varies, and message and data rates may apply.\n\nReply STOP to any ICE text message to opt out. You will receive the following confirmation: "International Computer Exchange: You will no longer receive messages from us. Reply START to opt back in." Reply HELP for help. You will receive: "International Computer Exchange: Reply STOP to cancel. For support, call 1-800-786-9188 or email info@icesales.com." Our SMS Consent Policy and Privacy Policy describe the program and how we handle information. You may opt in only through a method that clearly requests SMS consent; providing a phone number alone does not opt you in to marketing text messages.'),
      jsonb_build_object('id', 'changes-to-terms', 'title', '8. Changes to Terms', 'content', 'We may revise these Terms from time to time. Changes are effective when posted unless a later date is stated. Your continued use of the Site after the posting of revised Terms means that you accept the changes.'),
      jsonb_build_object('id', 'contact', 'title', '9. Contact', 'content', 'If you have questions about these Terms, contact International Computer Exchange, Inc. at info@icesales.com or 1-800-786-9188.')
    ))
    else jsonb_build_object('items', jsonb_build_array(
      jsonb_build_object('id', 'website-opt-in', 'title', '1. Website Opt-In', 'content', 'You opt in to SMS messages on our website only by selecting the separate, optional SMS consent checkbox beside the disclosure. Providing a phone number alone does not opt you in to promotional text messages. Consent is not a condition of purchase.\n\nBy selecting that checkbox, you acknowledge that you consent to receive text messages from International Computer Exchange, Inc. ("ICE") about conversations, service and support, project or appointment scheduling, account updates, and promotions at the number you provide; message frequency varies; message and data rates may apply; you can reply STOP to opt out; and you can reply HELP for help.'),
      jsonb_build_object('id', 'opting-out', 'title', '2. Opting Out', 'content', 'You can opt out of receiving SMS text messages from ICE at any time by replying STOP to any message, emailing info@icesales.com with the subject "SMS Opt-Out", or calling 1-800-786-9188. After opting out, you will receive this confirmation message: "International Computer Exchange: You will no longer receive messages from us. Reply START to opt back in."'),
      jsonb_build_object('id', 'help', 'title', '3. HELP and STOP Keyword Responses', 'content', 'HELP message: If you text HELP, you will receive: "International Computer Exchange: Reply STOP to cancel. For support, call 1-800-786-9188 or email info@icesales.com."\n\nSTOP message: If you text STOP, you will receive: "International Computer Exchange: You will no longer receive messages from us. Reply START to opt back in."\n\nYou can also contact us at info@icesales.com or 1-800-786-9188 for assistance.'),
      jsonb_build_object('id', 'frequency', 'title', '4. Message Frequency, Types, and Charges', 'content', 'Message frequency varies. You may receive responses to inquiries or support requests; service updates, project or appointment scheduling, or account notifications; promotional offers, product announcements, or newsletters; and follow-up communications related to ongoing projects. Standard message and data rates may apply. Carriers are not liable for delayed or undelivered messages.'),
      jsonb_build_object('id', 'consent-records', 'title', '5. Consent Records and Privacy', 'content', 'When you opt in through our website, ICE may retain your phone number, the date and method of consent, the form or source, the disclosure version, and message or opt-out records to operate the messaging program, honor your choices, and document consent.\n\nNo mobile opt-in or text message consent will be shared with third parties or affiliates for their marketing or promotional purposes. See our Privacy Policy at /privacy-policy for more detail.'),
      jsonb_build_object('id', 'program-availability', 'title', '6. Program Availability', 'content', 'ICE uses a communications provider, including RingCentral, to deliver messages. Delivery depends on carrier availability and other factors. We will register and operate messaging campaigns as required by applicable provider and carrier rules; registration or carrier approval is not represented by this policy alone.'),
      jsonb_build_object('id', 'questions', 'title', '7. Questions?', 'content', 'If you have questions about our SMS messaging practices, contact International Computer Exchange, Inc. at info@icesales.com or 1-800-786-9188.')
    ))
  end,
  1,
  true
from legal_pages;
