"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FolderOpen,
  FileText,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: "surveys";
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/portal", icon: LayoutDashboard },
  { label: "Company & Contacts", href: "/portal/profile", icon: Building2 },
  { label: "Resources", href: "/portal/resources", icon: FolderOpen },
  { label: "Invoices", href: "/portal/invoices", icon: FileText },
  {
    label: "Surveys",
    href: "/portal/surveys",
    icon: ClipboardList,
    badgeKey: "surveys",
  },
];

export default function PortalSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [badges, setBadges] = useState<{ surveys: number }>({
    surveys: 0,
  });

  useEffect(() => {
    async function fetchBadges() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: clientUser } = await supabase
        .from("client_users")
        .select("client_account_id")
        .eq("id", user.id)
        .single();
      if (!clientUser) return;

      const { count: surveysCount } = await supabase
        .from("surveys")
        .select("id", { count: "exact", head: true })
        .eq("client_account_id", clientUser.client_account_id)
        .eq("status", "active");

      setBadges({
        surveys: surveysCount ?? 0,
      });
    }
    fetchBadges();
  }, []);

  const isActive = (href: string) => {
    if (href === "/portal") return pathname === "/portal";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "h-screen admin-sidebar flex flex-col transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      {!collapsed && (
        <div className="flex items-center justify-center admin-border-b shrink-0 py-4 px-3">
          <Link href="/portal" className="block w-full">
            <div className="rounded-lg bg-[#ffffff] flex items-center justify-center px-3 py-2.5 w-full">
              <Image
                src="/images/logo/ice-logo.jpg"
                alt="ICE"
                width={180}
                height={52}
                className="object-contain"
              />
            </div>
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className={cn("flex-1 overflow-y-auto px-2 space-y-1", collapsed ? "py-2" : "py-4")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer relative",
                collapsed && "justify-center px-0",
                active
                  ? "admin-nav-active"
                  : "admin-text-muted admin-nav-hover"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {badgeCount > 0 && (
                    <span className="min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full text-xs font-semibold bg-sky-500 text-white">
                      {badgeCount}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 admin-border-t">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs admin-text-dimmed admin-nav-hover transition-colors cursor-pointer"
        >
          {!collapsed && "← Back to Site"}
        </Link>
      </div>
    </aside>
  );
}
