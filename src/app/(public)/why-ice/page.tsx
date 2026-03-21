import { getPageContent } from "@/lib/cms";
import WhyICEClient from "./Client";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent("why-ice");
  return {
    title: page?.meta_title ?? page?.title ?? "Why ICE | International Computer Exchange",
    description: page?.meta_description ?? "Discover why businesses trust ICE.",
  };
}

export default async function WhyICEPage() {
  const page = await getPageContent("why-ice");
  return <WhyICEClient cmsData={page?.sections} />;
}
