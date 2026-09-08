import { NextRequest, NextResponse } from "next/server";
import { accessSessionCookieName } from "@/lib/access-pages/crypto";
import {
  getAccessPageBySlug,
  isValidAccessSlug,
  validateSession,
} from "@/lib/access-pages/server";
import {
  ACCESS_FILES_BUCKET,
  privateAccessFilePath,
} from "@/lib/access-pages/storage";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
};

function denied() {
  return NextResponse.json({ error: "Document not available." }, { status: 404, headers: PRIVATE_HEADERS });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const cleanSlug = slug.trim();
  if (!isValidAccessSlug(cleanSlug)) return denied();

  try {
    const page = await getAccessPageBySlug(cleanSlug);
    if (!page || !page.settings.pdf_url.startsWith("private:")) return denied();

    const session = validateSession(
      page,
      request.cookies.get(accessSessionCookieName(cleanSlug))?.value,
    );
    if (!session) return denied();

    const storagePath = privateAccessFilePath(page.settings.pdf_url);
    if (
      !storagePath ||
      (!storagePath.startsWith(`${page.id}/`) &&
        !storagePath.startsWith(`${cleanSlug}/`))
    ) {
      return denied();
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from(ACCESS_FILES_BUCKET)
      .download(storagePath);
    if (error || !data) return denied();

    const fallbackName = `${cleanSlug}.pdf`;
    const sourceName = storagePath.split("/").pop() || fallbackName;
    const fileName = sourceName.replace(/[^a-zA-Z0-9._-]/g, "_") || fallbackName;
    const disposition = page.settings.allow_download ? "attachment" : "inline";
    return new NextResponse(data, {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        "Content-Type": data.type || "application/pdf",
        "Content-Disposition": `${disposition}; filename="${fileName}"`,
      },
    });
  } catch {
    return denied();
  }
}
