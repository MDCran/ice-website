# Service content and SEO audit — September 14, 2026

## Changes

- AS400 / IBM i is the featured Solutions menu destination on desktop and mobile. Its CMS navigation row and catalog order put it first, and the overview/homepage lead to it directly.
- The existing CMS promo fields control the featured menu panel; administrators can edit its copy and destination. Navigation ordering and page publication remain authoritative.
- All 18 published service pages receive individual titles, descriptions, feature explanations, and FAQs. AS/400 hardware heritage is distinguished from the current IBM i operating system.
- Unsupported percentage savings, universal platform claims, guaranteed recovery, and unsourced statistics are removed from visible service copy. Legacy ROI, sample-metric, and supporting promotional sections are hidden, not deleted, pending substantiation.
- IBM Power Virtual Server copy avoids a fixed processor generation or universal release support. Microsoft and endpoint security descriptions acknowledge licensing and platform differences.
- “30+ years in business” appears in global navigation, homepage, Solutions, and each service's introduction/benefits. It describes ICE's business history, not the age of every offering.
- Metadata, canonicals, structured data, robots, and sitemap share a validated public origin; localhost, invalid protocols, credentials, and IP addresses are rejected. Individual services use their configured hero/card image for social sharing unless an explicit override exists.
- The current public origin is `https://sandbox.icesales.com`, matching this checkout's published site. `www.icesales.com` still serves a separate older site and redirects service paths to its homepage. Administrators can change Public Website URL in SEO settings when the production domain is actually switched; canonicals must not point service pages at that older site's homepage.

## Sources and limits

Technical facts were checked against primary sources:

- [IBM i naming history](https://www.redbooks.ibm.com/redbooks/pdfs/sg247858.pdf), section 1.2: historical naming only, not current release support.
- [IBM Power Virtual Server supported operating systems](https://www.ibm.com/docs/en/power-virtual-server?topic=started-operating-systems-supported-in-power-virtual-server).
- [IBM Power Virtual Server](https://www.ibm.com/products/power-virtual-server).
- [Microsoft Defender platform capabilities](https://learn.microsoft.com/en-us/defender-endpoint/supported-capabilities-by-platform).
- [Microsoft Entra licensing](https://learn.microsoft.com/en-us/entra/fundamentals/licensing).
- [CISA ransomware recovery guidance](https://www.cisa.gov/stopransomware/ransomware-guide).
- [ICE's public company history](https://www.icesales.com/) and the owner's instruction to emphasize 30 years in business.

This is an editorial and technical accuracy pass, not a verification of ICE's contracts or operations. Current facility audit reports, partner credentials, staffing/coverage, vendor entitlements, actual SLA schedules, recovery-test results, and customer metrics were not supplied. No new certification, performance result, service guarantee, or regulatory-compliance assertion is made. Confirm those materials before re-enabling the hidden claims. Search ranking or rich-result eligibility is not guaranteed.

## Publishing and maintaining the revision

`node scripts/publish-service-audit.mjs` previews the targeted content plan. Add `--apply` to publish it. It saves original rows and the change plan under the ignored `.vercel/audit-*` directory and stops on concurrent edits. It never deletes content and does not run during builds or at application startup.

After this one-time migration, make further changes in the CMS. Do not rerun the editorial migration over later administrator copy. Hidden sections can be reviewed and restored in the page editor after their claims are verified.

`node scripts/test-seo-audit.mjs` checks URL safety and the 18 service definitions. Verify the deployed public URL separately: a successful hosting build behind an authentication screen is not a publicly published website.
