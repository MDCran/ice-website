/** Hero / card wash images keyed by solution slug. */
export const SOLUTION_HERO_IMAGE_BY_SLUG: Record<string, string> = {
  "managed-cloud-hosting": "/images/solutions/heroes/managed-cloud-hosting.webp",
  "managed-private-cloud": "/images/solutions/heroes/managed-private-cloud.webp",
  "managed-hybrid-cloud": "/images/solutions/heroes/managed-hybrid-cloud.webp",
  "cloud-migration": "/images/solutions/heroes/cloud-migration.webp",
  "backup-as-a-service": "/images/solutions/heroes/backup-as-a-service.webp",
  "disaster-recovery": "/images/solutions/heroes/disaster-recovery.webp",
  "high-availability": "/images/solutions/heroes/high-availability.webp",
  "ransomware-recovery": "/images/solutions/heroes/ransomware-recovery.webp",
  "as400": "/images/solutions/heroes/ibm-i-security.webp",
  "ibm-i-security": "/images/solutions/heroes/ibm-i-security.webp",
  "protection-suite": "/images/solutions/heroes/protection-suite.webp",
  "security-monitoring": "/images/solutions/heroes/security-monitoring.webp",
  "threat-detection": "/images/solutions/heroes/threat-detection.webp",
  "endpoint-security": "/images/solutions/heroes/endpoint-security.webp",
  "managed-microsoft": "/images/solutions/heroes/managed-microsoft.webp",
  "automation-suite": "/images/solutions/heroes/automation-suite.webp",
  "systems-management": "/images/solutions/heroes/systems-management.webp",
  "ibm-power-vs": "/images/solutions/heroes/ibm-power-vs.webp",
};

/**
 * Resolve a service/related-item image the same way `/solutions` listing cards do:
 * CMS image fields first, then hero image for the href slug.
 */
export function serviceImageFor(item: {
  href?: string;
  hero_image?: string;
  heroImage?: string;
  background_image?: string;
  backgroundImage?: string;
  image?: string;
  image_src?: string;
  imageSrc?: string;
}): string | undefined {
  const directImage =
    item.hero_image ??
    item.heroImage ??
    item.background_image ??
    item.backgroundImage ??
    item.image ??
    item.image_src ??
    item.imageSrc;

  if (typeof directImage === "string" && directImage.trim()) {
    return directImage.trim();
  }

  const slug =
    typeof item.href === "string" ? item.href.split("/").filter(Boolean).pop() : undefined;
  return slug ? SOLUTION_HERO_IMAGE_BY_SLUG[slug] : undefined;
}
