import { jsPDF } from "jspdf";

export interface LegalPdfSection {
  title: string;
  content: string;
}

export interface LegalPdfDocument {
  title: string;
  intro: string;
  lastUpdated?: string;
  note?: string;
  sections: LegalPdfSection[];
}

function pdfText(value: string): string {
  return value
    .replace(/\\n/g, "\n")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/•/g, "-")
    .replace(/[^\x09\x0a\x0d\x20-\xff]/g, "");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "legal-document";
}

export async function downloadLegalPdf(legalDocument: LegalPdfDocument): Promise<void> {
  const isDark =
    document.documentElement.getAttribute("data-theme") === "dark" ||
    document.documentElement.classList.contains("dark-mode");
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4", compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const inset = 42;
  const contentWidth = pageWidth - inset * 2;
  const contentBottom = pageHeight - 48;
  const colors = isDark
    ? {
        background: [7, 17, 32] as const,
        foreground: [241, 245, 249] as const,
        body: [203, 213, 225] as const,
        muted: [148, 163, 184] as const,
        accent: [56, 189, 248] as const,
        rule: [45, 61, 81] as const,
      }
    : {
        background: [255, 255, 255] as const,
        foreground: [15, 23, 42] as const,
        body: [51, 65, 85] as const,
        muted: [100, 116, 139] as const,
        accent: [3, 105, 161] as const,
        rule: [203, 213, 225] as const,
      };
  const setFillColor = (color: readonly [number, number, number]) =>
    pdf.setFillColor(color[0], color[1], color[2]);
  const setTextColor = (color: readonly [number, number, number]) =>
    pdf.setTextColor(color[0], color[1], color[2]);
  const setDrawColor = (color: readonly [number, number, number]) =>
    pdf.setDrawColor(color[0], color[1], color[2]);

  let y = 0;
  const paintPage = () => {
    setFillColor(colors.background);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
  };
  const drawContinuationHeader = () => {
    paintPage();
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    setTextColor(colors.accent);
    pdf.text("INTERNATIONAL COMPUTER EXCHANGE, INC.", inset, 32);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    setTextColor(colors.muted);
    pdf.text(pdfText(legalDocument.title), pageWidth - inset, 32, { align: "right" });
    setDrawColor(colors.rule);
    pdf.setLineWidth(0.6);
    pdf.line(inset, 44, pageWidth - inset, 44);
    y = 68;
  };
  const addPage = () => {
    pdf.addPage();
    drawContinuationHeader();
  };
  const ensureRoom = (height: number) => {
    if (y + height > contentBottom) addPage();
  };
  const writeText = (value: string, fontSize: number, color: readonly [number, number, number], bold = false) => {
    const lines = pdf.splitTextToSize(pdfText(value), contentWidth) as string[];
    const measuredLineHeight = fontSize * 1.42;
    let offset = 0;
    while (offset < lines.length) {
      const availableLines = Math.max(1, Math.floor((contentBottom - y) / measuredLineHeight));
      const batch = lines.slice(offset, offset + availableLines);
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setFontSize(fontSize);
      setTextColor(color);
      pdf.text(batch, inset, y, { lineHeightFactor: 1.42 });
      y += batch.length * measuredLineHeight;
      offset += batch.length;
      if (offset < lines.length) addPage();
    }
  };

  paintPage();
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  setTextColor(colors.accent);
  pdf.text("INTERNATIONAL COMPUTER EXCHANGE, INC.", inset, 38);
  setDrawColor(colors.rule);
  pdf.setLineWidth(0.7);
  pdf.line(inset, 52, pageWidth - inset, 52);

  y = 94;
  writeText(legalDocument.title, 25, colors.foreground, true);
  y += 8;
  writeText(legalDocument.intro, 11, colors.body);
  y += 14;

  const metadata = [
    legalDocument.lastUpdated ? `Last updated: ${legalDocument.lastUpdated}` : "",
    legalDocument.note ?? "",
  ].filter(Boolean).join("   |   ");
  if (metadata) {
    ensureRoom(28);
    setFillColor(colors.rule);
    pdf.roundedRect(inset, y - 2, contentWidth, 0.7, 0.35, 0.35, "F");
    y += 14;
    writeText(metadata, 9, colors.muted);
    y += 16;
  }

  for (const section of legalDocument.sections) {
    ensureRoom(42);
    y += 8;
    writeText(section.title, 13, colors.foreground, true);
    y += 5;

    const paragraphs = pdfText(section.content).trim().split(/\n\s*\n/).filter(Boolean);
    for (const paragraph of paragraphs) {
      writeText(paragraph, 10, colors.body);
      y += 8;
    }
    y += 8;
  }

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    setDrawColor(colors.rule);
    pdf.setLineWidth(0.5);
    pdf.line(inset, pageHeight - 36, pageWidth - inset, pageHeight - 36);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    setTextColor(colors.muted);
    pdf.text("icesales.com  |  International Computer Exchange, Inc.", inset, pageHeight - 22);
    pdf.text(`${page} / ${pageCount}`, pageWidth - inset, pageHeight - 22, { align: "right" });
  }

  pdf.save(`${slugify(legalDocument.title)}.pdf`);
}
