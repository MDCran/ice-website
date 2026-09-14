import Link from "next/link";

/**
 * Required disclosure for website SMS opt-in controls. Keep this next to the
 * unchecked checkbox instead of treating entry of a phone number as consent.
 */
export function SmsConsentDisclosure() {
  return (
    <>
      By checking this optional box, you agree to receive text messages from
      International Computer Exchange about conversations, service and support,
      appointments or account updates, and promotions. Message frequency varies.
      Message and data rates may apply. Reply STOP to opt out or HELP for help.
      Reply START to opt back in after opting out. Consent is not a condition of
      purchase. See our {" "}
      <Link
        href="/privacy-policy"
        className="text-brand-secondary underline underline-offset-2 hover:text-brand-secondary_hover"
      >
        Privacy Policy
      </Link>{" "}
      and {" "}
      <Link
        href="/terms-of-service"
        className="text-brand-secondary underline underline-offset-2 hover:text-brand-secondary_hover"
      >
        Terms of Service
      </Link>
      .
    </>
  );
}
