import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Mail, Users, AlertTriangle, ArrowRight, Globe, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCard {
  label: string;
  value: number;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  href: string;
}

async function getDashboardData() {
  const supabase = await createClient();

  const [contacts, clients, pendingChanges, pages, sections, recentContacts] = await Promise.all([
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase.from("client_accounts").select("id", { count: "exact", head: true }),
    supabase.from("client_contact_changes").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("pages").select("id", { count: "exact", head: true }),
    supabase.from("page_sections").select("id", { count: "exact", head: true }),
    supabase.from("contacts").select("id, name, email, service, created_at, is_read").order("created_at", { ascending: false }).limit(5),
  ]);

  // Get submissions per day for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: recentAll } = await supabase
    .from("contacts")
    .select("created_at")
    .gte("created_at", sevenDaysAgo.toISOString());

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dailyCounts: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = dayNames[d.getDay()];
    const dateStr = d.toISOString().split("T")[0];
    const count = (recentAll ?? []).filter((c) => c.created_at?.startsWith(dateStr)).length;
    dailyCounts.push({ day: dayStr, count });
  }

  return {
    contacts: contacts.count ?? 0,
    clients: clients.count ?? 0,
    pendingChanges: pendingChanges.count ?? 0,
    pages: pages.count ?? 0,
    sections: sections.count ?? 0,
    recentContacts: recentContacts.data ?? [],
    dailyCounts,
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();
  const maxCount = Math.max(...data.dailyCounts.map((d) => d.count), 1);

  const cards: StatCard[] = [
    { label: "Form Submissions", value: data.contacts, icon: Mail, iconBg: "bg-sky-500/10", iconColor: "text-sky-400", href: "/admin/contacts" },
    { label: "Client Accounts", value: data.clients, icon: Users, iconBg: "bg-violet-500/10", iconColor: "text-violet-400", href: "/admin/clients" },
    { label: "Pending Changes", value: data.pendingChanges, icon: AlertTriangle, iconBg: "bg-amber-500/10", iconColor: "text-amber-400", href: "/admin/contact-changes" },
    { label: "CMS Pages", value: data.pages, icon: Globe, iconBg: "bg-blue-500/10", iconColor: "text-blue-400", href: "/admin/cms" },
    { label: "Page Sections", value: data.sections, icon: Layers, iconBg: "bg-indigo-500/10", iconColor: "text-indigo-400", href: "/admin/cms" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold admin-text">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className="admin-card rounded-2xl p-5 transition-colors group cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon size={18} className={card.iconColor} />
                </div>
              </div>
              <div className="text-2xl font-bold admin-text mb-0.5">{card.value}</div>
              <div className="text-xs admin-text-muted">{card.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions Chart */}
        <div className="lg:col-span-2 admin-card rounded-2xl p-6">
          <h2 className="text-sm font-semibold admin-text mb-4">Submissions (Last 7 Days)</h2>
          <div className="flex items-end gap-3 h-32">
            {data.dailyCounts.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] admin-text-muted font-medium">{d.count}</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-sky-500/30 to-sky-400/60 transition-all duration-500"
                  style={{ height: `${Math.max((d.count / maxCount) * 100, 4)}%` }}
                />
                <span className="text-[10px] admin-text-dimmed">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-card rounded-2xl p-6">
          <h2 className="text-sm font-semibold admin-text mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/admin/cms" className="flex items-center justify-between px-4 py-3 rounded-xl admin-hover transition-colors group">
              <span className="text-sm admin-text-muted">Edit Homepage</span>
              <ArrowRight size={14} className="admin-text-dimmed" />
            </Link>
            <Link href="/admin/navigation" className="flex items-center justify-between px-4 py-3 rounded-xl admin-hover transition-colors group">
              <span className="text-sm admin-text-muted">Manage Navigation</span>
              <ArrowRight size={14} className="admin-text-dimmed" />
            </Link>
            <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-3 rounded-xl admin-hover transition-colors group">
              <span className="text-sm admin-text-muted">View Site</span>
              <ArrowRight size={14} className="admin-text-dimmed" />
            </a>
            <Link href="/admin/files" className="flex items-center justify-between px-4 py-3 rounded-xl admin-hover transition-colors group">
              <span className="text-sm admin-text-muted">Upload Files</span>
              <ArrowRight size={14} className="admin-text-dimmed" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Form Submissions */}
      <div className="admin-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold admin-text">Recent Form Submissions</h2>
          <Link href="/admin/contacts" className="text-xs text-sky-400 hover:text-sky-300 transition-colors">
            View All →
          </Link>
        </div>
        {data.recentContacts.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm admin-text-muted">No submissions yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left">
                <th className="px-6 py-3 text-xs font-medium admin-text-muted uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-medium admin-text-muted uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="px-6 py-3 text-xs font-medium admin-text-muted uppercase tracking-wider hidden md:table-cell">Service</th>
                <th className="px-6 py-3 text-xs font-medium admin-text-muted uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.recentContacts.map((c: any) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      {!c.is_read && <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />}
                      <span className="admin-text font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 admin-text-muted hidden sm:table-cell">{c.email}</td>
                  <td className="px-6 py-3 admin-text-muted hidden md:table-cell">{c.service || "\u2014"}</td>
                  <td className="px-6 py-3 admin-text-dimmed text-xs">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "\u2014"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
