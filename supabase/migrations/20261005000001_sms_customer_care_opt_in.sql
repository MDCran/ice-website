-- Store affirmative, SMS-only Customer Care consent separately from the
-- phone number and from email marketing preferences.

alter table public.callback_requests
  add column if not exists sms_consent boolean not null default false,
  add column if not exists sms_consent_at timestamptz,
  add column if not exists sms_consent_source text,
  add column if not exists sms_consent_ip text,
  add column if not exists sms_consent_user_agent text,
  add column if not exists sms_consent_disclosure_version text;

alter table public.marketing_contacts
  add column if not exists sms_consent boolean not null default false,
  add column if not exists sms_consent_at timestamptz,
  add column if not exists sms_consent_source text,
  add column if not exists sms_consent_ip text,
  add column if not exists sms_consent_user_agent text,
  add column if not exists sms_consent_disclosure_version text;

alter table public.subscribers
  add column if not exists sms_consent boolean not null default false,
  add column if not exists sms_consent_at timestamptz,
  add column if not exists sms_consent_source text,
  add column if not exists sms_consent_ip text,
  add column if not exists sms_consent_user_agent text,
  add column if not exists sms_consent_disclosure_version text;

create index if not exists callback_requests_sms_consent_audit_idx
  on public.callback_requests (sms_consent_at desc)
  where sms_consent = true;

create index if not exists marketing_contacts_sms_consent_audit_idx
  on public.marketing_contacts (sms_consent_at desc)
  where sms_consent = true;

create index if not exists subscribers_sms_consent_audit_idx
  on public.subscribers (sms_consent_at desc)
  where sms_consent = true;

comment on column public.callback_requests.sms_consent is
  'Explicit optional consent to SMS Customer Care messages; unrelated to email preferences.';
comment on column public.marketing_contacts.sms_consent is
  'Explicit optional consent to SMS Customer Care messages; unrelated to email preferences.';

-- Keep CMS-managed legal copy aligned with the consent shown on forms.
update public.page_sections as section
set content = jsonb_set(
  section.content,
  '{items}',
  (
    select jsonb_agg(
      case
        when item->>'id' = 'website-opt-in' then jsonb_set(
          item,
          '{content}',
          to_jsonb('You opt in to SMS Customer Care messages on our website only by selecting the separate, optional SMS consent checkbox beside the disclosure. Providing a phone number alone does not opt you in to text messages. You can submit a form without checking the box. By selecting that checkbox, you consent to receive text messages related to Customer Care from International Computer Exchange, Inc. at the number you provide. Message frequency may vary. Message and data rates may apply. Reply STOP to opt out or text HELP to 1-800-786-9188 for assistance. This consent is only for SMS Customer Care and does not enroll you in email or promotional marketing.'::text),
          true
        )
        when item->>'id' = 'frequency' then jsonb_set(
          item,
          '{content}',
          to_jsonb('Message frequency may vary. You may receive responses to Customer Care inquiries or support requests and follow-up related to service, project coordination, or appointment scheduling. Message and data rates may apply. Carriers are not liable for delayed or undelivered messages.'::text),
          true
        )
        else item
      end
      order by ordinal
    )
    from jsonb_array_elements(section.content->'items') with ordinality as elements(item, ordinal)
  ),
  true
)
from public.pages as page
where section.page_id = page.id
  and page.slug = 'sms-consent'
  and section.section_key = 'sections'
  and jsonb_typeof(section.content->'items') = 'array';

update public.page_sections as section
set content = jsonb_set(
  section.content,
  '{items}',
  (
    select jsonb_agg(
      case
        when item->>'id' = 'how-we-use-information' then jsonb_set(
          item,
          '{content}',
          to_jsonb('We use personal information to provide, maintain, and improve our services; respond to inquiries; coordinate projects and appointments; process transactions; provide service and account notices; improve the Site; maintain security; meet legal obligations; and send communications you have requested or agreed to receive. We do not send SMS merely because you submitted a form or provided a phone number. Customer Care text messages require separate, optional SMS consent; that consent is not email or promotional marketing consent.'::text),
          true
        )
        when item->>'id' = 'sms-privacy' then jsonb_set(
          item,
          '{content}',
          to_jsonb('Mobile opt-in, SMS consent, and phone numbers collected for SMS communication purposes will not be shared with any third party or affiliate for marketing purposes. If you opt in to SMS Customer Care messages, we may retain your phone number, the date and method of consent, the form or source, the disclosure version, and message or opt-out records to operate the program, honor your choices, prevent abuse, and document consent. Message frequency may vary. Message and data rates may apply. Reply STOP to opt out or text HELP for assistance.'::text),
          true
        )
        else item
      end
      order by ordinal
    )
    from jsonb_array_elements(section.content->'items') with ordinality as elements(item, ordinal)
  ),
  true
)
from public.pages as page
where section.page_id = page.id
  and page.slug = 'privacy-policy'
  and section.section_key = 'sections'
  and jsonb_typeof(section.content->'items') = 'array';

update public.page_sections as section
set content = jsonb_set(
  section.content,
  '{items}',
  (
    select jsonb_agg(
      case when item->>'id' = 'sms-terms' then jsonb_set(
        item,
        '{content}',
        to_jsonb('If you separately and affirmatively opt in using the optional SMS checkbox on our website, you consent to receive text messages related to Customer Care from International Computer Exchange, Inc. Submitting a phone number alone is not SMS consent. Message frequency may vary, and message and data rates may apply. This consent is only for SMS Customer Care and does not enroll you in email or promotional marketing. Reply STOP to any ICE text message to opt out. Text HELP for assistance, or contact us at 1-800-786-9188 or info@icesales.com. Rejoining after opting out requires a new affirmative opt-in. See our SMS Consent and Privacy Policy pages for details.'::text),
        true
      ) else item end
      order by ordinal
    )
    from jsonb_array_elements(section.content->'items') with ordinality as elements(item, ordinal)
  ),
  true
)
from public.pages as page
where section.page_id = page.id
  and page.slug = 'terms-of-service'
  and section.section_key = 'sections'
  and jsonb_typeof(section.content->'items') = 'array';
