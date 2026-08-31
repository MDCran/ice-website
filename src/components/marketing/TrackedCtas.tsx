"use client";

import Link from "next/link";
import { Phone01, MessageChatCircle } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { pushEvent } from "@/lib/analytics";
import { cx } from "@/utils/cx";

const DEFAULT_PHONE = "1-800-786-9188";
const DEFAULT_TEL = "tel:18007869188";
function digitsOnly(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

/**
 * Tracked phone / SMS CTAs (#26) — fires analytics before navigation.
 */
export function TrackedTelLink({
  href = DEFAULT_TEL,
  label = DEFAULT_PHONE,
  className,
  children,
  location = "unknown",
}: {
  href?: string;
  label?: string;
  className?: string;
  children?: React.ReactNode;
  location?: string;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => pushEvent("phone_cta_clicked", { location, href })}
    >
      {children ?? label}
    </a>
  );
}

export function PhoneSmsCtaGroup({
  phone = DEFAULT_PHONE,
  callLabel,
  textLabel = "Text us",
  location = "contact",
  className,
  showSms = true,
}: {
  phone?: string;
  callLabel?: string;
  textLabel?: string;
  location?: string;
  className?: string;
  showSms?: boolean;
}) {
  const digits = digitsOnly(phone);
  const telHref = `tel:${digits}`;
  const smsHref = `sms:${digits}`;

  return (
    <div className={cx("flex flex-col gap-2 sm:flex-row", className)}>
      <Button
        size="lg"
        href={telHref}
        iconLeading={Phone01}
        className="justify-center"
        onClick={() => pushEvent("phone_cta_clicked", { location, channel: "voice" })}
      >
        {callLabel ?? `Call ${phone}`}
      </Button>
      {showSms && (
        <Button
          size="lg"
          color="secondary"
          href={smsHref}
          iconLeading={MessageChatCircle}
          className="justify-center"
          onClick={() => pushEvent("phone_cta_clicked", { location, channel: "sms" })}
        >
          {textLabel}
        </Button>
      )}
    </div>
  );
}

export function ConsultationCta({
  href = "/contact",
  label = "Speak to an Expert",
  location = "unknown",
  className,
  size = "xl" as const,
}: {
  href?: string;
  label?: string;
  location?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return (
    <Button
      size={size}
      href={href}
      className={className}
      onClick={() => pushEvent("consultation_cta_clicked", { location, href })}
    >
      {label}
    </Button>
  );
}

/** Footer helper — keep Link typing happy for tracked internal CTAs. */
export function TrackedInternalCta({
  href,
  children,
  location,
  className,
}: {
  href: string;
  children: React.ReactNode;
  location: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => pushEvent("consultation_cta_clicked", { location, href })}
    >
      {children}
    </Link>
  );
}
