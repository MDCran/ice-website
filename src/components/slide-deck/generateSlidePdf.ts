/**
 * Generates a PDF slide deck using modern-screenshot (supports lab/oklch colors)
 * and jsPDF. Each slide is captured at 2× for print quality.
 * Pages are 16:9 landscape — slides only, no margins or chrome.
 *
 * Yields to the main thread between slides so the UI stays responsive.
 */

/** Yield to the browser so animations/repaints happen between heavy work */
const yieldToUI = () =>
  new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

export default async function generateSlidePdf(
  container: HTMLElement,
  onProgress?: (current: number, total: number) => void,
) {
  await document.fonts.ready;

  const [{ domToPng }, { jsPDF }] = await Promise.all([
    import("modern-screenshot"),
    import("jspdf"),
  ]);

  const slides = container.querySelectorAll<HTMLElement>("[data-slide]");
  if (slides.length === 0) return;

  const W = 1920;
  const H = 1080;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [W, H],
    compress: true,
  });

  for (let i = 0; i < slides.length; i++) {
    onProgress?.(i + 1, slides.length);
    await yieldToUI(); // let the UI repaint (spinner, progress text)

    const slide = slides[i];

    const dataUrl = await domToPng(slide, {
      scale: 2,
      width: 960,
      height: 540,
      backgroundColor: "#020617",
      style: {
        transform: "none",
      },
    });

    if (i > 0) pdf.addPage([W, H], "landscape");
    pdf.addImage(dataUrl, "PNG", 0, 0, W, H);
  }

  onProgress?.(slides.length, slides.length);
  await yieldToUI();

  pdf.save("Carico-IaaS_Hosting_DECK.pdf");
}
