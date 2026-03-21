import { getPageContent } from "@/lib/cms";
import SmsConsentClient from "./Client";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent("sms-consent");
  return {
    title: page?.meta_title ?? page?.title ?? "SMS Consent | ICE",
    description: page?.meta_description ?? "SMS opt-in and opt-out policy.",
  };
}

export default async function SmsConsentPage() {
  const page = await getPageContent("sms-consent");
  return <SmsConsentClient cmsData={page?.sections} />;
}
