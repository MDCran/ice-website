import type { FC } from "react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Clock,
  CursorClick01,
  Globe01,
  LayersTwo01,
  Mail01,
  TrendUp01,
  Users01,
} from "@untitledui/icons";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { getAnalyticsInsights } from "@/lib/admin/analytics-insights";

interface StatCard {
  label: string;
  value: number;
  icon: FC<{ className?: string }>;
  color: "brand" | "gray" | "success" | "warning" | "error";
  href: string;
}

function formatMs(ms: number | null): string {
  if (ms == null) return "—";
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)}ms`;
}

async function getDashboardData() {
  const supabase = await createClient();

  const [contacts, clients, pendingChanges, pages, sections, recentContacts, analytics] =
    await Promise.all([
      supabase.from("contacts").select("id", { count: "exact", head: true }),
      supabase.from("client_accounts").select("id", { count: "exact", head: true }),
      supabase
        .from("client_contact_changes")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase.from("pages").select("id", { count: "exact", head: true }),
      supabase.from("page_sections").select("id", { count: "exact", head: true }),
      supabase
        .from("contacts")
        .select("id, name, email, service, created_at, is_read")
        .order("created_at", { ascending: false })
        .limit(5),
      getAnalyticsInsights(),
    ]);

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
    analytics,
  };
}

const quickActions: { label: string; href: string; external?: boolean }[] = [
  { label: "Edit Homepage", href: "/admin/cms" },
  { label: "Manage Navigation", href: "/admin/navigation" },
  { label: "View Site", href: "/", external: true },
  { label: "Upload Files", href: "/admin/files" },
];

const adminAreaGuide = [
  {
    group: "Build",
    label: "CMS Pages",
    description: "Create, arrange, preview, and publish public page content.",
    href: "/admin/cms",
    icon: Globe01,
  },
  {
    group: "Build",
    label: "Sales Enablement",
    description: "Shape the enterprise buyer story, proof, tools, and CTAs.",
    href: "/admin/sales",
    icon: TrendUp01,
  },
  {
    group: "Build",
    label: "Marketing Center",
    description: "Build audiences, email campaigns, and customer messages.",
    href: "/admin/marketing",
    icon: Mail01,
  },
  {
    group: "Optimize",
    label: "Navigation",
    description: "Control how visitors move through the public site.",
    href: "/admin/navigation",
    icon: ArrowRight,
  },
  {
    group: "Optimize",
    label: "SEO & Analytics",
    description: "Improve discoverability and understand what visitors do.",
    href: "/admin/seo",
    icon: Globe01,
  },
  {
    group: "Optimize",
    label: "Core Web Vitals",
    description: "Find pages that are slow, unstable, or hard to interact with.",
    href: "/admin/performance",
    icon: Activity,
  },
  {
    group: "Optimize",
    label: "Templates & Files",
    description: "Reuse approved layouts and keep the asset library organized.",
    href: "/admin/templates",
    icon: LayersTwo01,
  },
  {
    group: "Operate",
    label: "Clients",
    description: "Manage accounts, portal content, contacts, and balances.",
    href: "/admin/clients",
    icon: Users01,
  },
  {
    group: "Operate",
    label: "Form Submissions",
    description: "Review inbound requests and move them through follow-up.",
    href: "/admin/contacts",
    icon: Mail01,
  },
  {
    group: "Operate",
    label: "Audit Log",
    description: "See who changed important content and when.",
    href: "/admin/audit",
    icon: Clock,
  },
];

export default async function AdminDashboard() {
  const data = await getDashboardData();
  const maxCount = Math.max(...data.dailyCounts.map((d) => d.count), 1);
  const maxViews = Math.max(...(data.analytics.dailyViews.map((d) => d.count) || [0]), 1);
  const a = data.analytics;

  const cards: StatCard[] = [
    { label: "Form Submissions", value: data.contacts, icon: Mail01, color: "brand", href: "/admin/contacts" },
    { label: "Client Accounts", value: data.clients, icon: Users01, color: "success", href: "/admin/clients" },
    { label: "Pending Changes", value: data.pendingChanges, icon: AlertTriangle, color: "warning", href: "/admin/contact-changes" },
    { label: "CMS Pages", value: data.pages, icon: Globe01, color: "gray", href: "/admin/cms" },
    { label: "Page Sections", value: data.sections, icon: LayersTwo01, color: "gray", href: "/admin/cms" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-display-xs font-semibold text-primary">Dashboard</h1>

      <section className="overflow-hidden rounded-xl bg-brand-primary_alt/60 ring-1 ring-brand/20">
        <div className="border-b border-brand/15 px-5 py-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-brand-secondary uppercase">Admin control center</p>
          <h2 className="mt-1 text-lg font-semibold text-primary">What would you like to manage?</h2>
          <p className="mt-1 max-w-3xl text-sm text-tertiary">
            Build public experiences, improve how they perform, or operate customer follow-up from one workspace. Choose an area below to go directly to its tools.
          </p>
        </div>
        <div className="grid gap-px bg-brand/15 sm:grid-cols-2 lg:grid-cols-3">
          {adminAreaGuide.map((area) => {
            const Icon = area.icon;
            return (
              <Link
                key={area.label}
                href={area.href}
                className="group bg-primary/75 p-4 outline-focus-ring transition hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
              >
                <div className="flex items-start gap-3">
                  <FeaturedIcon icon={Icon} color="brand" theme="light" size="sm" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold tracking-[0.16em] text-quaternary uppercase">{area.group}</span>
                    <h3 className="mt-1 text-sm font-semibold text-primary group-hover:text-brand-secondary">{area.label}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-tertiary">{area.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group flex flex-col gap-4 rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary transition duration-100 ease-linear outline-focus-ring hover:bg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <FeaturedIcon icon={Icon} color={card.color} theme="light" size="md" />
              <div>
                <div className="text-display-xs font-semibold text-primary">{card.value}</div>
                <div className="mt-0.5 text-sm font-medium text-tertiary">{card.label}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Site analytics insights */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-primary">Site analytics</h2>
            <p className="text-sm text-tertiary">
              First-party pageviews and LCP from the public site (independent of GA4/GTM).
            </p>
          </div>
        </div>

        {!a.available ? (
          <div className="rounded-xl bg-primary px-6 py-10 text-center shadow-xs ring-1 ring-secondary">
            <FeaturedIcon icon={CursorClick01} color="gray" theme="light" size="lg" className="mx-auto" />
            <p className="mt-4 text-sm font-semibold text-primary">{a.setupRequired ? "Analytics storage is not connected" : "No pageviews recorded yet"}</p>
            <p className="mx-auto mt-1 max-w-lg text-sm text-tertiary">{a.setupHint}</p>
            <p className="mx-auto mt-3 max-w-lg text-xs text-quaternary">
              Migration file:{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5">
                supabase/migrations/20260711_admin_analytics_and_2fa.sql
              </code>
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary">
                <FeaturedIcon icon={CursorClick01} color="brand" theme="light" size="md" />
                <div className="mt-4 text-display-xs font-semibold text-primary">{a.totalViews}</div>
                <div className="mt-0.5 text-sm font-medium text-tertiary">Total page views</div>
              </div>
              <div className="rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary">
                <FeaturedIcon icon={TrendUp01} color="success" theme="light" size="md" />
                <div className="mt-4 text-display-xs font-semibold text-primary">{a.viewsLast7Days}</div>
                <div className="mt-0.5 text-sm font-medium text-tertiary">Views (7 days)</div>
              </div>
              <div className="rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary">
                <FeaturedIcon icon={Globe01} color="gray" theme="light" size="md" />
                <div className="mt-4 text-display-xs font-semibold text-primary">{a.viewsLast30Days}</div>
                <div className="mt-0.5 text-sm font-medium text-tertiary">Views (30 days)</div>
              </div>
              <div className="rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary">
                <FeaturedIcon icon={Clock} color="warning" theme="light" size="md" />
                <div className="mt-4 text-display-xs font-semibold text-primary">{formatMs(a.avgLcpMs)}</div>
                <div className="mt-0.5 text-sm font-medium text-tertiary">Avg LCP (30 days)</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary lg:col-span-2">
                <h3 className="text-md font-semibold text-primary">Page views (Last 7 Days)</h3>
                <div className="mt-4 flex h-32 items-end gap-3">
                  {a.dailyViews.map((d, i) => (
                    <div key={`${d.day}-${i}`} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-xs font-medium text-tertiary">{d.count}</span>
                      <div
                        className="w-full rounded-t-md bg-brand-solid transition-all duration-500"
                        style={{ height: `${Math.max((d.count / maxViews) * 100, 4)}%` }}
                      />
                      <span className="text-xs text-quaternary">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
                <div className="border-b border-secondary px-6 py-4">
                  <h3 className="text-md font-semibold text-primary">Most popular pages</h3>
                  <p className="text-xs text-tertiary">Last 30 days</p>
                </div>
                {a.popularPages.length === 0 ? (
                  <div className="px-6 py-8 text-center text-sm text-tertiary">No pages yet</div>
                ) : (
                  <ul className="divide-y divide-secondary">
                    {a.popularPages.map((p) => (
                      <li key={p.path} className="flex items-center justify-between gap-3 px-6 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-primary">{p.path}</p>
                          <p className="text-xs text-quaternary">
                            Avg LCP {formatMs(p.avgLcpMs)}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-secondary">{p.views}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Submissions Chart */}
        <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary lg:col-span-2">
          <h2 className="text-md font-semibold text-primary">Submissions (Last 7 Days)</h2>
          <div className="mt-4 flex h-32 items-end gap-3">
            {data.dailyCounts.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-medium text-tertiary">{d.count}</span>
                <div
                  className="w-full rounded-t-md bg-brand-solid transition-all duration-500"
                  style={{ height: `${Math.max((d.count / maxCount) * 100, 4)}%` }}
                />
                <span className="text-xs text-quaternary">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
          <h2 className="text-md font-semibold text-primary">Quick Actions</h2>
          <div className="mt-4 flex flex-col gap-1">
            {quickActions.map((action) =>
              action.external ? (
                <a
                  key={action.label}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition duration-100 ease-linear outline-focus-ring hover:bg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span className="text-sm font-semibold text-secondary group-hover:text-secondary_hover">
                    {action.label}
                  </span>
                  <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-fg-quaternary" />
                </a>
              ) : (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition duration-100 ease-linear outline-focus-ring hover:bg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span className="text-sm font-semibold text-secondary group-hover:text-secondary_hover">
                    {action.label}
                  </span>
                  <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-fg-quaternary" />
                </Link>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Recent Form Submissions */}
      <div className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
        <div className="flex items-center justify-between border-b border-secondary px-6 py-4">
          <h2 className="text-md font-semibold text-primary">Recent Form Submissions</h2>
          <Link
            href="/admin/contacts"
            className="text-sm font-semibold text-brand-secondary transition duration-100 ease-linear hover:text-brand-secondary_hover"
          >
            View all
          </Link>
        </div>
        {data.recentContacts.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-tertiary">No submissions yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary bg-secondary text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-quaternary">Name</th>
                  <th className="hidden px-6 py-3 text-xs font-semibold text-quaternary sm:table-cell">Email</th>
                  <th className="hidden px-6 py-3 text-xs font-semibold text-quaternary md:table-cell">Service</th>
                  <th className="px-6 py-3 text-xs font-semibold text-quaternary">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentContacts.map((c: {
                  id: string;
                  name: string;
                  email: string;
                  service: string | null;
                  created_at: string | null;
                  is_read: boolean | null;
                }) => (
                  <tr
                    key={c.id}
                    className="border-b border-secondary transition duration-100 ease-linear last:border-0 hover:bg-primary_hover"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        {!c.is_read && <span className="size-2 shrink-0 rounded-full bg-brand-solid" aria-label="Unread" />}
                        <span className="font-medium text-primary">{c.name}</span>
                      </div>
                    </td>
                    <td className="hidden px-6 py-3.5 text-tertiary sm:table-cell">{c.email}</td>
                    <td className="hidden px-6 py-3.5 text-tertiary md:table-cell">{c.service || "—"}</td>
                    <td className="px-6 py-3.5 text-xs text-quaternary">
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
