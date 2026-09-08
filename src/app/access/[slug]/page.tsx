import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import AccessDocument from "@/components/access/AccessDocument";
import AccessPasswordGate from "@/components/access/AccessPasswordGate";
import AccessRequired from "@/components/access/AccessRequired";
import {
  accessChallengeCookieName,
  accessSessionCookieName,
} from "@/lib/access-pages/crypto";
import {
  getAccessPageBySlug,
  isValidAccessSlug,
  publicAccessSettings,
  validateChallenge,
  validateSession,
} from "@/lib/access-pages/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Protected Document | ICE",
  description: "Secure document access from International Computer Exchange.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  referrer: "no-referrer",
};

export default async function AccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ access?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const cleanSlug = slug.trim();
  if (!isValidAccessSlug(cleanSlug)) notFound();

  const page = await getAccessPageBySlug(cleanSlug);
  if (!page) notFound();

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(accessSessionCookieName(cleanSlug))?.value;
  const challengeCookie = cookieStore.get(accessChallengeCookieName(cleanSlug))?.value;
  let session: ReturnType<typeof validateSession> = null;
  let challenge: ReturnType<typeof validateChallenge> = null;
  try {
    session = validateSession(page, sessionCookie);
    if (!session) challenge = validateChallenge(page, challengeCookie);
  } catch {
    // Missing/invalid signing configuration fails closed without exposing data.
  }

  if (session) {
    const clientSettings = publicAccessSettings(page.settings);
    if (clientSettings.pdf_url.startsWith("private:")) {
      clientSettings.pdf_url = `/access/${encodeURIComponent(cleanSlug)}/download`;
    }
    return (
      <AccessDocument
        settings={clientSettings}
        sections={page.sections}
      />
    );
  }

  if (challenge) {
    return (
      <AccessPasswordGate
        slug={cleanSlug}
        documentTitle={page.settings.document_title || page.title}
        recipientHint={challenge.grant.recipient_hint}
      />
    );
  }

  return (
    <AccessRequired
      invalid={
        query.access === "invalid" ||
        page.settings.status !== "active" ||
        Boolean(sessionCookie || challengeCookie)
      }
    />
  );
}
