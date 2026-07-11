"use client";

import { AlertCircle } from "@untitledui/icons";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { cx } from "@/utils/cx";

/** Map raw auth provider messages to short, user-facing copy. */
export function formatAuthError(message: string): { title: string; description: string } {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("invalid_credentials")) {
    return {
      title: "Sign-in failed",
      description: "Email or password is incorrect. Please try again.",
    };
  }
  if (lower.includes("email not confirmed")) {
    return {
      title: "Email not confirmed",
      description: "Confirm your email address before signing in.",
    };
  }
  if (lower.includes("too many requests") || lower.includes("rate limit")) {
    return {
      title: "Too many attempts",
      description: "Please wait a moment, then try again.",
    };
  }
  if (lower.includes("admin access") || lower.includes("portal access")) {
    return {
      title: "Access denied",
      description: message,
    };
  }
  return {
    title: "Unable to sign in",
    description: message || "Something went wrong. Please try again.",
  };
}

export function LoginErrorAlert({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  const { title, description } = formatAuthError(message);

  return (
    <div
      role="alert"
      className={cx(
        "flex gap-3 rounded-xl bg-primary_alt p-4 ring-1 ring-error_subtle ring-inset",
        className,
      )}
    >
      <FeaturedIcon icon={AlertCircle} color="error" theme="light" size="md" className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-secondary">{title}</p>
        <p className="mt-0.5 text-sm text-tertiary">{description}</p>
      </div>
    </div>
  );
}
