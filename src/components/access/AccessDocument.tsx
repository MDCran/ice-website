"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  List,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import type {
  AccessContentSection,
  AccessSectionContent,
  AccessSectionValue,
  PublicAccessSettings,
} from "@/lib/access-pages/types";

type ValueObject = Record<string, AccessSectionValue>;

function valueObject(value: AccessSectionValue | undefined): ValueObject | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ValueObject)
    : null;
}

function valueArray(value: AccessSectionValue | undefined): AccessSectionValue[] {
  return Array.isArray(value) ? value : [];
}

function valueString(value: AccessSectionValue | undefined): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function firstString(content: AccessSectionContent, keys: string[]): string {
  for (const key of keys) {
    const value = valueString(content[key]).trim();
    if (value) return value;
  }
  return "";
}

function sectionId(section: AccessContentSection): string {
  return `section-${section.section_key
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function safeHref(value: string): string | null {
  const href = value.trim();
  if (!href) return null;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:" ? href : null;
  } catch {
    return null;
  }
}

function textParagraphs(content: AccessSectionContent): string[] {
  const paragraphs = valueArray(content.paragraphs)
    .map((item) => valueString(item).trim())
    .filter(Boolean);
  if (paragraphs.length) return paragraphs;

  const body = firstString(content, ["body", "copy", "description"]);
  return body
    ? body
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : [];
}

function SectionTitle({ section }: { section: AccessContentSection }) {
  const heading = firstString(section.content, ["heading", "title"]);
  const eyebrow = firstString(section.content, ["eyebrow", "label"]);
  const subheading = firstString(section.content, ["subheading", "subtitle"]);
  const page = firstString(section.content, ["pdf_page", "page_reference"]);

  if (!heading && !eyebrow && !subheading) return null;
  return (
    <header className="mb-7">
      <div className="flex flex-wrap items-center gap-3">
        {eyebrow && (
          <p className="text-xs font-semibold tracking-[0.18em] text-sky-400 uppercase">
            {eyebrow}
          </p>
        )}
        {page && (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-slate-500">
            PDF page {page}
          </span>
        )}
      </div>
      {heading && (
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          {heading}
        </h2>
      )}
      {subheading && (
        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-400">
          {subheading}
        </p>
      )}
      <div className="mt-5 h-px bg-gradient-to-r from-sky-400/40 via-sky-400/10 to-transparent" />
    </header>
  );
}

function Paragraphs({ values }: { values: string[] }) {
  if (!values.length) return null;
  return (
    <div className="space-y-4 text-[15px] leading-7 text-slate-300">
      {values.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
      ))}
    </div>
  );
}

function BulletItems({ values }: { values: AccessSectionValue[] }) {
  if (!values.length) return null;
  return (
    <ul className="mt-5 grid gap-3">
      {values.map((value, index) => {
        const item = valueObject(value);
        const title = item
          ? firstString(item, ["title", "label", "name", "text"])
          : valueString(value);
        const description = item
          ? firstString(item, ["description", "body", "desc"])
          : "";
        if (!title && !description) return null;
        return (
          <li key={`${index}-${title}`} className="flex items-start gap-3 text-slate-300">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" aria-hidden="true" />
            <span>
              {title && <span className="font-medium text-slate-100">{title}</span>}
              {title && description && <span className="text-slate-500"> — </span>}
              {description && <span className="text-slate-400">{description}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function Cards({ values }: { values: AccessSectionValue[] }) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {values.map((value, index) => {
        const item = valueObject(value);
        if (!item) return null;
        const title = firstString(item, ["title", "label", "name"]);
        const description = firstString(item, ["description", "body", "desc"]);
        const metric = firstString(item, ["value", "metric", "amount"]);
        return (
          <article
            key={`${index}-${title}`}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 shadow-xl shadow-black/10"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/15 bg-sky-400/10 text-sky-300">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            {metric && <p className="mb-2 font-mono text-xl font-bold text-sky-300">{metric}</p>}
            {title && <h3 className="font-semibold text-white">{title}</h3>}
            {description && <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>}
          </article>
        );
      })}
    </div>
  );
}

function DataTable({ content }: { content: AccessSectionContent }) {
  const rawRows = valueArray(content.rows);
  if (!rawRows.length) return null;
  const configuredColumns = valueArray(content.columns)
    .map((column) => {
      const object = valueObject(column);
      if (object) {
        const key = firstString(object, ["key", "id", "value"]);
        return key ? { key, label: firstString(object, ["label", "title"]) || key } : null;
      }
      const key = valueString(column).trim();
      return key ? { key, label: key.replace(/_/g, " ") } : null;
    })
    .filter((column): column is { key: string; label: string } => Boolean(column));
  const firstObjectRow = rawRows.map(valueObject).find(Boolean);
  const firstArrayRow = rawRows.find(Array.isArray);
  const columns = configuredColumns.length
    ? configuredColumns
    : firstObjectRow
      ? Object.keys(firstObjectRow).map((key) => ({ key, label: key.replace(/_/g, " ") }))
      : Array.isArray(firstArrayRow)
        ? firstArrayRow.map((_, index) => ({ key: String(index), label: `Column ${index + 1}` }))
        : [];
  const rows = rawRows
    .map((row) => {
      const object = valueObject(row);
      if (object) return object;
      if (!Array.isArray(row)) return null;
      return Object.fromEntries(
        columns.map((column, index) => [column.key, row[index] ?? ""]),
      ) as ValueObject;
    })
    .filter((row): row is ValueObject => Boolean(row));
  if (!columns.length || !rows.length) return null;

  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.025]">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-white/[0.08] bg-white/[0.025]">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="transition hover:bg-white/[0.025]">
              {columns.map((column, columnIndex) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 leading-6 ${columnIndex === 0 ? "font-medium text-white" : "text-slate-400"}`}
                >
                  {valueString(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Timeline({ values }: { values: AccessSectionValue[] }) {
  return (
    <ol className="relative mt-7 space-y-6 before:absolute before:top-3 before:bottom-3 before:left-4 before:w-px before:bg-sky-400/20">
      {values.map((value, index) => {
        const item = valueObject(value);
        if (!item) return null;
        const title = firstString(item, ["title", "phase", "label"]);
        const description = firstString(item, ["description", "body", "desc"]);
        const marker = firstString(item, ["number", "step", "date", "value"]) || String(index + 1);
        return (
          <li key={`${index}-${title}`} className="relative grid grid-cols-[2rem_1fr] gap-4">
            <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-sky-400/30 bg-slate-950 font-mono text-xs font-bold text-sky-300">
              {marker}
            </span>
            <div className="pt-1">
              <h3 className="font-semibold text-white">{title}</h3>
              {description && <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Pricing({ values }: { values: AccessSectionValue[] }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
      {values.map((value, index) => {
        const item = valueObject(value);
        if (!item) return null;
        const label = firstString(item, ["label", "title", "name"]);
        const amount = firstString(item, ["amount", "value", "price"]);
        const description = firstString(item, ["description", "body", "desc"]);
        const highlighted = item.highlight === true;
        return (
          <div
            key={`${index}-${label}`}
            className={`grid gap-3 border-b border-white/[0.07] p-5 last:border-b-0 md:grid-cols-[1fr_auto] md:items-center ${highlighted ? "bg-sky-400/[0.06]" : ""}`}
          >
            <div>
              <h3 className="font-semibold text-white">{label}</h3>
              {description && <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>}
            </div>
            {amount && <p className="font-mono text-xl font-bold text-sky-300">{amount}</p>}
          </div>
        );
      })}
    </div>
  );
}

function CallToAction({ content }: { content: AccessSectionContent }) {
  const body = textParagraphs(content);
  const items = valueArray(content.items).length
    ? valueArray(content.items)
    : valueArray(content.bullets);
  const label = firstString(content, ["cta_label", "button_label", "link_label"]);
  const href = safeHref(firstString(content, ["cta_href", "button_href", "href"]));
  return (
    <div className="rounded-3xl border border-sky-400/15 bg-gradient-to-br from-sky-400/[0.11] via-white/[0.035] to-transparent p-7 text-center md:p-10">
      <Paragraphs values={body} />
      <div className="mx-auto max-w-2xl text-left">
        <BulletItems values={items} />
      </div>
      {label && href && (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
        >
          {label}
        </a>
      )}
    </div>
  );
}

function ProposalSection({ section }: { section: AccessContentSection }) {
  const { content } = section;
  const type = section.section_type.toLowerCase();
  const paragraphs = textParagraphs(content);
  const items = valueArray(content.items).length
    ? valueArray(content.items)
    : valueArray(content.bullets);

  let body: React.ReactNode;
  if (type.includes("comparison") || type.includes("table") || valueArray(content.rows).length) {
    body = <DataTable content={content} />;
  } else if (type.includes("timeline") || type.includes("process")) {
    body = <><Paragraphs values={paragraphs} /><Timeline values={items} /></>;
  } else if (type.includes("pricing") || type.includes("investment")) {
    body = <><Paragraphs values={paragraphs} /><Pricing values={items} /></>;
  } else if (type.includes("card") || type.includes("feature") || type.includes("outcome")) {
    body = <><Paragraphs values={paragraphs} /><Cards values={items} /></>;
  } else if (type.includes("cta") || type.includes("callout") || type.includes("acceptance")) {
    body = <CallToAction content={content} />;
  } else {
    const objectItems = items.some((item) => Boolean(valueObject(item)));
    body = (
      <>
        <Paragraphs values={paragraphs} />
        {objectItems ? <Cards values={items} /> : <BulletItems values={items} />}
      </>
    );
  }

  const page = firstString(content, ["pdf_page", "page_reference"]);
  return (
    <section
      id={sectionId(section)}
      data-access-section={section.section_key}
      data-pdf-page={page || undefined}
      className="scroll-mt-10"
    >
      <SectionTitle section={section} />
      {body}
      {firstString(content, ["note", "footnote"]) && (
        <p className="mt-5 text-xs leading-5 text-slate-500">
          {firstString(content, ["note", "footnote"])}
        </p>
      )}
    </section>
  );
}

interface TocItem {
  id: string;
  label: string;
  level: number;
}

function sectionToc(section: AccessContentSection): TocItem | null {
  const label = firstString(section.content, ["toc_label", "heading", "title"]);
  if (!label) return null;
  const rawLevel = section.content.toc_level;
  const level = typeof rawLevel === "number" && rawLevel >= 1 && rawLevel <= 3 ? rawLevel : 1;
  return { id: sectionId(section), label, level };
}

export default function AccessDocument({
  settings,
  sections,
}: {
  settings: PublicAccessSettings;
  sections: AccessContentSection[];
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const matchesRef = useRef<HTMLElement[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [matchIndex, setMatchIndex] = useState(0);
  const [activeId, setActiveId] = useState("");
  const [tocOpen, setTocOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [selectionPage, setSelectionPage] = useState<{ label: string; x: number; y: number } | null>(null);
  const toc = useMemo(
    () => sections.map(sectionToc).filter((item): item is TocItem => Boolean(item)),
    [sections],
  );

  const clearHighlights = useCallback(() => {
    contentRef.current?.querySelectorAll("mark[data-access-highlight]").forEach((mark) => {
      const parent = mark.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(mark.textContent || ""), mark);
      parent.normalize();
    });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      clearHighlights();
      const root = contentRef.current;
      const needle = query.trim().toLocaleLowerCase();
      if (!root || !needle) {
        matchesRef.current = [];
        setMatchCount(0);
        setMatchIndex(0);
        return;
      }

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      let current: Node | null;
      while ((current = walker.nextNode())) {
        const text = current as Text;
        const parent = text.parentElement;
        if (
          text.textContent?.trim() &&
          parent &&
          !parent.closest("mark,script,style,[aria-hidden='true']")
        ) {
          nodes.push(text);
        }
      }

      const found: HTMLElement[] = [];
      for (const node of nodes) {
        const source = node.textContent || "";
        const index = source.toLocaleLowerCase().indexOf(needle);
        if (index < 0 || !node.parentNode) continue;

        const mark = document.createElement("mark");
        mark.dataset.accessHighlight = "true";
        mark.className = "rounded bg-sky-400/30 px-0.5 text-white";
        mark.textContent = source.slice(index, index + needle.length);
        const before = source.slice(0, index);
        const after = source.slice(index + needle.length);
        if (before) node.parentNode.insertBefore(document.createTextNode(before), node);
        node.parentNode.insertBefore(mark, node);
        if (after) node.parentNode.insertBefore(document.createTextNode(after), node);
        node.parentNode.removeChild(node);
        found.push(mark);
      }
      matchesRef.current = found;
      setMatchCount(found.length);
      setMatchIndex(0);
      found[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [query, clearHighlights]);

  useEffect(() => () => clearHighlights(), [clearHighlights]);

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 500);
      let currentId = toc[0]?.id || "";
      for (const item of toc) {
        const element = document.getElementById(item.id);
        if (element && element.getBoundingClientRect().top <= window.innerHeight * 0.28) {
          currentId = item.id;
        } else if (element) {
          break;
        }
      }
      setActiveId(currentId);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [toc]);

  useEffect(() => {
    document.body.style.overflow = tocOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [tocOpen]);

  useEffect(() => {
    const onSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setSelectionPage(null);
        return;
      }
      const range = selection.getRangeAt(0);
      const element = range.startContainer instanceof Element
        ? range.startContainer
        : range.startContainer.parentElement;
      const page = element?.closest<HTMLElement>("[data-pdf-page]")?.dataset.pdfPage;
      if (!page) return setSelectionPage(null);
      const rectangle = range.getBoundingClientRect();
      setSelectionPage({
        label: page,
        x: rectangle.left + rectangle.width / 2,
        y: rectangle.top - 8,
      });
    };
    const clear = () => setSelectionPage(null);
    document.addEventListener("mouseup", onSelection);
    document.addEventListener("mousedown", clear);
    return () => {
      document.removeEventListener("mouseup", onSelection);
      document.removeEventListener("mousedown", clear);
    };
  }, []);

  function moveMatch(direction: number) {
    const matches = matchesRef.current;
    if (!matches.length) return;
    matches.forEach((match) => {
      match.className = "rounded bg-sky-400/30 px-0.5 text-white";
    });
    const nextIndex = (matchIndex + direction + matches.length) % matches.length;
    setMatchIndex(nextIndex);
    matches[nextIndex].className = "rounded bg-sky-400/80 px-0.5 text-white";
    matches[nextIndex].scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const heroImage = safeHref(settings.hero_image);
  const heroVideo = safeHref(settings.hero_video);
  const pdfUrl = safeHref(settings.pdf_url);

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      {selectionPage && (
        <div
          className="pointer-events-none fixed z-[80] -translate-x-1/2 -translate-y-full rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xl"
          style={{ left: selectionPage.x, top: selectionPage.y }}
        >
          Found on PDF page {selectionPage.label}
        </div>
      )}

      <section className="relative flex min-h-[520px] items-center justify-center overflow-hidden border-b border-white/[0.06]">
        {heroVideo && (
          <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
            <source src={heroVideo} />
          </video>
        )}
        {!heroVideo && heroImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${JSON.stringify(heroImage)})` }}
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.55),rgba(2,6,23,0.94))]" />
        <div className="absolute inset-0 grid-pattern opacity-25" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-xs font-semibold tracking-[0.16em] text-sky-300 uppercase backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Private document
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
            {settings.document_title}
          </h1>
          {settings.intro && (
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
              {settings.intro}
            </p>
          )}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-400">
            {settings.prepared_for && <span>Prepared for <strong className="text-white">{settings.prepared_for}</strong></span>}
            {settings.prepared_by && <span>Prepared by <strong className="text-white">{settings.prepared_by}</strong></span>}
            {settings.prepared_date && <span>{settings.prepared_date}</span>}
          </div>
          {pdfUrl && (
            <a
              href={pdfUrl}
              download={settings.allow_download || undefined}
              target={settings.allow_download ? undefined : "_blank"}
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400"
            >
              {settings.allow_download ? (
                <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
              ) : (
                <FileText className="h-4 w-4" aria-hidden="true" />
              )}
              {settings.allow_download ? "Download PDF" : "View PDF"}
            </a>
          )}
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:px-8">
        {toc.length > 0 && (
          <aside className="hidden w-64 shrink-0 xl:block">
            <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur">
              <label className="relative block">
                <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search document"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.035] py-2 pr-9 pl-9 text-xs text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-slate-500 hover:text-white" aria-label="Clear search">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </label>
              {query && (
                <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-slate-500">
                  <span>{matchCount ? `${matchIndex + 1} of ${matchCount}` : "No matches"}</span>
                  {matchCount > 0 && (
                    <span className="flex gap-1">
                      <button onClick={() => moveMatch(-1)} className="rounded p-1 hover:bg-white/[0.06] hover:text-white" aria-label="Previous result"><ChevronLeft className="h-3 w-3" /></button>
                      <button onClick={() => moveMatch(1)} className="rounded p-1 hover:bg-white/[0.06] hover:text-white" aria-label="Next result"><ChevronRight className="h-3 w-3" /></button>
                    </span>
                  )}
                </div>
              )}
              <p className="mt-5 mb-2 px-1 text-[10px] font-semibold tracking-[0.18em] text-sky-400 uppercase">Contents</p>
              <nav className="max-h-[calc(100vh-13rem)] overflow-y-auto pr-1">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`block border-l-2 py-1.5 text-xs leading-5 transition ${item.level === 1 ? "pl-3" : item.level === 2 ? "pl-6" : "pl-9"} ${activeId === item.id ? "border-sky-400 font-semibold text-sky-300" : "border-white/[0.06] text-slate-500 hover:border-white/20 hover:text-slate-300"}`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}

        <div ref={contentRef} className="min-w-0 flex-1 space-y-20">
          {sections.map((section) => <ProposalSection key={section.id} section={section} />)}
          {!sections.length && (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center text-slate-400">
              This document is being prepared. Please check back soon.
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-white/[0.06] px-6 py-8 text-center text-xs text-slate-600">
        Confidential · {settings.client_name || settings.prepared_for || "Authorized recipient"} · International Computer Exchange
      </footer>

      {toc.length > 0 && (
        <button
          onClick={() => setTocOpen(true)}
          className="fixed right-5 bottom-5 z-40 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 text-white shadow-xl shadow-sky-500/25 xl:hidden"
          aria-label="Open table of contents"
        >
          <List className="h-5 w-5" />
        </button>
      )}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed right-5 bottom-20 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-slate-800/90 text-white shadow-xl backdrop-blur xl:bottom-6"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}

      {tocOpen && (
        <div className="fixed inset-0 z-[70] xl:hidden">
          <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setTocOpen(false)} aria-label="Close table of contents" />
          <aside className="absolute right-0 bottom-0 left-0 max-h-[78vh] overflow-hidden rounded-t-3xl border-t border-white/10 bg-[#08101f] shadow-2xl">
            <header className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <p className="text-xs font-semibold tracking-[0.18em] text-sky-400 uppercase">Contents</p>
              <button onClick={() => setTocOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/[0.05] hover:text-white" aria-label="Close"><X className="h-5 w-5" /></button>
            </header>
            <nav className="max-h-[calc(78vh-4rem)] overflow-y-auto p-3">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setTocOpen(false)}
                  className={`block rounded-lg py-2.5 text-sm ${item.level === 1 ? "px-3" : item.level === 2 ? "mr-3 ml-5 px-3" : "mr-3 ml-9 px-3"} ${activeId === item.id ? "bg-sky-400/10 font-semibold text-sky-300" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"}`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </main>
  );
}
