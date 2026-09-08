import "server-only";

import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const ACCESS_FILES_BUCKET = "access-files";

const PRIVATE_URL_PREFIX = "private:";
const PAGE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_STORAGE_PATH_LENGTH = 1024;

type AdminClient = ReturnType<typeof createAdminClient>;

export interface AccessFileCleanupResult {
  removedPaths: string[];
  retainedPaths: string[];
  failedPaths: string[];
  errors: string[];
}

function emptyResult(): AccessFileCleanupResult {
  return {
    removedPaths: [],
    retainedPaths: [],
    failedPaths: [],
    errors: [],
  };
}

export function isValidAccessPageId(value: string): boolean {
  return PAGE_ID_PATTERN.test(value);
}

/**
 * Parse only the private URL format owned by the dedicated access-files bucket.
 * Storage paths are never URL-decoded, normalized, or allowed to traverse.
 */
export function privateAccessFilePath(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith(PRIVATE_URL_PREFIX)) return null;

  const path = value.slice(PRIVATE_URL_PREFIX.length);
  if (
    !path ||
    path.length > MAX_STORAGE_PATH_LENGTH ||
    path.startsWith("/") ||
    path.endsWith("/") ||
    path.includes("\\") ||
    path.includes("//") ||
    /[\u0000-\u001f\u007f]/.test(path)
  ) {
    return null;
  }

  const segments = path.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    return null;
  }

  return path;
}

export function accessPageUploadPath(pageId: string, fileName: string): string {
  if (!isValidAccessPageId(pageId)) throw new Error("Invalid access page id.");

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "proposal.pdf";
  const path = `${pageId}/${Date.now()}-${randomUUID()}-${safeName}`;
  if (!privateAccessFilePath(`${PRIVATE_URL_PREFIX}${path}`)) {
    throw new Error("Could not create a safe private storage path.");
  }
  return path;
}

async function isReferenced(
  admin: AdminClient,
  storagePath: string,
): Promise<{ referenced: boolean; error: string | null }> {
  const { data, error } = await admin
    .from("page_sections")
    .select("id")
    .eq("section_key", "access_settings")
    .contains("content", { pdf_url: `${PRIVATE_URL_PREFIX}${storagePath}` })
    .limit(1);

  if (error) return { referenced: true, error: error.message };
  return { referenced: Boolean(data?.length), error: null };
}

async function removeUnreferencedPaths(
  admin: AdminClient,
  paths: Iterable<string>,
): Promise<AccessFileCleanupResult> {
  const result = emptyResult();
  const removable: string[] = [];

  for (const path of new Set(paths)) {
    if (!privateAccessFilePath(`${PRIVATE_URL_PREFIX}${path}`)) continue;

    const reference = await isReferenced(admin, path);
    if (reference.error) {
      result.failedPaths.push(path);
      result.errors.push(`Could not verify references for ${path}: ${reference.error}`);
    } else if (reference.referenced) {
      result.retainedPaths.push(path);
    } else {
      removable.push(path);
    }
  }

  for (let index = 0; index < removable.length; index += 100) {
    const batch = removable.slice(index, index + 100);
    const { error } = await admin.storage.from(ACCESS_FILES_BUCKET).remove(batch);
    if (error) {
      result.failedPaths.push(...batch);
      result.errors.push(`Could not remove private access files: ${error.message}`);
    } else {
      result.removedPaths.push(...batch);
    }
  }

  return result;
}

/** Call only after the settings row successfully references nextPdfUrl. */
export async function cleanupReplacedPrivateAccessFile(
  previousPdfUrl: unknown,
  nextPdfUrl: unknown,
): Promise<AccessFileCleanupResult> {
  if (previousPdfUrl === nextPdfUrl) return emptyResult();
  const previousPath = privateAccessFilePath(previousPdfUrl);
  if (!previousPath) return emptyResult();
  return removeUnreferencedPaths(createAdminClient(), [previousPath]);
}

/**
 * Call after the page row has been deleted. In addition to its current PDF,
 * this removes abandoned uploads in the page's UUID-scoped folder while
 * retaining any object still referenced by another access page.
 */
export async function cleanupDeletedAccessPageFiles(
  pageId: string,
  previousPdfUrl: unknown,
): Promise<AccessFileCleanupResult> {
  const result = emptyResult();
  if (!isValidAccessPageId(pageId)) {
    result.errors.push("Refused to clean storage for an invalid access page id.");
    return result;
  }

  const admin = createAdminClient();
  const candidates = new Set<string>();
  const previousPath = privateAccessFilePath(previousPdfUrl);
  if (previousPath) candidates.add(previousPath);

  const pageFolder = pageId;
  const pageFolderPrefix = `${pageFolder}/`;
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await admin.storage.from(ACCESS_FILES_BUCKET).list(pageFolder, {
      limit: pageSize,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) {
      result.errors.push(`Could not list private access files for ${pageId}: ${error.message}`);
      break;
    }

    for (const item of data ?? []) {
      if (!item.id) continue;
      const candidate = `${pageFolderPrefix}${item.name}`;
      if (privateAccessFilePath(`${PRIVATE_URL_PREFIX}${candidate}`)) candidates.add(candidate);
    }
    if (!data || data.length < pageSize) break;
  }

  const removed = await removeUnreferencedPaths(admin, candidates);
  return {
    removedPaths: removed.removedPaths,
    retainedPaths: removed.retainedPaths,
    failedPaths: removed.failedPaths,
    errors: [...result.errors, ...removed.errors],
  };
}
