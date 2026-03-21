"use client";

import { useState } from "react";
import {
  Home,
  Users,
  FileText,
  Receipt,
  ClipboardList,
  GitPullRequestArrow,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ClientEditForm from "@/components/admin/clients/ClientEditForm";
import ContactsManager from "@/components/admin/clients/ContactsManager";
import ResourcesManager from "@/components/admin/clients/ResourcesManager";
import InvoicesManager from "@/components/admin/clients/InvoicesManager";
import DeleteClientButton from "@/components/admin/clients/DeleteClientButton";
import ChangeActions from "@/app/admin/(dashboard)/contact-changes/ChangeActions";

interface Tab {
  key: string;
  label: string;
  icon: LucideIcon;
}

const tabs: Tab[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "contacts", label: "Contacts", icon: Users },
  { key: "resources", label: "Resources", icon: FileText },
  { key: "invoices", label: "Invoices", icon: Receipt },
  { key: "surveys", label: "Surveys", icon: ClipboardList },
  { key: "contact-changes", label: "Contact Changes", icon: GitPullRequestArrow },
];

export default function ClientTabs({ client }: { client: any }) {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <DeleteClientButton clientId={client.id} clientName={client.company_name} />
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 admin-border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm whitespace-nowrap transition-colors cursor-pointer rounded-t-lg -mb-px",
                active
                  ? "admin-nav-active border-b-2 border-sky-400 font-medium"
                  : "admin-text-muted admin-nav-hover"
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "home" && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold admin-text mb-6">
              Company Information
            </h2>
            <ClientEditForm client={client} />
          </div>
        )}

        {activeTab === "contacts" && (
          <ContactsManager clientId={client.id} />
        )}

        {activeTab === "resources" && (
          <ResourcesManager clientId={client.id} />
        )}

        {activeTab === "invoices" && (
          <InvoicesManager clientId={client.id} />
        )}

        {activeTab === "surveys" && (
          <SurveysTab clientId={client.id} />
        )}

        {activeTab === "contact-changes" && (
          <ContactChangesTab clientId={client.id} />
        )}
      </div>
    </div>
  );
}

/* ── Inline Surveys Tab (lightweight since it was a separate page) ── */
/* ── Inline Contact Changes Tab ── */

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function SurveysTab({ clientId }: { clientId: string }) {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("surveys")
        .select("*")
        .eq("client_account_id", clientId)
        .order("created_at", { ascending: false });
      setSurveys(data ?? []);
      setLoading(false);
    }
    load();
  }, [clientId]);

  const statusColors: Record<string, string> = {
    draft: "bg-slate-500/10 text-slate-400",
    active: "bg-sky-500/10 text-sky-400",
    completed: "bg-emerald-500/10 text-emerald-400",
    expired: "bg-amber-500/10 text-amber-400",
  };

  if (loading) {
    return <div className="text-slate-500 text-sm py-8 text-center">Loading surveys...</div>;
  }

  if (surveys.length === 0) {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
        <ClipboardList size={48} className="mx-auto text-slate-600 mb-4" />
        <p className="text-slate-400 text-lg mb-2">No surveys yet</p>
        <p className="text-slate-500 text-sm">Create a survey for this client from the survey builder.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left">
            <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Title</th>
            <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
            <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {surveys.map((s) => (
            <tr key={s.id} className="hover:bg-white/[0.03] transition-colors">
              <td className="px-6 py-4 admin-text font-medium">{s.title}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[s.status] ?? statusColors.draft}`}>
                  {s.status}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-400 text-xs">
                {s.created_at ? new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
              </td>
              <td className="px-6 py-4">
                <Link
                  href={`/admin/surveys/${s.id}`}
                  className="text-sm text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContactChangesTab({ clientId }: { clientId: string }) {
  const [changes, setChanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("client_contact_changes")
        .select("*, client_contacts(first_name, last_name, email)")
        .eq("client_account_id", clientId)
        .order("created_at", { ascending: false });
      setChanges(data ?? []);
      setLoading(false);
    }
    load();
  }, [clientId]);

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400",
    approved: "bg-emerald-500/10 text-emerald-400",
    rejected: "bg-red-500/10 text-red-400",
  };

  if (loading) {
    return <div className="text-slate-500 text-sm py-8 text-center">Loading changes...</div>;
  }

  if (changes.length === 0) {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
        <GitPullRequestArrow size={48} className="mx-auto text-slate-600 mb-4" />
        <p className="text-slate-400 text-lg mb-2">No contact changes</p>
        <p className="text-slate-500 text-sm">Changes requested by portal users will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left">
            <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Field</th>
            <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">New Value</th>
            <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {changes.map((c) => (
            <tr key={c.id} className="hover:bg-white/[0.03] transition-colors">
              <td className="px-6 py-4 admin-text font-medium">
                {c.client_contacts?.first_name} {c.client_contacts?.last_name}
              </td>
              <td className="px-6 py-4 text-slate-400">{c.field_name}</td>
              <td className="px-6 py-4 text-slate-300 font-mono text-xs max-w-[200px] truncate">{c.new_value}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[c.status] ?? statusColors.pending}`}>
                  {c.status}
                </span>
              </td>
              <td className="px-6 py-4">
                {c.status === "pending" ? (
                  <ChangeActions changeId={c.id} />
                ) : (
                  <span className="text-xs text-slate-500">
                    {c.reviewed_at ? new Date(c.reviewed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "\u2014"}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
