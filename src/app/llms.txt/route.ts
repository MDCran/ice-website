import { getPageContent } from "@/lib/cms";

export const dynamic = "force-dynamic";

export async function GET() {
  const page = await getPageContent("for-ai");
  const section = page?.orderedSections.find((item) => item.section_key === "llms_txt");
  const body = page?.sections.llms_txt?.body;

  if (!page || section?.is_visible === false || typeof body !== "string") {
    return new Response("AI directory is not available.\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(body.endsWith("\n") ? body : `${body}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
