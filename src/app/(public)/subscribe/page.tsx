import type { Metadata } from "next";
import { SubscriptionPreferenceForm } from "@/components/marketing/SubscriptionPreferenceForm";

export const metadata: Metadata = {
  title: "Subscribe and manage email preferences | International Computer Exchange",
  description: "Choose the International Computer Exchange messages you want to receive.",
};

export default function SubscribePage() {
  return <main className="min-h-[70vh] bg-secondary px-4 py-16 sm:py-24"><div className="mx-auto max-w-2xl"><SubscriptionPreferenceForm /></div></main>;
}
