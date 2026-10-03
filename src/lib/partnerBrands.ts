const PARTNER_BRANDS: Record<string, { name: string; logo: string }> = {
  ibm: { name: "IBM", logo: "/images/v3/b_1.png" },
  lenovo: { name: "Lenovo", logo: "/images/v3/b_2.png" },
  cisco: { name: "Cisco", logo: "/images/v3/b_3.png" },
  dell: { name: "Dell", logo: "/images/v3/b_4.png" },
  printronix: { name: "Printronix", logo: "/images/v3/b_5.png" },
  acronis: { name: "Acronis", logo: "/images/v3/b_6.png" },
  acronix: { name: "Acronis", logo: "/images/v3/b_6.png" },
  cybernetics: { name: "Cybernetics", logo: "/images/v3/b_7.png" },
  dascom: { name: "DASCOM", logo: "/images/v3/b_8.png" },
  cloudsafe: { name: "CloudSafe", logo: "/images/partners/cloudsafe.svg" },
};

function partnerKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function canonicalPartnerName(name: string): string {
  const trimmed = name.trim();
  return PARTNER_BRANDS[partnerKey(trimmed)]?.name ?? trimmed;
}

/** Known companies always use their own asset, even when legacy CMS data is mismatched. */
export function canonicalPartnerLogo(name: string): string | undefined {
  return PARTNER_BRANDS[partnerKey(name)]?.logo;
}

export function resolvePartnerLogo(name: string, suppliedLogo?: string): string | undefined {
  return canonicalPartnerLogo(name) ?? (suppliedLogo?.trim() || undefined);
}
