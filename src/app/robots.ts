import type { MetadataRoute } from "next";
import { getSeoConfig } from "@/lib/seo/config";

/** AI agents that fetch pages live to answer a user query — always allowed. */
const LIVE_RETRIEVAL_AGENTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Googlebot",
  "Bingbot",
];

/** Bots that crawl to build model-training corpora — blocked when opted out. */
const TRAINING_SCRAPERS = [
  "GPTBot",
  "ClaudeBot",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "FacebookBot",
  "Meta-ExternalAgent",
];

const DISALLOW_PATHS = ["/admin/", "/api/", "/portal/", "/login", "/access/"];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const cfg = await getSeoConfig();

  const rules: MetadataRoute.Robots["rules"] = [
    {
      userAgent: "*",
      allow: "/",
      disallow: DISALLOW_PATHS,
    },
  ];

  if (cfg.blockTrainingScrapers) {
    // Keep live-retrieval search/answer agents crawling normally...
    rules.push({
      userAgent: LIVE_RETRIEVAL_AGENTS,
      allow: "/",
      disallow: DISALLOW_PATHS,
    });
    // ...but shut out training-corpus scrapers entirely.
    rules.push({
      userAgent: TRAINING_SCRAPERS,
      disallow: "/",
    });
  }

  return {
    rules,
    sitemap: `${cfg.siteUrl}/sitemap.xml`,
  };
}
