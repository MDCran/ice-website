import { getPageContent } from "@/lib/cms";
import ContactClient from "./Client";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent("contact");
  return {
    title: page?.meta_title ?? page?.title ?? "Contact Us | ICE",
    description: page?.meta_description ?? "Get in touch with our team.",
  };
}

export default async function ContactPage() {
  const page = await getPageContent("contact");
  return <ContactClient cmsData={page?.sections} />;
}
