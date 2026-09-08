"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  Copy,
  ExternalLink,
  FileKey2,
  KeyRound,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

type GrantSummary = {
  id?: string;
  revoked_at?: string | null;
  view_count?: number;
};

type AccessPageSummary = {
  id: string;
  slug: string;
  title: string;
  updated_at?: string | null;
  settings: {
    status?: "draft" | "active" | "archived";
    client_name?: string;
    document_title?: string;
    grants?: GrantSummary[];
  };
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function statusClasses(status: string) {
  if (status === "active") return "bg-utility-success-50 text-utility-success-700 ring-utility-success-200";
  if (status === "archived") return "bg-utility-gray-100 text-utility-gray-600 ring-utility-gray-200";
  return "bg-utility-warning-50 text-utility-warning-700 ring-utility-warning-200";
}

export default function AccessPagesManager({
  initialPages,
  loadError,
  canDelete,
}: {
  initialPages: AccessPageSummary[];
  loadError: string | null;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<{ mode: "create" | "duplicate"; source?: AccessPageSummary } | null>(null);
  const [clientName, setClientName] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState(loadError);
  const [warning, setWarning] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return pages;
    return pages.filter((page) => [page.title, page.slug, page.settings.client_name]
      .some((value) => String(value ?? "").toLowerCase().includes(needle)));
  }, [pages, query]);

  async function refresh() {
    const response = await fetch("/api/admin/access-pages", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not refresh access pages.");
    setPages(result.pages ?? []);
    router.refresh();
  }

  function openCreate(source?: AccessPageSummary) {
    const nextTitle = source ? `${source.settings.document_title || source.title} copy` : "";
    setModal({ mode: source ? "duplicate" : "create", source });
    setClientName(source?.settings.client_name ?? "");
    setTitle(nextTitle);
    setSlug(source ? `${source.slug}-copy` : "");
    setSlugTouched(Boolean(source));
    setError(null);
    setWarning(null);
  }

  async function submitModal(event: React.FormEvent) {
    event.preventDefault();
    if (!modal) return;
    setBusy("modal");
    setError(null);
    try {
      const response = await fetch("/api/admin/access-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: modal.mode === "duplicate" ? "duplicate" : "create",
          id: modal.source?.id,
          client_name: clientName,
          prepared_for: clientName,
          document_title: title,
          slug,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create the access page.");
      setModal(null);
      await refresh();
      router.push(`/admin/access-pages/${result.page.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create the access page.");
    } finally {
      setBusy(null);
    }
  }

  async function runAction(page: AccessPageSummary, action: "archive" | "delete") {
    const prompt = action === "delete"
      ? `Permanently delete “${page.title}” and all of its access links? This cannot be undone.`
      : `Archive “${page.title}”? Existing links will stop working.`;
    if (!window.confirm(prompt)) return;
    setBusy(`${action}:${page.id}`);
    setError(null);
    setWarning(null);
    try {
      const response = await fetch("/api/admin/access-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id: page.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Could not ${action} the page.`);
      setWarning(typeof result.warning === "string" ? result.warning : null);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : `Could not ${action} the page.`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-xs">
            <FileKey2 className="size-5" />
          </span>
          <div>
            <h1 className="text-display-xs font-semibold text-primary">Access Pages</h1>
            <p className="mt-1 max-w-2xl text-sm text-tertiary">
              Create private, client-ready proposals and control exactly who can open each link.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => openCreate()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-solid px-4 text-sm font-semibold text-white shadow-xs transition hover:brightness-105"
        >
          <Plus className="size-4" />
          New access page
        </button>
      </div>

      <div className="mb-6 grid gap-3 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary md:grid-cols-3">
        {[
          ["1", "Build or duplicate", "Start fresh or copy an existing proposal."],
          ["2", "Review and activate", "Edit every section, image, date, and price."],
          ["3", "Create a private link", "Set a password, expiration, and view limit."],
        ].map(([step, heading, description]) => (
          <div key={step} className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-semibold text-white">{step}</span>
            <div>
              <p className="text-sm font-semibold text-primary">{heading}</p>
              <p className="mt-0.5 text-xs leading-5 text-tertiary">{description}</p>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div role="alert" className="mb-5 rounded-lg bg-utility-error-50 px-4 py-3 text-sm text-utility-error-700 ring-1 ring-utility-error-200">
          {error}
        </div>
      )}
      {warning && (
        <div role="status" className="mb-5 rounded-lg bg-utility-warning-50 px-4 py-3 text-sm text-utility-warning-800 ring-1 ring-utility-warning-200">
          {warning}
        </div>
      )}

      <div className="mb-5 flex items-center gap-2 rounded-xl bg-primary p-3 shadow-xs ring-1 ring-secondary">
        <Search className="ml-1 size-4 text-quaternary" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search client, title, or URL…"
          className="h-9 flex-1 border-0 bg-transparent text-sm text-primary outline-none placeholder:text-placeholder"
        />
        <span className="pr-2 text-xs text-tertiary">{filtered.length} page{filtered.length === 1 ? "" : "s"}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-primary px-6 py-16 text-center shadow-xs ring-1 ring-secondary">
          <FileKey2 className="mx-auto size-10 text-quaternary" />
          <h2 className="mt-4 text-lg font-semibold text-primary">{pages.length ? "No matching access pages" : "Create your first access page"}</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-tertiary">
            {pages.length ? "Try a different search." : "Use the proposal starter, then tailor the copy, visuals, pricing, and private access settings."}
          </p>
          {!pages.length && (
            <button type="button" onClick={() => openCreate()} className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-brand-solid px-4 text-sm font-semibold text-white">
              <Plus className="size-4" /> New access page
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((page) => {
            const status = page.settings.status || "draft";
            const grants = page.settings.grants ?? [];
            const activeLinks = grants.filter((grant) => !grant.revoked_at).length;
            const views = grants.reduce((sum, grant) => sum + Number(grant.view_count || 0), 0);
            return (
              <article key={page.id} className="rounded-2xl bg-primary p-5 shadow-xs ring-1 ring-secondary transition hover:ring-brand-secondary">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusClasses(status)}`}>{status}</span>
                      {page.settings.client_name && <span className="truncate text-xs font-medium text-tertiary">{page.settings.client_name}</span>}
                    </div>
                    <Link href={`/admin/access-pages/${page.id}`} className="mt-3 block truncate text-lg font-semibold text-primary hover:text-brand-secondary">
                      {page.settings.document_title || page.title}
                    </Link>
                    <p className="mt-1 truncate font-mono text-xs text-quaternary">/access/{page.slug}</p>
                  </div>
                  <Link href={`/admin/access-pages/${page.id}`} aria-label={`Edit ${page.title}`} className="rounded-lg p-2 text-tertiary ring-1 ring-secondary transition hover:bg-secondary hover:text-primary">
                    <ExternalLink className="size-4" />
                  </Link>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-secondary p-3 text-center">
                  <div><p className="text-lg font-semibold text-primary">{activeLinks}</p><p className="text-[11px] text-tertiary">Active links</p></div>
                  <div><p className="text-lg font-semibold text-primary">{views}</p><p className="text-[11px] text-tertiary">Link opens</p></div>
                  <div><p className="text-sm font-semibold text-primary">{page.updated_at ? new Date(page.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}</p><p className="text-[11px] text-tertiary">Updated</p></div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-secondary pt-4">
                  <Link href={`/admin/access-pages/${page.id}`} className="inline-flex h-9 items-center rounded-lg bg-brand-solid px-3 text-sm font-semibold text-white">Edit & share</Link>
                  <button type="button" onClick={() => openCreate(page)} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-secondary ring-1 ring-secondary hover:bg-secondary">
                    <Copy className="size-3.5" /> Duplicate
                  </button>
                  {status !== "archived" && (
                    <button type="button" disabled={Boolean(busy)} onClick={() => runAction(page, "archive")} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-tertiary hover:bg-secondary disabled:opacity-50">
                      {busy === `archive:${page.id}` ? <Loader2 className="size-3.5 animate-spin" /> : <Archive className="size-3.5" />} Archive
                    </button>
                  )}
                  {canDelete && (
                    <button type="button" disabled={Boolean(busy)} onClick={() => runAction(page, "delete")} className="ml-auto inline-flex size-9 items-center justify-center rounded-lg text-utility-error-600 hover:bg-utility-error-50 disabled:opacity-50" aria-label={`Delete ${page.title}`}>
                      {busy === `delete:${page.id}` ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !busy && setModal(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="access-page-dialog-title" className="w-full max-w-lg rounded-2xl bg-primary p-6 shadow-2xl ring-1 ring-secondary">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-primary_alt text-brand-secondary"><KeyRound className="size-5" /></span>
                <div>
                  <h2 id="access-page-dialog-title" className="text-lg font-semibold text-primary">{modal.mode === "duplicate" ? "Duplicate access page" : "New access page"}</h2>
                  <p className="mt-0.5 text-sm text-tertiary">{modal.mode === "duplicate" ? "Content is copied; private links are not." : "Start with a polished, editable proposal structure."}</p>
                </div>
              </div>
              <button type="button" disabled={Boolean(busy)} onClick={() => setModal(null)} className="rounded-lg p-2 text-quaternary hover:bg-secondary hover:text-primary" aria-label="Close"><X className="size-4" /></button>
            </div>

            <form onSubmit={submitModal} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-secondary">Client or recipient</span>
                <input value={clientName} onChange={(event) => {
                  const value = event.target.value;
                  setClientName(value);
                  if (!slugTouched && modal.mode === "create") setSlug(slugify(`${value} ${new Date().getFullYear()}`));
                }} placeholder="Acme Corporation" className="h-11 w-full rounded-lg border-0 bg-primary px-3 text-sm text-primary outline-none ring-1 ring-secondary placeholder:text-placeholder focus:ring-2 focus:ring-brand" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-secondary">Document title</span>
                <input required value={title} onChange={(event) => {
                  const value = event.target.value;
                  setTitle(value);
                  if (!slugTouched && !clientName) setSlug(slugify(value));
                }} placeholder="Infrastructure as a Service Proposal" className="h-11 w-full rounded-lg border-0 bg-primary px-3 text-sm text-primary outline-none ring-1 ring-secondary placeholder:text-placeholder focus:ring-2 focus:ring-brand" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-secondary">Private page URL</span>
                <div className="flex h-11 items-center rounded-lg bg-secondary px-3 ring-1 ring-secondary focus-within:ring-2 focus-within:ring-brand">
                  <span className="shrink-0 text-sm text-quaternary">/access/</span>
                  <input required value={slug} onChange={(event) => { setSlug(slugify(event.target.value)); setSlugTouched(true); }} className="min-w-0 flex-1 border-0 bg-transparent text-sm text-primary outline-none" />
                </div>
              </label>
              {error && <p role="alert" className="text-sm text-utility-error-600">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" disabled={Boolean(busy)} onClick={() => setModal(null)} className="h-10 rounded-lg px-4 text-sm font-semibold text-secondary ring-1 ring-secondary hover:bg-secondary">Cancel</button>
                <button type="submit" disabled={Boolean(busy)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-solid px-4 text-sm font-semibold text-white disabled:opacity-60">
                  {busy === "modal" && <Loader2 className="size-4 animate-spin" />}
                  {modal.mode === "duplicate" ? "Duplicate page" : "Create page"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
