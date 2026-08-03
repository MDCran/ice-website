import type { EmailBlock } from "./templates";

const escapeHtml = (value = "") =>
  value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);

function paragraphs(value = "") {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

export function renderMarketingEmail(input: {
  preheader?: string;
  blocks: EmailBlock[];
  includeUnsubscribe?: boolean;
}) {
  const content = input.blocks.map((item) => {
    if (item.type === "hero") return `<tr><td style="padding:44px 40px 36px;background:#075985;color:#fff"><p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:2px;color:#bae6fd">${escapeHtml(item.eyebrow || "INTERNATIONAL COMPUTER EXCHANGE")}</p><h1 style="margin:0;font-size:34px;line-height:1.15">${escapeHtml(item.heading)}</h1><p style="margin:16px 0 0;font-size:17px;line-height:1.6;color:#e0f2fe">${paragraphs(item.body)}</p></td></tr>`;
    if (item.type === "text") return `<tr><td style="padding:30px 40px 6px"><h2 style="margin:0 0 10px;font-size:22px;color:#101828">${escapeHtml(item.heading)}</h2><p style="margin:0;font-size:16px;line-height:1.7;color:#475467">${paragraphs(item.body)}</p></td></tr>`;
    if (item.type === "service") return `<tr><td style="padding:24px 40px"><div style="padding:24px;border:1px solid #d0d5dd;border-radius:14px;background:#f9fafb"><h2 style="margin:0;font-size:20px;color:#101828">${escapeHtml(item.heading)}</h2><p style="margin:10px 0 0;font-size:15px;line-height:1.6;color:#475467">${paragraphs(item.body)}</p></div></td></tr>`;
    if (item.type === "notice") {
      const colors = item.tone === "warning" ? ["#fffaeb", "#b54708"] : item.tone === "success" ? ["#ecfdf3", "#027a48"] : ["#f0f9ff", "#026aa2"];
      return `<tr><td style="padding:24px 40px"><div style="padding:20px;border-radius:12px;background:${colors[0]}"><h2 style="margin:0;font-size:17px;color:${colors[1]}">${escapeHtml(item.heading)}</h2><p style="margin:8px 0 0;font-size:15px;line-height:1.6;color:#475467">${paragraphs(item.body)}</p></div></td></tr>`;
    }
    if (item.type === "metric") return `<tr><td style="padding:24px 40px;text-align:center"><p style="margin:0;font-size:38px;font-weight:700;color:#0284c7">${escapeHtml(item.value)}</p><p style="margin:6px 0 0;font-size:14px;color:#475467">${escapeHtml(item.label)}</p></td></tr>`;
    if (item.type === "button") return `<tr><td style="padding:28px 40px 34px"><a href="${escapeHtml(item.href || "https://www.icesales.com/contact")}" style="display:inline-block;padding:13px 20px;border-radius:9px;background:#0284c7;color:#fff;text-decoration:none;font-weight:700">${escapeHtml(item.label || "Learn more")}</a></td></tr>`;
    if (item.type === "divider") return `<tr><td style="padding:24px 40px"><div style="height:1px;background:#e4e7ec"></div></td></tr>`;
    return `<tr><td style="height:24px"></td></tr>`;
  }).join("");

  const unsubscribe = input.includeUnsubscribe === false ? "" : `<p style="margin:10px 0 0"><a href="{{unsubscribe_url}}" style="color:#667085">Manage email preferences</a></p>`;

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>ICE</title></head><body style="margin:0;background:#f2f4f7;font-family:Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(input.preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f4f7"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;overflow:hidden;border-radius:18px;background:#fff;box-shadow:0 2px 8px rgba(16,24,40,.08)"><tr><td style="padding:22px 40px;border-bottom:1px solid #e4e7ec"><strong style="font-size:18px;color:#101828">International Computer Exchange</strong></td></tr>${content}<tr><td style="padding:28px 40px;background:#101828;color:#d0d5dd;font-size:12px;line-height:1.6"><strong style="color:#fff">International Computer Exchange</strong><br />Boca Raton, Florida · 1-800-786-9188${unsubscribe}</td></tr></table></td></tr></table></body></html>`;
}
