import Link from "next/link";

/**
 * Required disclosure for website SMS opt-in controls. Keep this next to the
 * unchecked checkbox instead of treating entry of a phone number as consent.
 */
export function SmsConsentDisclosure() {
  return (
    <>
      By checking this box, I consent to receive text messages related to
      Customer Care from International Computer Exchange, Inc. You can reply
      “STOP” at any time to opt out. Message and data rates may apply. Message
      frequency may vary. Text HELP to 1-800-786-9188 for assistance. For more
      information, please refer to our{" "}
      <Link
        href="/privacy-policy"
        className="text-brand-secondary underline underline-offset-2 hover:text-brand-secondary_hover"
      >
        Privacy Policy
      </Link>{" "}
      ,{" "}
      <Link
        href="/terms-of-service"
        className="text-brand-secondary underline underline-offset-2 hover:text-brand-secondary_hover"
      >
        SMS Terms &amp; Conditions
      </Link>
      {" "}and our{" "}
      <Link
        href="/sms-consent"
        className="text-brand-secondary underline underline-offset-2 hover:text-brand-secondary_hover"
      >
        SMS Consent Policy
      </Link>
      . This optional consent is only for SMS and is not required to submit the
      form.
    </>
  );
}
