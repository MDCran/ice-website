import Link from "next/link";

/**
 * Required disclosure for website SMS opt-in controls. Keep this next to the
 * unchecked checkbox instead of treating entry of a phone number as consent.
 */
export function SmsConsentDisclosure() {
  return (
    <>
      By checking this optional box, you agree to receive SMS messages from
      International Computer Exchange, Inc. about your inquiry, service and
      support, project updates, and appointment scheduling. You may reply STOP
      to opt out at any time. Reply HELP to 1-800-786-9188 for assistance.
      Message frequency varies. Message and data rates may apply. Consent is not
      a condition of purchase. Learn more in our{" "}
      <Link
        href="/privacy-policy"
        className="text-brand-secondary underline underline-offset-2 hover:text-brand-secondary_hover"
      >
        Privacy Policy
      </Link>{" "}
      and{" "}
      <Link
        href="/terms-of-service"
        className="text-brand-secondary underline underline-offset-2 hover:text-brand-secondary_hover"
      >
        Terms and Conditions
      </Link>
      .
    </>
  );
}
