import type { EmailBlock } from "./templates";

export type EmailBranding = {
  logoUrl: string;
  logoAlt: string;
  headerColor: string;
  companyName: string;
  location: string;
  phone: string;
  websiteUrl: string;
  footerNote: string;
  accentColor: string;
  heroColor: string;
  footerColor: string;
  pageColor: string;
  fontFamily: "Inter" | "Arial" | "Georgia";
};

export const DEFAULT_EMAIL_BRANDING: EmailBranding = {
  logoUrl: "https://www.icesales.com/images/logo/ice-logo.jpg",
  logoAlt: "International Computer Exchange",
  headerColor: "#ffffff",
  companyName: "International Computer Exchange",
  location: "Boca Raton, Florida",
  phone: "1-800-786-9188",
  websiteUrl: "https://www.icesales.com",
  footerNote: "You are receiving this email from ICE.",
  accentColor: "#0284c7",
  heroColor: "#07172a",
  footerColor: "#0b1628",
  pageColor: "#eef2f6",
  fontFamily: "Inter",
};

export function normalizeEmailBranding(value?: Partial<EmailBranding> | null): EmailBranding {
  const candidate = value ?? {};
  const url = (text: string | undefined, fallback: string, allowPath = false) => {
    const raw = text?.trim() ?? "";
    if (allowPath && raw.startsWith("/") && !raw.startsWith("//")) return raw;
    try { const parsed = new URL(raw); return parsed.protocol === "https:" && !parsed.username && !parsed.password ? parsed.toString() : fallback; } catch { return fallback; }
  };
  const color = (text: string | undefined, fallback: string) => /^#[\da-f]{6}$/i.test(text ?? "") ? text! : fallback;
  const fontFamily = candidate.fontFamily === "Arial" || candidate.fontFamily === "Georgia" ? candidate.fontFamily : "Inter";
  return {
    logoUrl: url(candidate.logoUrl, DEFAULT_EMAIL_BRANDING.logoUrl, true),
    logoAlt: candidate.logoAlt?.trim().slice(0, 160) || DEFAULT_EMAIL_BRANDING.logoAlt,
    headerColor: color(candidate.headerColor, DEFAULT_EMAIL_BRANDING.headerColor),
    companyName: candidate.companyName?.trim().slice(0, 160) || DEFAULT_EMAIL_BRANDING.companyName,
    location: candidate.location?.trim().slice(0, 160) || DEFAULT_EMAIL_BRANDING.location,
    phone: candidate.phone?.trim().slice(0, 48) || DEFAULT_EMAIL_BRANDING.phone,
    websiteUrl: url(candidate.websiteUrl, DEFAULT_EMAIL_BRANDING.websiteUrl),
    footerNote: candidate.footerNote?.trim().slice(0, 300) || DEFAULT_EMAIL_BRANDING.footerNote,
    accentColor: color(candidate.accentColor, DEFAULT_EMAIL_BRANDING.accentColor),
    heroColor: color(candidate.heroColor, DEFAULT_EMAIL_BRANDING.heroColor),
    footerColor: color(candidate.footerColor, DEFAULT_EMAIL_BRANDING.footerColor),
    pageColor: color(candidate.pageColor, DEFAULT_EMAIL_BRANDING.pageColor),
    fontFamily,
  };
}

const escapeHtml = (value = "") =>
  value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);

function paragraphs(value = "") {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

function imageSource(value = "") {
  const source = value.startsWith("/") ? `https://www.icesales.com${value}` : value;
  try {
    const url = new URL(source);
    return url.protocol === "https:" ? escapeHtml(url.toString()) : "";
  } catch {
    return "";
  }
}

function normalizeBillingBlocks(blocks: EmailBlock[]) {
  const needsBalance = blocks.some((item) => [item.heading, item.body, item.value].some((value) => value?.includes("{{amount_due}}")))
    && blocks.some((item) => item.type === "button" && (/pay your balance/i.test(item.label ?? "") || item.href?.includes("payment_url") || item.href?.includes("quickbooks.intuit.com")));
  if (!needsBalance || blocks.some((item) => item.type === "balance")) return blocks;

  let amount = "{{amount_due}}";
  const normalized = blocks.map((item) => {
    if (item.type !== "hero" || !item.body?.includes("{{amount_due}}")) return item;
    const body = item.body
      .replace(/Hello\s+{{first_name}},\s*this is a friendly reminder that your current balance due is\s*{{amount_due}}\.?/i, "Hello {{first_name}}, this is a friendly reminder about your ICE account.")
      .replace(/Hello\s+{{first_name}},\s*your current balance due is\s*{{amount_due}}\.?/i, "Hello {{first_name}}, please review the amount due on your ICE account.")
      .replace(/Your account balance of\s*{{amount_due}}\s*is overdue\.?/i, "Please review the overdue amount on your ICE account.");
    return { ...item, body };
  });
  const valueBlock = blocks.find((item) => item.value?.includes("{{amount_due}}"));
  if (valueBlock?.value) amount = valueBlock.value;
  const heroIndex = normalized.findIndex((item) => item.type === "hero");
  normalized.splice(heroIndex < 0 ? 0 : heroIndex + 1, 0, {
    id: "generated-amount-due", type: "balance", heading: "Amount due", value: amount,
  });
  return normalized;
}

export function renderMarketingEmail(input: {
  preheader?: string;
  blocks: EmailBlock[];
  includeUnsubscribe?: boolean;
  branding?: Partial<EmailBranding> | null;
}) {
  const branding = normalizeEmailBranding(input.branding);
  const font = branding.fontFamily === "Georgia" ? "Georgia,'Times New Roman',serif" : branding.fontFamily === "Arial" ? "Arial,Helvetica,sans-serif" : "Inter,'Segoe UI',Arial,sans-serif";
  const blocks = normalizeBillingBlocks(input.blocks);
  const content = blocks.map((item) => {
    if (item.type === "hero") return `<tr><td style="padding:38px 40px 34px;background-color:${branding.heroColor};background-image:linear-gradient(rgba(111,175,215,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(111,175,215,.08) 1px,transparent 1px),radial-gradient(ellipse at 100% 0%,rgba(0,145,220,.24),transparent 55%);background-size:32px 32px,32px 32px,auto;color:#fff;font-family:${font}"><p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:2px;color:#7dd3fc">${escapeHtml(item.eyebrow || branding.companyName.toUpperCase())}</p><h1 style="margin:0;font-size:30px;line-height:1.2;font-weight:700;letter-spacing:-.35px">${escapeHtml(item.heading)}</h1><p style="margin:16px 0 0;font-size:16px;line-height:1.65;color:#d5e4f1">${paragraphs(item.body)}</p></td></tr>`;
    if (item.type === "text") return `<tr><td style="padding:30px 40px 6px"><h2 style="margin:0 0 10px;font-size:22px;color:#101828">${escapeHtml(item.heading)}</h2><p style="margin:0;font-size:16px;line-height:1.7;color:#475467">${paragraphs(item.body)}</p></td></tr>`;
    if (item.type === "service") return `<tr><td style="padding:24px 40px"><div style="padding:24px;border:1px solid #d0d5dd;border-radius:14px;background:#f9fafb"><h2 style="margin:0;font-size:20px;color:#101828">${escapeHtml(item.heading)}</h2><p style="margin:10px 0 0;font-size:15px;line-height:1.6;color:#475467">${paragraphs(item.body)}</p></div></td></tr>`;
    if (item.type === "notice") {
      const colors = item.tone === "warning" ? ["#fffaeb", "#b54708"] : item.tone === "success" ? ["#ecfdf3", "#027a48"] : ["#f0f9ff", "#026aa2"];
      return `<tr><td style="padding:24px 40px"><div style="padding:20px;border-radius:12px;background:${colors[0]}"><h2 style="margin:0;font-size:17px;color:${colors[1]}">${escapeHtml(item.heading)}</h2><p style="margin:8px 0 0;font-size:15px;line-height:1.6;color:#475467">${paragraphs(item.body)}</p></div></td></tr>`;
    }
    if (item.type === "metric") return `<tr><td style="padding:24px 40px;text-align:center"><p style="margin:0;font-size:38px;font-weight:700;color:${branding.accentColor}">${escapeHtml(item.value)}</p><p style="margin:6px 0 0;font-size:14px;color:#475467">${escapeHtml(item.label)}</p></td></tr>`;
    if (item.type === "balance") return `<tr><td style="padding:8px 40px 22px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #cfe4f2;border-left:4px solid ${branding.accentColor};border-radius:12px;background:#f3f9fd"><tr><td style="padding:20px 22px"><p style="margin:0 0 5px;color:#536b7e;font-size:12px;line-height:1.5;font-weight:700;letter-spacing:1.1px;text-transform:uppercase">${escapeHtml(item.heading || "Amount due")}</p><p style="margin:0;color:#0b1f33;font-size:34px;line-height:1.2;font-weight:800;letter-spacing:-.6px">${escapeHtml(item.value || "{{amount_due}}")}</p></td></tr></table></td></tr>`;
    if (item.type === "image") {
      const src = imageSource(item.imageUrl);
      if (!src) return "";
      return `<tr><td style="padding:0 28px 8px"><img src="${src}" width="624" alt="${escapeHtml(item.heading || "ICE service infrastructure")}" style="display:block;width:100%;max-width:624px;height:auto;border:0;border-radius:10px"></td></tr>`;
    }
    if (item.type === "signature") return `<tr><td style="padding:26px 40px 34px;font-family:Inter,'Segoe UI',Arial,sans-serif"><img src="${imageSource(item.imageUrl || "https://www.icesales.com/images/branding/ceo-signature.png")}" width="220" alt="Signature of ${escapeHtml(item.heading || "ICE leadership")}" style="display:block;width:220px;max-width:80%;height:auto;margin:0 0 8px"><strong style="display:block;color:#101828;font-size:15px;line-height:1.5">${escapeHtml(item.heading)}</strong><span style="display:block;margin-top:2px;color:#475467;font-size:13px;line-height:1.5">${escapeHtml(item.body)}</span></td></tr>`;
    if (item.type === "button") {
      const isPaymentButton = /pay your balance/i.test(item.label ?? "") || item.href?.includes("{{payment_url}}") || item.href?.includes("quickbooks.intuit.com");
      return `<tr><td style="padding:24px 40px 34px"><a href="${escapeHtml(item.href || branding.websiteUrl)}" style="display:inline-block;padding:14px 24px;border:1px solid ${branding.accentColor};border-radius:9px;background:${branding.accentColor};color:#fff;text-decoration:none;font-family:${font};font-size:15px;line-height:1.35;font-weight:700">${escapeHtml(item.label || "Learn more")}</a>${isPaymentButton ? `<p style="margin:10px 0 0;color:#66788a;font-family:${font};font-size:12px;line-height:1.5">Powered by <strong style="color:#475467">Intuit QuickBooks</strong></p>` : ""}</td></tr>`;
    }
    if (item.type === "divider") return `<tr><td style="padding:24px 40px"><div style="height:1px;background:#e4e7ec"></div></td></tr>`;
    return `<tr><td style="height:24px"></td></tr>`;
  }).join("");

  const unsubscribe = input.includeUnsubscribe === false ? "" : `<tr><td style="padding-top:18px;border-top:1px solid rgba(148,181,207,.2)"><a href="{{unsubscribe_url}}" style="display:inline-block;color:#91d9ff;font-size:12px;line-height:1.5;font-weight:600;text-decoration:underline">Manage email preferences or unsubscribe</a></td></tr>`;
  const logoSrc = imageSource(branding.logoUrl);
  const logo = logoSrc
    ? `<a href="${escapeHtml(branding.websiteUrl)}" style="display:inline-block;text-decoration:none"><img src="${logoSrc}" width="150" alt="${escapeHtml(branding.logoAlt)}" style="display:block;width:150px;max-width:100%;height:auto;border:0"></a>`
    : `<a href="${escapeHtml(branding.websiteUrl)}" style="display:inline-block;color:#101828;text-decoration:none;font-size:18px;font-weight:700">${escapeHtml(branding.companyName)}</a>`;
  const phoneLink = branding.phone ? `<a href="tel:${escapeHtml(branding.phone.replace(/[^+\d]/g, ""))}" style="color:#c7d5e2;text-decoration:underline">${escapeHtml(branding.phone)}</a>` : "";
  const locationLine = [branding.location ? escapeHtml(branding.location) : "", phoneLink].filter(Boolean).join(" <span style=\"color:#5a7c97\">&nbsp;·&nbsp;</span> ");

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(branding.companyName)}</title></head><body style="margin:0;background:${branding.pageColor};font-family:${font}"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(input.preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${branding.pageColor}"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;overflow:hidden;border:1px solid #d0d5dd;border-radius:16px;background:#fff"><tr><td style="padding:18px 36px;border-bottom:1px solid #e4e7ec;background:${branding.headerColor};font-family:${font}">${logo}</td></tr>${content}<tr><td bgcolor="${branding.footerColor}" style="padding:28px 36px 30px;background-color:${branding.footerColor};background-image:linear-gradient(rgba(111,175,215,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(111,175,215,.045) 1px,transparent 1px);background-size:32px 32px;color:#c7d5e2;font-family:${font}"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:0 0 18px"><p style="margin:0 0 7px;color:#fff;font-size:14px;line-height:1.5;font-weight:700">${escapeHtml(branding.companyName)}</p><p style="margin:0;color:#c7d5e2;font-size:13px;line-height:1.7">${locationLine}</p>${branding.websiteUrl ? `<p style="margin:6px 0 0;font-size:12px;line-height:1.6"><a href="${escapeHtml(branding.websiteUrl)}" style="color:#91d9ff;text-decoration:underline">${escapeHtml(branding.websiteUrl.replace(/^https?:\/\//, ""))}</a></p>` : ""}<p style="margin:8px 0 0;color:#90a4b8;font-size:12px;line-height:1.6">${escapeHtml(branding.footerNote)}</p></td></tr>${unsubscribe}</table></td></tr></table></td></tr></table></body></html>`;
}
