import { NextResponse } from "next/server";
import { requireAdminCapability } from "@/lib/admin/requireAdminCapability";
import {
  ACCESS_FILES_BUCKET,
  accessPageUploadPath,
  isValidAccessPageId,
} from "@/lib/access-pages/storage";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 50 * 1024 * 1024;

export async function POST(request: Request) {
  const auth = await requireAdminCapability("access.manage");
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const form = await request.formData().catch(() => null);
  const pageId = typeof form?.get("page_id") === "string" ? String(form.get("page_id")) : "";
  const file = form?.get("file");
  if (!isValidAccessPageId(pageId) || !(file instanceof File)) {
    return NextResponse.json({ error: "Choose a PDF to upload." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "PDF files must be smaller than 50 MB." }, { status: 400 });
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files can be uploaded here." }, { status: 400 });
  }

  const { data: accessMarker } = await auth.supabase
    .from("page_sections")
    .select("id")
    .eq("page_id", pageId)
    .eq("section_key", "access_settings")
    .maybeSingle();
  if (!accessMarker) return NextResponse.json({ error: "Access page not found." }, { status: 404 });

  const admin = createAdminClient();
  const { data: bucket } = await admin.storage.getBucket(ACCESS_FILES_BUCKET);
  if (!bucket) {
    const { error: bucketError } = await admin.storage.createBucket(ACCESS_FILES_BUCKET, {
      public: false,
      fileSizeLimit: MAX_FILE_BYTES,
      allowedMimeTypes: ["application/pdf"],
    });
    if (bucketError && !/already exists/i.test(bucketError.message)) {
      return NextResponse.json({ error: `Could not prepare private storage: ${bucketError.message}` }, { status: 500 });
    }
  } else if (bucket.public) {
    return NextResponse.json({ error: "The access-files bucket must be private before uploads are allowed." }, { status: 500 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "proposal.pdf";
  const storagePath = accessPageUploadPath(pageId, safeName);
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!bytes.subarray(0, 1024).includes(Buffer.from("%PDF-", "ascii"))) {
    return NextResponse.json({ error: "The selected file is not a valid PDF." }, { status: 400 });
  }
  const { error: uploadError } = await admin.storage.from(ACCESS_FILES_BUCKET).upload(storagePath, bytes, {
    contentType: "application/pdf",
    cacheControl: "0",
    upsert: false,
  });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });

  return NextResponse.json({ pdf_url: `private:${storagePath}`, file_name: safeName });
}
