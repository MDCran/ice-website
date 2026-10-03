import type { EmailBlock } from "./templates";

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

export function renderMarketingEmail(input: {
  preheader?: string;
  blocks: EmailBlock[];
  includeUnsubscribe?: boolean;
}) {
  const content = input.blocks.map((item) => {
    if (item.type === "hero") return `<tr><td style="padding:38px 40px 34px;background-color:#07172a;background-image:linear-gradient(rgba(111,175,215,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(111,175,215,.08) 1px,transparent 1px),radial-gradient(ellipse at 100% 0%,rgba(0,145,220,.24),transparent 55%);background-size:32px 32px,32px 32px,auto;color:#fff;font-family:Inter,'Segoe UI',Arial,sans-serif"><p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:2px;color:#7dd3fc">${escapeHtml(item.eyebrow || "INTERNATIONAL COMPUTER EXCHANGE")}</p><h1 style="margin:0;font-size:30px;line-height:1.2;font-weight:700;letter-spacing:-.35px">${escapeHtml(item.heading)}</h1><p style="margin:16px 0 0;font-size:16px;line-height:1.65;color:#d5e4f1">${paragraphs(item.body)}</p></td></tr>`;
    if (item.type === "text") return `<tr><td style="padding:30px 40px 6px"><h2 style="margin:0 0 10px;font-size:22px;color:#101828">${escapeHtml(item.heading)}</h2><p style="margin:0;font-size:16px;line-height:1.7;color:#475467">${paragraphs(item.body)}</p></td></tr>`;
    if (item.type === "service") return `<tr><td style="padding:24px 40px"><div style="padding:24px;border:1px solid #d0d5dd;border-radius:14px;background:#f9fafb"><h2 style="margin:0;font-size:20px;color:#101828">${escapeHtml(item.heading)}</h2><p style="margin:10px 0 0;font-size:15px;line-height:1.6;color:#475467">${paragraphs(item.body)}</p></div></td></tr>`;
    if (item.type === "notice") {
      const colors = item.tone === "warning" ? ["#fffaeb", "#b54708"] : item.tone === "success" ? ["#ecfdf3", "#027a48"] : ["#f0f9ff", "#026aa2"];
      return `<tr><td style="padding:24px 40px"><div style="padding:20px;border-radius:12px;background:${colors[0]}"><h2 style="margin:0;font-size:17px;color:${colors[1]}">${escapeHtml(item.heading)}</h2><p style="margin:8px 0 0;font-size:15px;line-height:1.6;color:#475467">${paragraphs(item.body)}</p></div></td></tr>`;
    }
    if (item.type === "metric") return `<tr><td style="padding:24px 40px;text-align:center"><p style="margin:0;font-size:38px;font-weight:700;color:#0284c7">${escapeHtml(item.value)}</p><p style="margin:6px 0 0;font-size:14px;color:#475467">${escapeHtml(item.label)}</p></td></tr>`;
    if (item.type === "image") {
      const src = imageSource(item.imageUrl);
      if (!src) return "";
      return `<tr><td style="padding:0 28px 8px"><img src="${src}" width="624" alt="${escapeHtml(item.heading || "ICE service infrastructure")}" style="display:block;width:100%;max-width:624px;height:auto;border:0;border-radius:10px"></td></tr>`;
    }
    if (item.type === "signature") return `<tr><td style="padding:26px 40px 34px;font-family:Inter,'Segoe UI',Arial,sans-serif"><img src="${imageSource(item.imageUrl || "https://www.icesales.com/images/branding/ceo-signature.png")}" width="220" alt="Signature of ${escapeHtml(item.heading || "ICE leadership")}" style="display:block;width:220px;max-width:80%;height:auto;margin:0 0 8px"><strong style="display:block;color:#101828;font-size:15px;line-height:1.5">${escapeHtml(item.heading)}</strong><span style="display:block;margin-top:2px;color:#475467;font-size:13px;line-height:1.5">${escapeHtml(item.body)}</span></td></tr>`;
    if (item.type === "button") return `<tr><td style="padding:28px 40px 34px"><a href="${escapeHtml(item.href || "https://www.icesales.com/contact")}" style="display:inline-block;padding:13px 20px;border-radius:9px;background:#0284c7;color:#fff;text-decoration:none;font-weight:700">${escapeHtml(item.label || "Learn more")}</a></td></tr>`;
    if (item.type === "divider") return `<tr><td style="padding:24px 40px"><div style="height:1px;background:#e4e7ec"></div></td></tr>`;
    return `<tr><td style="height:24px"></td></tr>`;
  }).join("");

  const unsubscribe = input.includeUnsubscribe === false ? "" : `<p style="margin:12px 0 0"><a href="{{unsubscribe_url}}" style="color:#d0d5dd;text-decoration:underline">Manage email preferences or unsubscribe</a></p>`;

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>ICE</title></head><body style="margin:0;background:#eef2f6;font-family:Inter,'Segoe UI',Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(input.preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2f6"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;overflow:hidden;border:1px solid #d0d5dd;border-radius:16px;background:#fff"><tr><td style="padding:18px 36px;border-bottom:1px solid #e4e7ec"><a href="https://www.icesales.com" style="display:inline-block;text-decoration:none"><img src="https://www.icesales.com/images/logo/ice-logo.jpg" width="150" alt="International Computer Exchange" style="display:block;width:150px;height:auto;border:0"></a></td></tr>${content}<tr><td style="padding:26px 36px;background:#101828;color:#d0d5dd;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:12px;line-height:1.7"><strong style="color:#fff">International Computer Exchange</strong><br />Boca Raton, Florida · <a href="tel:18007869188" style="color:#d0d5dd">1-800-786-9188</a><br />You are receiving this email from ICE.${unsubscribe}</td></tr></table></td></tr></table></body></html>`;
}
