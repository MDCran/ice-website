# ICE Website — Engineering & SEO/GEO Governance

International Computer Exchange (ICE) — enterprise IT managed services provider (IBM Business Partner since 1990), Boca Raton, FL. Next.js 16 App Router + Supabase CMS + Tailwind v4 + Untitled UI design system.

## Architecture ground rules
- UI: Untitled UI components only (`src/components/{base,application,marketing,foundations,shared-assets}`), semantic tokens (`bg-primary`, `text-tertiary`, `brand-*`) — never hardcoded palettes. Icons from `@untitledui/icons`. `cx` from `@/utils/cx`.
- All public page content is CMS-driven via `getPageContent(slug)` → `pages` + `page_sections` (JSONB) with hardcoded fallbacks. New sections must be added to `GenericCMSSections.tsx` AND `CMSPageEditor.tsx` SECTION_TEMPLATES so admins can edit everything.
- Never use the Pages Router, `next/head`, or client-side-only rendering for content that must be crawlable. Server Components deliver all content, metadata, and JSON-LD in the initial response.

## SEO / AEO / GEO standards (apply to every route you touch)
1. **Metadata**: App Router Metadata API only. Every route exports `metadata` or `generateMetadata` with: title (template `%s | International Computer Exchange` is set in root layout), description under 155 chars, `alternates.canonical`, OpenGraph + Twitter fields. `metadataBase` comes from `NEXT_PUBLIC_SITE_URL`.
2. **JSON-LD**: inject via `<script type="application/ld+json">` from Server Components using the helpers in `src/lib/seo/` (Organization `@id` graph, `Service` for solution pages, `FAQPage` built from CMS faq sections, `BreadcrumbList`, `LocalBusiness` on contact). Keep `@id` references consistent (`#organization`).
3. **Crawler triage** (`src/app/robots.ts`): allow live-retrieval AI agents (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Googlebot, Bingbot); block training scrapers (GPTBot, ClaudeBot, CCBot, Google-Extended, Applebot-Extended, Bytespider, FacebookBot, Meta-ExternalAgent); disallow `/admin`, `/portal`, `/api` for everyone. Keep `public/llms.txt` (LLM site directory) in sync when services change.
4. **GEO content voice**: inverted pyramid (direct answer first), fact density (exact SLAs, RPO/RTO, compliance names, platform names), wiki-voice third person, enumerable lists with semantic HTML. No marketing fluff ("the absolute best…").
5. **Core Web Vitals**: `next/image` (priority on hero media), `next/font`, dynamic imports for heavy client components. Don't regress LCP/INP/CLS.
6. **Analytics**: GA4/GTM wiring lives in `src/components/analytics/` + `src/lib/analytics.ts`, driven by `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_GA4_MEASUREMENT_ID` env vars (no-op when unset). Event names: lowercase snake_case ≤40 chars (`contact_submitted`, `consultation_cta_clicked`, `solution_viewed`, `search_performed`). Clear the `ecommerce` object before pushing a new one.
7. Search Console / Bing verification strings come from `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` env vars via the root layout `verification` metadata.

## Operational notes
- Supabase project `cbgfxbfqfbuodnhfxlpq`; schema from `supabase-setup.sql` + `seed-data.sql`. Dev server: port 3100 (`.claude/launch.json`).
- Run `npx tsc --noEmit` before finishing any change; `npm run build` must stay green.
