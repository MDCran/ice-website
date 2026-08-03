"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BarChartSquare02,
  CheckCircle,
  Clock,
  CodeBrowser,
  Download01,
  Eye,
  FilePlus02,
  Mail01,
  Monitor01,
  Plus,
  SearchLg,
  Send01,
  Phone01,
  Trash01,
  UploadCloud02,
  Users01,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Input } from "@/components/base/input/input";
import { cx } from "@/utils/cx";
import { MARKETING_TEMPLATE_PRESETS, cloneTemplateBlocks, type EmailBlock, type EmailBlockType, type MarketingTemplatePreset } from "@/lib/marketing/templates";
import { renderMarketingEmail } from "@/lib/marketing/renderEmail";
import { campaignTypeLabel } from "@/lib/marketing/preferences";

type Tab = "overview" | "audience" | "studio" | "campaigns";
type Contact = { id: string; first_name: string | null; last_name: string | null; email: string; phone: string | null; company: string | null; source: string; tags: string[]; email_consent_status: string; marketing_preferences?: Record<string, boolean>; suppressed_at: string | null; last_emailed_at: string | null; created_at: string };
type List = { id: string; name: string; description: string | null; member_count: number; created_at: string };
type Member = { list_id: string; contact_id: string };
type Campaign = { id: string; name: string; campaign_type: string; status: string; list_id: string | null; subject: string; preheader: string; blocks: EmailBlock[]; scheduled_at: string | null; sent_at: string | null; recipient_count: number; delivered_count: number; opened_count: number; clicked_count: number; bounced_count: number; complained_count: number; unsubscribed_count: number; created_at: string };
type ApiData = { contacts: Contact[]; lists: List[]; members: Member[]; campaigns: Campaign[]; templates: unknown[]; resendConnected: boolean };
type ImportRow = { first_name: string; last_name: string; email: string; phone: string; company: string; source: string; tags: string[]; email_consent_status: "subscribed" | "unknown" };

const TABS: Array<{ id: Tab; label: string; icon: typeof Mail01 }> = [
  { id: "overview", label: "Overview", icon: BarChartSquare02 },
  { id: "audience", label: "Audience & lists", icon: Users01 },
  { id: "studio", label: "Email studio", icon: CodeBrowser },
  { id: "campaigns", label: "Campaigns", icon: Send01 },
];

const BLOCK_LABELS: Record<EmailBlockType, string> = {
  hero: "Hero", text: "Text", button: "Button", service: "Service card", notice: "Notice", metric: "Metric", divider: "Divider", spacer: "Spacer",
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && quoted && text[index + 1] === '"') { cell += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) { row.push(cell.trim()); cell = ""; }
    else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; cell = "";
    } else cell += character;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeHeader(value: string) {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const aliases: Record<string, string> = { firstname: "first_name", first: "first_name", lastname: "last_name", last: "last_name", email_address: "email", telephone: "phone", mobile: "phone", business: "company", organization: "company" };
  return aliases[normalized] ?? normalized;
}

function csvToContacts(text: string, subscribed: boolean): ImportRow[] {
  const rows = parseCsv(text);
  const headers = (rows.shift() ?? []).map(normalizeHeader);
  return rows.map((values) => {
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    return {
      first_name: record.first_name ?? "",
      last_name: record.last_name ?? "",
      email: record.email ?? "",
      phone: record.phone ?? "",
      company: record.company ?? "",
      source: record.source || "csv_import",
      tags: (record.tags || "").split(/[;|]/).map((tag) => tag.trim()).filter(Boolean),
      email_consent_status: subscribed ? ("subscribed" as const) : ("unknown" as const),
    };
  }).filter((row) => row.email);
}

function statusColor(status: string): "success" | "warning" | "error" | "brand" | "gray" {
  if (["sent", "subscribed", "approved"].includes(status)) return "success";
  if (["review", "scheduled", "sending", "unknown"].includes(status)) return "warning";
  if (["cancelled", "unsubscribed"].includes(status)) return "error";
  return "gray";
}

function StatCard({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail: string; icon: typeof Mail01 }) {
  return (
    <div className="rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary">
      <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-tertiary">{label}</p><p className="mt-2 text-display-xs font-semibold text-primary">{value}</p></div><span className="flex size-10 items-center justify-center rounded-lg bg-brand-primary text-fg-brand-primary"><Icon className="size-5" /></span></div>
      <p className="mt-3 text-xs text-quaternary">{detail}</p>
    </div>
  );
}

export default function MarketingCenter() {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [consentFilter, setConsentFilter] = useState("all");
  const [listFilter, setListFilter] = useState("all");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [newListName, setNewListName] = useState("");
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importListId, setImportListId] = useState("");
  const [importSubscribed, setImportSubscribed] = useState(false);
  const [templateCategory, setTemplateCategory] = useState("all");
  const [templateQuery, setTemplateQuery] = useState("");
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [campaignType, setCampaignType] = useState("marketing");
  const [campaignStatus, setCampaignStatus] = useState("draft");
  const [campaignListId, setCampaignListId] = useState("");
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [darkPreview, setDarkPreview] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true); setError("");
    const response = await fetch("/api/admin/marketing", { cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) setError(result.setupRequired ? "Marketing Center database tables are not installed yet. Apply the 20260802_marketing_center migration, then reload this page." : result.error || "Could not load Marketing Center.");
    else setData(result);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const post = async (payload: Record<string, unknown>) => {
    setBusy(true); setError(""); setNotice("");
    const response = await fetch("/api/admin/marketing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) { setError(result.error || "The request could not be completed."); return null; }
    return result;
  };

  const subscribed = data?.contacts.filter((contact) => contact.email_consent_status === "subscribed" && !contact.suppressed_at).length ?? 0;
  const suppressed = data?.contacts.filter((contact) => Boolean(contact.suppressed_at)).length ?? 0;
  const sentCampaigns = data?.campaigns.filter((campaign) => campaign.status === "sent") ?? [];
  const totalDelivered = sentCampaigns.reduce((sum, campaign) => sum + campaign.delivered_count, 0);
  const totalOpened = sentCampaigns.reduce((sum, campaign) => sum + campaign.opened_count, 0);

  const filteredContacts = useMemo(() => {
    const listContactIds = listFilter === "all" ? null : new Set(data?.members.filter((member) => member.list_id === listFilter).map((member) => member.contact_id));
    const search = query.trim().toLowerCase();
    return (data?.contacts ?? []).filter((contact) => {
      if (consentFilter !== "all" && contact.email_consent_status !== consentFilter) return false;
      if (listContactIds && !listContactIds.has(contact.id)) return false;
      if (!search) return true;
      return [contact.first_name, contact.last_name, contact.email, contact.company, contact.phone, contact.source, ...(contact.tags ?? [])].some((value) => String(value ?? "").toLowerCase().includes(search));
    });
  }, [consentFilter, data, listFilter, query]);

  const previewHtml = useMemo(() => renderMarketingEmail({ preheader, blocks, includeUnsubscribe: campaignType !== "transactional" }), [blocks, campaignType, preheader]);

  const chooseTemplate = (template: MarketingTemplatePreset) => {
    setCampaignId(null);
    setCampaignName(template.name);
    setCampaignType(template.transactional ? "transactional" : template.category === "maintenance" ? "maintenance" : "marketing");
    setSubject(template.subject); setPreheader(template.preheader); setBlocks(cloneTemplateBlocks(template.blocks));
    setTab("studio"); setNotice(`${template.name} loaded. Customize it before saving.`);
  };

  const editCampaign = (campaign: Campaign) => {
    setCampaignId(campaign.id); setCampaignName(campaign.name); setCampaignType(campaign.campaign_type); setCampaignStatus(campaign.status); setCampaignListId(campaign.list_id ?? ""); setSubject(campaign.subject); setPreheader(campaign.preheader); setBlocks(campaign.blocks ?? []); setScheduledAt(campaign.scheduled_at?.slice(0, 16) ?? ""); setTab("studio");
  };

  const saveCampaign = async () => {
    const result = await post({ action: "save_campaign", id: campaignId, name: campaignName, campaignType, status: campaignStatus, listId: campaignListId, subject, preheader, blocks, scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null, fromName: "International Computer Exchange", fromEmail: "marketing@icesales.com", replyTo: "info@icesales.com" });
    if (result?.campaign) { setCampaignId(result.campaign.id); setNotice("Campaign saved."); await load(); }
  };

  const updateBlock = (id: string, values: Partial<EmailBlock>) => setBlocks((current) => current.map((item) => item.id === id ? { ...item, ...values } : item));
  const moveBlock = (index: number, direction: -1 | 1) => setBlocks((current) => { const target = index + direction; if (target < 0 || target >= current.length) return current; const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next; });
  const addBlock = (type: EmailBlockType) => setBlocks((current) => [...current, { id: `${type}-${Date.now()}`, type, heading: type === "hero" ? "A clear, outcome-first headline" : "Section heading", body: type === "button" ? undefined : "Add concise, useful copy for the reader.", label: type === "button" ? "Talk with an ICE specialist" : undefined, href: type === "button" ? "https://www.icesales.com/contact" : undefined, value: type === "metric" ? "24/7" : undefined }]);

  if (loading) return <div className="flex min-h-80 items-center justify-center text-sm text-tertiary">Loading Marketing Center…</div>;

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div><p className="text-xs font-semibold tracking-[0.2em] text-brand-secondary uppercase">ICE growth operations</p><h1 className="mt-2 text-display-xs font-semibold text-primary md:text-display-sm">Marketing Center</h1><p className="mt-2 max-w-3xl text-sm text-tertiary">Manage consent-aware audiences, build on-brand emails, schedule campaigns, and understand engagement from one workspace.</p></div>
        <div className="flex flex-wrap items-center gap-2"><Badge size="md" color={data?.resendConnected ? "success" : "warning"}>{data?.resendConnected ? "Resend connected" : "Resend not connected"}</Badge><Button size="md" iconLeading={FilePlus02} onClick={() => { setTab("studio"); setCampaignId(null); setCampaignName(""); setSubject(""); setPreheader(""); setBlocks([]); }}>New email</Button></div>
      </div>

      <section className="overflow-hidden rounded-xl bg-brand-primary_alt/60 ring-1 ring-brand/20">
        <div className="border-b border-brand/15 px-5 py-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-brand-secondary uppercase">How this workspace works</p>
          <h2 className="mt-1 text-lg font-semibold text-primary">From audience to sent message</h2>
          <p className="mt-1 max-w-3xl text-sm text-tertiary">Use Audience to decide who can receive messages, Email Studio to build and preview content, and Campaigns to review, schedule, send, and measure it.</p>
        </div>
        <div className="grid gap-px bg-brand/15 sm:grid-cols-3">
          {[["Audience", "Consent-aware contacts and reusable lists."], ["Email Studio", "Templates, content blocks, and live previews."], ["Campaigns", "Approval, delivery, and engagement results."]].map(([title, description], index) => (
            <button key={title} type="button" onClick={() => setTab((index === 0 ? "audience" : index === 1 ? "studio" : "campaigns") as Tab)} className="bg-primary/70 p-4 text-left transition hover:bg-primary">
              <span className="text-xs font-bold text-brand-secondary">0{index + 1}</span>
              <span className="mt-2 block text-sm font-semibold text-primary">{title}</span>
              <span className="mt-1 block text-xs leading-relaxed text-tertiary">{description}</span>
            </button>
          ))}
        </div>
      </section>

      {error && <div role="alert" className="flex items-start gap-3 rounded-xl bg-error-primary p-4 text-sm text-error-primary ring-1 ring-error_subtle"><AlertCircle className="mt-0.5 size-5 shrink-0" /><span>{error}</span></div>}
      {notice && <div role="status" className="flex items-start gap-3 rounded-xl bg-success-primary p-4 text-sm text-success-primary ring-1 ring-success_subtle"><CheckCircle className="mt-0.5 size-5 shrink-0" /><span>{notice}</span></div>}

      <nav className="grid gap-2 rounded-xl bg-primary p-2 ring-1 ring-secondary sm:grid-cols-4" aria-label="Marketing Center sections">
        {TABS.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => setTab(item.id)} className={cx("inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition", tab === item.id ? "bg-brand-solid text-white" : "text-secondary hover:bg-secondary")}><Icon className="size-4" />{item.label}</button>; })}
      </nav>

      {tab === "overview" && (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Marketable contacts" value={subscribed} detail="Explicitly subscribed and not suppressed" icon={Users01} /><StatCard label="Saved lists" value={data?.lists.length ?? 0} detail="Reusable audiences and imported books" icon={Download01} /><StatCard label="Campaigns sent" value={sentCampaigns.length} detail={`${totalDelivered} total delivered`} icon={Send01} /><StatCard label="Recorded opens" value={totalOpened} detail="Updated through the Resend webhook" icon={Eye} /></section>
          <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-xl bg-primary p-6 ring-1 ring-secondary"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold text-primary">Recent campaigns</h2><p className="mt-1 text-sm text-tertiary">Drafts, approvals, schedules, and delivery results.</p></div><button className="text-sm font-semibold text-brand-secondary" onClick={() => setTab("campaigns")}>View all</button></div><div className="mt-5 space-y-3">{(data?.campaigns ?? []).slice(0, 5).map((campaign) => <button key={campaign.id} onClick={() => editCampaign(campaign)} className="flex w-full items-center justify-between gap-4 rounded-lg bg-secondary p-4 text-left ring-1 ring-secondary hover:ring-brand"><div><p className="text-sm font-semibold text-primary">{campaign.name}</p><p className="mt-1 text-xs text-tertiary">{campaign.subject}</p></div><Badge size="sm" color={statusColor(campaign.status)}>{campaign.status}</Badge></button>)}{!data?.campaigns.length && <p className="rounded-lg border border-dashed border-secondary p-6 text-center text-sm text-quaternary">No campaigns yet. Start from a template in Email Studio.</p>}</div></div>
            <div className="rounded-xl bg-primary p-6 ring-1 ring-secondary"><h2 className="text-lg font-semibold text-primary">Sending readiness</h2><div className="mt-5 space-y-3">{[[true, "Audience consent model", `${subscribed} eligible contacts`], [suppressed === 0, "Suppression monitoring", `${suppressed} suppressed contacts`], [Boolean(data?.resendConnected), "Resend connection", data?.resendConnected ? "Ready for test and campaign sends" : "Add API and webhook credentials"], [true, "Brand system", `${MARKETING_TEMPLATE_PRESETS.length} starter templates`]].map(([ok, label, detail]) => <div key={String(label)} className="flex items-start gap-3 rounded-lg bg-secondary p-3 ring-1 ring-secondary">{ok ? <CheckCircle className="mt-0.5 size-5 text-fg-success-primary" /> : <Clock className="mt-0.5 size-5 text-fg-warning-primary" />}<div><p className="text-sm font-semibold text-primary">{String(label)}</p><p className="text-xs text-tertiary">{String(detail)}</p></div></div>)}</div><div className="mt-5 grid gap-2 sm:grid-cols-2"><Link href="/admin/sales" className="rounded-lg bg-secondary px-3 py-2 text-center text-sm font-semibold text-brand-secondary ring-1 ring-secondary hover:ring-brand">Website CTA controls</Link><Link href="/admin/cms" className="rounded-lg bg-secondary px-3 py-2 text-center text-sm font-semibold text-brand-secondary ring-1 ring-secondary hover:ring-brand">CMS content</Link></div></div>
          </section>
        </div>
      )}

      {tab === "audience" && (
        <div className="space-y-6">
          <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-xl bg-primary p-5 ring-1 ring-secondary"><h2 className="text-lg font-semibold text-primary">Create a list</h2><p className="mt-1 text-sm text-tertiary">Save groups such as Old Book of Business or QuickBooks Customers.</p><div className="mt-4 flex gap-3"><div className="flex-1"><Input label="List name" value={newListName} onChange={setNewListName} placeholder="Old book of business" /></div><Button className="self-end" iconLeading={Plus} isDisabled={!newListName.trim() || busy} onClick={async () => { const result = await post({ action: "create_list", name: newListName }); if (result) { setNewListName(""); setNotice("List created."); await load(); } }}>Create</Button></div><div className="mt-4 flex flex-wrap gap-2">{data?.lists.map((list) => <button key={list.id} onClick={() => setListFilter(list.id)} className="rounded-full bg-secondary px-3 py-2 text-sm font-semibold text-secondary ring-1 ring-secondary hover:ring-brand">{list.name} · {list.member_count}</button>)}</div></div>
            <div className="rounded-xl bg-primary p-5 ring-1 ring-secondary"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-primary">Import CSV</h2><p className="mt-1 text-sm text-tertiary">Accepts first name, last name, email, phone, company, source, and tags.</p></div><Button color="secondary" size="sm" iconLeading={UploadCloud02} onClick={() => fileRef.current?.click()}>Choose CSV</Button></div><input ref={fileRef} className="sr-only" type="file" accept=".csv,text/csv" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setImportRows(csvToContacts(await file.text(), importSubscribed)); }} /><label className="mt-4 flex items-start gap-3 rounded-lg bg-secondary p-3 text-sm text-secondary ring-1 ring-secondary"><input type="checkbox" checked={importSubscribed} onChange={(event) => setImportSubscribed(event.target.checked)} className="mt-0.5 size-4 accent-brand-solid" /><span><strong className="block text-primary">I can document marketing permission for this file</strong>Leave unchecked when consent is unknown. Unknown contacts remain saved but cannot receive promotional campaigns.</span></label>{importRows.length > 0 && <div className="mt-4"><p className="text-sm font-semibold text-primary">{importRows.length} rows ready</p><div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]"><select value={importListId} onChange={(event) => setImportListId(event.target.value)} className="rounded-lg bg-primary px-3 py-2 text-sm text-primary ring-1 ring-secondary"><option value="">No list</option>{data?.lists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}</select><Button isDisabled={busy} onClick={async () => { const rows = importRows.map((row) => ({ ...row, email_consent_status: importSubscribed ? "subscribed" : "unknown" })); const result = await post({ action: "import_contacts", rows, listId: importListId }); if (result) { setNotice(`Import complete: ${result.imported} new, ${result.updated} updated, ${result.skipped} skipped.`); setImportRows([]); await load(); } }}>Import contacts</Button></div><div className="mt-3 max-h-28 overflow-auto rounded-lg bg-secondary p-3 text-xs text-tertiary">{importRows.slice(0, 8).map((row) => <div key={row.email}>{row.first_name} {row.last_name} · {row.email}</div>)}</div></div>}</div>
          </section>

          <section className="rounded-xl bg-primary ring-1 ring-secondary">
            <div className="border-b border-secondary p-5"><div className="flex flex-col gap-3 xl:flex-row xl:items-end"><div className="flex-1"><Input label="Search audience" icon={SearchLg} value={query} onChange={setQuery} placeholder="Name, email, company, tag, or source" /></div><label className="text-sm font-medium text-secondary">Consent<select value={consentFilter} onChange={(event) => setConsentFilter(event.target.value)} className="mt-1 block rounded-lg bg-primary px-3 py-2.5 text-sm ring-1 ring-secondary"><option value="all">All statuses</option><option value="subscribed">Subscribed</option><option value="unknown">Unknown</option><option value="unsubscribed">Unsubscribed</option><option value="transactional_only">Transactional only</option></select></label><label className="text-sm font-medium text-secondary">List<select value={listFilter} onChange={(event) => setListFilter(event.target.value)} className="mt-1 block rounded-lg bg-primary px-3 py-2.5 text-sm ring-1 ring-secondary"><option value="all">All contacts</option>{data?.lists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}</select></label></div>{selectedContacts.length > 0 && <div className="mt-4 flex flex-wrap items-end gap-3"><span className="text-sm font-semibold text-primary">{selectedContacts.length} selected</span><select id="bulk-list" className="rounded-lg bg-primary px-3 py-2 text-sm ring-1 ring-secondary"><option value="">Choose list…</option>{data?.lists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}</select><Button size="sm" onClick={async () => { const select = document.getElementById("bulk-list") as HTMLSelectElement; const result = await post({ action: "add_to_list", listId: select.value, contactIds: selectedContacts }); if (result) { setNotice(`${result.added} contacts added to the list.`); setSelectedContacts([]); await load(); } }}>Add to list</Button></div>}</div>
            <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="bg-secondary text-xs font-semibold text-quaternary uppercase"><tr><th className="px-5 py-3"><input aria-label="Select all visible contacts" type="checkbox" checked={filteredContacts.length > 0 && filteredContacts.every((contact) => selectedContacts.includes(contact.id))} onChange={(event) => setSelectedContacts(event.target.checked ? filteredContacts.map((contact) => contact.id) : [])} /></th><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Company / phone</th><th className="px-5 py-3">Source</th><th className="px-5 py-3">Consent</th><th className="px-5 py-3">Last emailed</th></tr></thead><tbody>{filteredContacts.map((contact) => <tr key={contact.id} className="border-t border-secondary"><td className="px-5 py-4"><input aria-label={`Select ${contact.email}`} type="checkbox" checked={selectedContacts.includes(contact.id)} onChange={(event) => setSelectedContacts((current) => event.target.checked ? [...current, contact.id] : current.filter((id) => id !== contact.id))} /></td><td className="px-5 py-4"><p className="text-sm font-semibold text-primary">{[contact.first_name, contact.last_name].filter(Boolean).join(" ") || "Unnamed"}</p><p className="text-xs text-tertiary">{contact.email}</p></td><td className="px-5 py-4 text-sm text-secondary">{contact.company || "—"}<span className="block text-xs text-tertiary">{contact.phone || "—"}</span></td><td className="px-5 py-4 text-sm text-secondary">{contact.source.replace(/_/g, " ")}</td><td className="px-5 py-4"><button onClick={async () => { const next = contact.email_consent_status === "subscribed" ? "unsubscribed" : "subscribed"; const result = await post({ action: "set_consent", contactId: contact.id, status: next }); if (result) await load(); }}><Badge size="sm" color={statusColor(contact.email_consent_status)}>{contact.email_consent_status.replace(/_/g, " ")}</Badge></button>{contact.suppressed_at && <span className="ml-2 text-xs text-error-primary">Suppressed</span>}</td><td className="px-5 py-4 text-xs text-tertiary">{contact.last_emailed_at ? new Date(contact.last_emailed_at).toLocaleDateString() : "Never"}</td></tr>)}</tbody></table>{filteredContacts.length === 0 && <p className="p-10 text-center text-sm text-quaternary">No contacts match these filters.</p>}</div>
          </section>
        </div>
      )}

      {tab === "studio" && (
        <div className="space-y-6">
          <section className="rounded-xl bg-primary p-5 ring-1 ring-secondary"><div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between"><div><h2 className="text-lg font-semibold text-primary">Template library</h2><p className="mt-1 text-sm text-tertiary">Start with an ICE-branded service, billing, customer, maintenance, or holiday message.</p></div><div className="flex flex-wrap gap-2"><label className="relative"><span className="sr-only">Search templates</span><SearchLg className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-quaternary" /><input value={templateQuery} onChange={(event) => setTemplateQuery(event.target.value)} placeholder="Search templates..." className="rounded-lg bg-primary py-2 pl-9 pr-3 text-sm ring-1 ring-secondary outline-none focus:ring-2 focus:ring-brand" /></label><select value={templateCategory} onChange={(event) => setTemplateCategory(event.target.value)} className="rounded-lg bg-primary px-3 py-2 text-sm ring-1 ring-secondary"><option value="all">All categories</option><option value="services">Services</option><option value="billing">Billing</option><option value="messages">Messages</option><option value="maintenance">Maintenance</option><option value="holidays">U.S. holidays</option></select></div></div><div className="mt-5 flex snap-x gap-3 overflow-x-auto pb-2">{MARKETING_TEMPLATE_PRESETS.filter((template) => (templateCategory === "all" || template.category === templateCategory) && (!templateQuery.trim() || `${template.name} ${template.description}`.toLowerCase().includes(templateQuery.trim().toLowerCase()))).map((template) => <button key={template.id} onClick={() => chooseTemplate(template)} className="min-w-64 snap-start rounded-xl bg-secondary p-4 text-left ring-1 ring-secondary transition hover:-translate-y-0.5 hover:ring-brand"><Badge size="sm" color={template.transactional ? "gray" : "brand"}>{template.category}</Badge><p className="mt-3 text-sm font-semibold text-primary">{template.name}</p><p className="mt-1 text-xs leading-5 text-tertiary">{template.description}</p></button>)}</div></section>

          <section className="grid gap-6 2xl:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]">
            <div className="space-y-5">
              <div className="rounded-xl bg-primary p-5 ring-1 ring-secondary"><div className="grid gap-4 md:grid-cols-2"><Input label="Campaign name" value={campaignName} onChange={setCampaignName} placeholder="Q3 IBM i modernization" /><label className="text-sm font-medium text-secondary">Message type<select value={campaignType} onChange={(event) => setCampaignType(event.target.value)} className="mt-1.5 block w-full rounded-lg bg-primary px-3 py-2.5 text-sm ring-1 ring-secondary"><option value="marketing">Marketing materials</option><option value="billing">Billing</option><option value="private_message">Private message</option><option value="special_message">Special message</option><option value="event">Event / webinar</option><option value="service_update">Service update</option><option value="transactional">Transactional</option><option value="maintenance">Maintenance</option><option value="service_alert">Service alert</option></select><span className="mt-1 block text-xs text-quaternary">Recipients are checked against this preference before delivery.</span></label><div className="md:col-span-2"><Input label="Subject line" value={subject} onChange={setSubject} placeholder="A clear reason to open this email" /></div><div className="md:col-span-2"><Input label="Preheader" value={preheader} onChange={setPreheader} placeholder="Supporting text shown in the inbox preview" /></div><label className="text-sm font-medium text-secondary">Audience list<select value={campaignListId} onChange={(event) => setCampaignListId(event.target.value)} className="mt-1.5 block w-full rounded-lg bg-primary px-3 py-2.5 text-sm ring-1 ring-secondary"><option value="">Choose later</option>{data?.lists.map((list) => <option key={list.id} value={list.id}>{list.name} · {list.member_count}</option>)}</select></label><label className="text-sm font-medium text-secondary">Workflow status<select value={campaignStatus} onChange={(event) => setCampaignStatus(event.target.value)} className="mt-1.5 block w-full rounded-lg bg-primary px-3 py-2.5 text-sm ring-1 ring-secondary"><option value="draft">Draft</option><option value="review">Internal review</option><option value="approved">Approved</option><option value="scheduled">Scheduled</option></select></label>{campaignStatus === "scheduled" && <label className="text-sm font-medium text-secondary md:col-span-2">Send date and time<input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="mt-1.5 block w-full rounded-lg bg-primary px-3 py-2.5 text-sm ring-1 ring-secondary" /></label>}</div></div>

              <div className="rounded-xl bg-primary p-5 ring-1 ring-secondary"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-primary">Content blocks</h2><p className="mt-1 text-sm text-tertiary">Arrange accessible, email-safe sections using the ICE brand system.</p></div><select defaultValue="" onChange={(event) => { if (event.target.value) addBlock(event.target.value as EmailBlockType); event.target.value = ""; }} className="rounded-lg bg-primary px-3 py-2 text-sm ring-1 ring-secondary"><option value="">+ Add block</option>{Object.entries(BLOCK_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></div><div className="mt-5 space-y-3">{blocks.map((item, index) => <div key={item.id} className="rounded-xl bg-secondary p-4 ring-1 ring-secondary"><div className="flex items-center justify-between gap-3"><Badge size="sm" color="brand">{BLOCK_LABELS[item.type]}</Badge><div className="flex gap-1"><button aria-label="Move block up" onClick={() => moveBlock(index, -1)} className="rounded-md p-1.5 text-tertiary hover:bg-primary"><ArrowUp className="size-4" /></button><button aria-label="Move block down" onClick={() => moveBlock(index, 1)} className="rounded-md p-1.5 text-tertiary hover:bg-primary"><ArrowDown className="size-4" /></button><button aria-label="Delete block" onClick={() => setBlocks((current) => current.filter((block) => block.id !== item.id))} className="rounded-md p-1.5 text-error-primary hover:bg-primary"><Trash01 className="size-4" /></button></div></div>{!["divider", "spacer", "button"].includes(item.type) && <input value={item.heading ?? ""} onChange={(event) => updateBlock(item.id, { heading: event.target.value })} placeholder="Heading" className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary ring-1 ring-secondary" />}{!["divider", "spacer", "button", "metric"].includes(item.type) && <textarea value={item.body ?? ""} onChange={(event) => updateBlock(item.id, { body: event.target.value })} placeholder="Body copy" rows={3} className="mt-2 w-full resize-y rounded-lg bg-primary px-3 py-2 text-sm text-primary ring-1 ring-secondary" />}{item.type === "hero" && <input value={item.eyebrow ?? ""} onChange={(event) => updateBlock(item.id, { eyebrow: event.target.value })} placeholder="Eyebrow" className="mt-2 w-full rounded-lg bg-primary px-3 py-2 text-sm text-primary ring-1 ring-secondary" />}{item.type === "button" && <div className="mt-3 grid gap-2 sm:grid-cols-2"><input value={item.label ?? ""} onChange={(event) => updateBlock(item.id, { label: event.target.value })} placeholder="Button label" className="rounded-lg bg-primary px-3 py-2 text-sm ring-1 ring-secondary" /><input value={item.href ?? ""} onChange={(event) => updateBlock(item.id, { href: event.target.value })} placeholder="https://…" className="rounded-lg bg-primary px-3 py-2 text-sm ring-1 ring-secondary" /></div>}{item.type === "metric" && <div className="mt-3 grid gap-2 sm:grid-cols-2"><input value={item.value ?? ""} onChange={(event) => updateBlock(item.id, { value: event.target.value })} placeholder="99.9%" className="rounded-lg bg-primary px-3 py-2 text-sm ring-1 ring-secondary" /><input value={item.label ?? ""} onChange={(event) => updateBlock(item.id, { label: event.target.value })} placeholder="Metric label" className="rounded-lg bg-primary px-3 py-2 text-sm ring-1 ring-secondary" /></div>}</div>)}{blocks.length === 0 && <div className="rounded-xl border border-dashed border-secondary p-8 text-center"><CodeBrowser className="mx-auto size-8 text-fg-quaternary" /><p className="mt-3 text-sm font-semibold text-primary">Choose a template or add your first block</p></div>}</div></div>

              <div className="rounded-xl bg-primary p-5 ring-1 ring-secondary"><div className="flex flex-wrap gap-3"><Button onClick={saveCampaign} isDisabled={busy || !campaignName.trim() || !subject.trim() || blocks.length === 0}>Save campaign</Button><div className="flex min-w-64 flex-1 gap-2"><input type="email" value={testEmail} onChange={(event) => setTestEmail(event.target.value)} placeholder="Test recipient email" className="min-w-0 flex-1 rounded-lg bg-primary px-3 py-2 text-sm ring-1 ring-secondary" /><Button color="secondary" iconLeading={Send01} isDisabled={busy || !testEmail} onClick={async () => { const result = await post({ action: "send_test", to: testEmail, subject, preheader, blocks, replyTo: "info@icesales.com" }); if (result) setNotice(`Test email sent to ${testEmail}.`); }}>Send test</Button></div></div><p className="mt-3 text-xs text-quaternary">Personalization variables: {`{{first_name}}, {{last_name}}, {{company}}, {{email}}`}. Promotional emails automatically include an unsubscribe link.</p></div>
            </div>

            <aside className="self-start rounded-xl bg-primary p-4 ring-1 ring-secondary 2xl:sticky 2xl:top-20"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-secondary pb-4"><div><p className="text-sm font-semibold text-primary">Live preview</p><p className="text-xs text-tertiary">Email-safe HTML, responsive layout, and dark canvas check.</p></div><div className="flex rounded-lg bg-secondary p-1"><button aria-label="Desktop preview" onClick={() => setPreviewMode("desktop")} className={cx("rounded-md p-2", previewMode === "desktop" ? "bg-primary text-brand-secondary shadow-xs" : "text-tertiary")}><Monitor01 className="size-4" /></button><button aria-label="Mobile preview" onClick={() => setPreviewMode("mobile")} className={cx("rounded-md p-2", previewMode === "mobile" ? "bg-primary text-brand-secondary shadow-xs" : "text-tertiary")}><Phone01 className="size-4" /></button><button aria-label="Toggle dark preview canvas" onClick={() => setDarkPreview((value) => !value)} className={cx("rounded-md p-2", darkPreview ? "bg-primary text-brand-secondary shadow-xs" : "text-tertiary")}><Eye className="size-4" /></button></div></div><div className={cx("mt-4 flex min-h-[700px] justify-center overflow-auto rounded-xl p-4 transition", darkPreview ? "bg-overlay" : "bg-secondary")}><iframe title="Email preview" srcDoc={previewHtml} className={cx("h-[680px] rounded-lg bg-white shadow-lg transition-all", previewMode === "mobile" ? "w-[390px]" : "w-full")} /></div></aside>
          </section>
        </div>
      )}

      {tab === "campaigns" && (
        <section className="overflow-hidden rounded-xl bg-primary ring-1 ring-secondary"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-secondary p-5"><div><h2 className="text-lg font-semibold text-primary">Campaign workflow</h2><p className="mt-1 text-sm text-tertiary">Draft, review, approve, schedule, send, and measure each message.</p></div><Button iconLeading={Plus} onClick={() => setTab("studio")}>Create campaign</Button></div><div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left"><thead className="bg-secondary text-xs font-semibold text-quaternary uppercase"><tr><th className="px-5 py-3">Campaign</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Audience</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Delivered</th><th className="px-5 py-3">Opens</th><th className="px-5 py-3">Clicks</th><th className="px-5 py-3">Action</th></tr></thead><tbody>{data?.campaigns.map((campaign) => { const list = data.lists.find((item) => item.id === campaign.list_id); return <tr key={campaign.id} className="border-t border-secondary"><td className="px-5 py-4"><p className="text-sm font-semibold text-primary">{campaign.name}</p><p className="max-w-sm truncate text-xs text-tertiary">{campaign.subject}</p></td><td className="px-5 py-4"><Badge size="sm" color="brand">{campaignTypeLabel(campaign.campaign_type)}</Badge></td><td className="px-5 py-4 text-sm text-secondary">{list?.name ?? "Not selected"}</td><td className="px-5 py-4"><Badge size="sm" color={statusColor(campaign.status)}>{campaign.status}</Badge></td><td className="px-5 py-4 text-sm font-semibold text-primary">{campaign.delivered_count}</td><td className="px-5 py-4 text-sm text-secondary">{campaign.opened_count}{campaign.delivered_count > 0 ? ` · ${Math.round(campaign.opened_count / campaign.delivered_count * 100)}%` : ""}</td><td className="px-5 py-4 text-sm text-secondary">{campaign.clicked_count}</td><td className="px-5 py-4"><div className="flex gap-2"><Button size="sm" color="secondary" onClick={() => editCampaign(campaign)}>Edit</Button>{["approved", "scheduled"].includes(campaign.status) && <Button size="sm" iconLeading={Send01} isDisabled={busy} onClick={async () => { if (!window.confirm(`Send ${campaign.name} to its eligible audience now?`)) return; const result = await post({ action: "send_campaign", campaignId: campaign.id }); if (result) { setNotice(`Campaign sent to ${result.sent} eligible contacts.`); await load(); } }}>Send</Button>}</div></td></tr>; })}</tbody></table>{!data?.campaigns.length && <div className="p-12 text-center"><Mail01 className="mx-auto size-9 text-fg-quaternary" /><p className="mt-3 text-sm font-semibold text-primary">No campaigns yet</p><p className="mt-1 text-sm text-tertiary">Choose a template in Email Studio to begin.</p></div>}</div></section>
      )}
    </div>
  );
}
