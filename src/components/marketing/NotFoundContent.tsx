import { Button } from "@/components/base/buttons/button";
import { BackgroundPattern } from "@/components/shared-assets/background-patterns";

export interface NotFoundContentCopy {
  eyebrow?: string;
  status_code?: string;
  headline?: string;
  description?: string;
  primary_cta?: { label: string; href: string };
  secondary_cta?: { label: string; href: string };
}

const DEFAULT_NOT_FOUND_CONTENT = {
  eyebrow: "Page not found",
  status_code: "404",
  headline: "We couldn't find that page",
  description: "Sorry, the page you're looking for doesn't exist or has been moved. Check the URL, or head back to explore our solutions.",
  primary_cta: { label: "Go home", href: "/" },
  secondary_cta: { label: "View solutions", href: "/solutions" },
};

/**
 * Shared 404 content — used by both root and `(public)` not-found routes.
 * Keep chrome (Navbar/Footer) in the parent that needs it.
 */
export default function NotFoundContent({
  /** Use full viewport height when this is the only page chrome. */
  fullHeight = false,
  content,
}: {
  fullHeight?: boolean;
  content?: NotFoundContentCopy;
}) {
  const stringOr = (value: unknown, fallback: string) =>
    typeof value === "string" ? value : fallback;
  const copy = {
    eyebrow: stringOr(content?.eyebrow, DEFAULT_NOT_FOUND_CONTENT.eyebrow),
    status_code: stringOr(content?.status_code, DEFAULT_NOT_FOUND_CONTENT.status_code),
    headline: stringOr(content?.headline, DEFAULT_NOT_FOUND_CONTENT.headline),
    description: stringOr(content?.description, DEFAULT_NOT_FOUND_CONTENT.description),
    primary_cta: {
      label: stringOr(content?.primary_cta?.label, DEFAULT_NOT_FOUND_CONTENT.primary_cta.label),
      href: stringOr(content?.primary_cta?.href, DEFAULT_NOT_FOUND_CONTENT.primary_cta.href),
    },
    secondary_cta: {
      label: stringOr(content?.secondary_cta?.label, DEFAULT_NOT_FOUND_CONTENT.secondary_cta.label),
      href: stringOr(content?.secondary_cta?.href, DEFAULT_NOT_FOUND_CONTENT.secondary_cta.href),
    },
  };
  return (
    <>
      <style>{`
        @keyframes nf-rise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: no-preference) {
          .nf-rise { animation: nf-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
          .nf-d1 { animation-delay: 0.08s; }
          .nf-d2 { animation-delay: 0.16s; }
          .nf-d3 { animation-delay: 0.24s; }
        }
      `}</style>

      <main
        className={
          fullHeight
            ? "relative flex min-h-[calc(100svh-12rem)] items-center justify-center overflow-hidden bg-primary py-16 md:py-24"
            : "relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-primary py-16 md:py-24"
        }
      >
        <BackgroundPattern
          pattern="grid"
          size="lg"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />

        <div className="relative mx-auto w-full max-w-container px-4 md:px-8">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <span className="nf-rise text-xs font-medium tracking-[0.2em] text-brand-secondary uppercase">
              {copy.eyebrow}
            </span>

            <span
              aria-hidden="true"
              className="nf-rise nf-d1 mt-4 bg-gradient-to-b from-brand-500 to-brand-800 bg-clip-text text-display-2xl font-semibold text-transparent md:text-[9rem] md:leading-none dark:from-brand-300 dark:to-brand-600 dark:drop-shadow-[0_0_40px_rgb(4_155_251/0.25)]"
            >
              {copy.status_code}
            </span>

            <h1 className="nf-rise nf-d2 mt-4 text-display-sm font-semibold text-primary md:text-display-md">
              {copy.headline}
            </h1>
            <p className="nf-rise nf-d2 mt-4 max-w-xl text-lg text-tertiary md:mt-5 md:text-xl">
              {copy.description}
            </p>

            <div className="nf-rise nf-d3 mt-8 flex flex-col-reverse gap-3 self-stretch sm:flex-row sm:justify-center sm:self-center md:mt-12">
              <Button color="secondary" size="xl" href={copy.secondary_cta.href}>
                {copy.secondary_cta.label}
              </Button>
              <Button size="xl" href={copy.primary_cta.href}>
                {copy.primary_cta.label}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
