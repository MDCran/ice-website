import { BUYER_FAQS } from "@/lib/buyerFaqs";

export interface CmsFaqItem {
  id: string;
  question: string;
  answer: string;
}
function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function faqId(value: unknown, question: string, index: number): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  const generated = question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return generated || `question-${index + 1}`;
}

/**
 * Resolve FAQ rows from the common CMS section-key variants. The static buyer
 * FAQs are used only when the page has no FAQ-items section at all; an
 * intentionally empty CMS section therefore remains empty.
 */
export function faqItemsFromSections(
  sections?: Record<string, unknown>,
): CmsFaqItem[] {
  const sectionKeys = ["faqs", "faq", "faq_items", "items"];
  const sectionKey = sections
    ? sectionKeys.find((key) => hasOwn(sections, key))
    : undefined;

  if (!sections || !sectionKey) return BUYER_FAQS;

  const section = sections[sectionKey];
  const rawItems = Array.isArray(section)
    ? section
    : section && typeof section === "object"
      ? (section as Record<string, unknown>).items ??
        (section as Record<string, unknown>).faqs
      : [];

  if (!Array.isArray(rawItems)) return [];

  return rawItems.flatMap((raw, index) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as Record<string, unknown>;
    const question = String(item.question ?? item.title ?? "").trim();
    const answer = String(item.answer ?? item.content ?? item.description ?? "").trim();
    if (!question || !answer) return [];
    return [{ id: faqId(item.id, question, index), question, answer }];
  });
}
