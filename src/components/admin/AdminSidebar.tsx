"use client";

import type { FC } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  BarChartSquare02,
  Clock,
  File02,
  Folder,
  LayersTwo01,
  Mail01,
  NavigationPointer01,
  SearchLg,
  Server01,
  Stars01,
  Target04,
  Users01,
  Send01,
} from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { can, NAV_CAPABILITY, type AdminCapability } from "@/lib/admin/permissions";
import { cx } from "@/utils/cx";
import { useSidebar } from "./AdminSidebarContext";

interface NavItem {
  label: string;
  href: string;
  icon: FC<{ className?: string }>;
  group: "Build" | "Optimize" | "Operate";
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: BarChartSquare02, group: "Build" },
  { label: "CMS Pages", href: "/admin/cms", icon: File02, group: "Build" },
  { label: "Solutions", href: "/admin/solutions", icon: Server01, group: "Build" },
  { label: "Sales Enablement", href: "/admin/sales", icon: Target04, group: "Build" },
  { label: "Marketing Center", href: "/admin/marketing", icon: Send01, group: "Build" },
  { label: "Navigation", href: "/admin/navigation", icon: NavigationPointer01, group: "Optimize" },
  { label: "SEO & Analytics", href: "/admin/seo", icon: SearchLg, group: "Optimize" },
  { label: "Core Web Vitals", href: "/admin/performance", icon: Activity, group: "Optimize" },
  { label: "Audit log", href: "/admin/audit", icon: Clock, group: "Optimize" },
  { label: "Templates", href: "/admin/templates", icon: LayersTwo01, group: "Optimize" },
  { label: "Files", href: "/admin/files", icon: Folder, group: "Optimize" },
  { label: "Illustrations", href: "/admin/illustrations", icon: Stars01, group: "Optimize" },
  { label: "Clients", href: "/admin/clients", icon: Users01, group: "Operate" },
  { label: "Form Submissions", href: "/admin/contacts", icon: Mail01, group: "Operate" },
];

/** Untitled UI nav item (link) — adapted from application/app-navigation/base-components/nav-item.tsx,
 *  using next/link to preserve client-side routing. */
function SidebarNavItem({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  if (collapsed) {
    // Icon-only variant (see base-components/nav-button.tsx)
    return (
      <Link
        href={item.href}
        title={item.label}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        className={cx(
          "group/item relative mx-auto flex size-9 cursor-pointer items-center justify-center rounded-md outline-focus-ring transition duration-100 ease-linear select-none hover:bg-primary_hover focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2",
          active && "bg-active hover:bg-secondary_hover",
        )}
      >
        <Icon
          aria-hidden="true"
          className={cx(
            "size-5 shrink-0 text-fg-quaternary transition-inherit-all group-hover/item:text-fg-quaternary_hover",
            active && "text-fg-brand-primary",
          )}
        />
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cx(
        "group/item relative flex w-full max-h-9 cursor-pointer items-center rounded-md p-2 outline-focus-ring transition duration-100 ease-linear select-none hover:bg-primary_hover focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2",
        active && "bg-active hover:bg-secondary_hover",
      )}
    >
      <Icon
        aria-hidden="true"
        className={cx(
          "mr-2 size-5 shrink-0 text-fg-quaternary transition-inherit-all group-hover/item:text-fg-quaternary_hover",
          active && "text-fg-brand-primary",
        )}
      />
      <span
        className={cx(
          "flex-1 truncate text-sm font-semibold text-secondary transition-inherit-all group-hover/item:text-secondary_hover",
          active && "text-secondary_hover",
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const [role, setRole] = useState<string>("admin");

  useEffect(() => {
    async function loadRole() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("admin_profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (data?.role) setRole(data.role);
    }
    void loadRole();
  }, []);

  const visibleNav = navItems.filter((item) => {
    const required = NAV_CAPABILITY[item.href] as AdminCapability | undefined;
    return !required || can(role, required);
  });
  const navGroups = ["Build", "Optimize", "Operate"] as const;

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cx(
        "flex h-screen shrink-0 flex-col border-r border-secondary bg-primary transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo — hidden when collapsed */}
      {!collapsed && (
        <div className="shrink-0 px-4 pt-5">
          <Link href="/admin" className="block w-full rounded-lg outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2">
            <div className="flex w-full items-center justify-center rounded-lg bg-white px-3 py-2.5 ring-1 ring-secondary ring-inset">
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
      <nav className="flex-1 overflow-y-auto">
        <ul className={cx("flex flex-col gap-0.5", collapsed ? "px-3.5 py-4" : "px-4 py-5")}>
          {navGroups.map((group) => {
            const groupItems = visibleNav.filter((item) => item.group === group);
            if (groupItems.length === 0) return null;
            return (
              <li key={group} className={cx(!collapsed && "contents")}>
                {!collapsed && (
                  <p className="px-2 pb-1 pt-4 text-[10px] font-semibold tracking-[0.16em] text-quaternary uppercase first:pt-0">
                    {group}
                  </p>
                )}
                <ul className="flex flex-col gap-0.5">
                  {groupItems.map((item) => (
                    <li key={item.href}>
                      <SidebarNavItem item={item} active={isActive(item.href)} collapsed={collapsed} />
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className={cx("mt-auto shrink-0 border-t border-secondary py-4", collapsed ? "px-3.5" : "px-4")}>
        <Link
          href="/"
          title="Back to Site"
          aria-label="Back to Site"
          className={cx(
            "group/item relative flex cursor-pointer items-center rounded-md outline-focus-ring transition duration-100 ease-linear select-none hover:bg-primary_hover focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2",
            collapsed ? "mx-auto size-9 justify-center" : "w-full p-2",
          )}
        >
          <ArrowLeft
            aria-hidden="true"
            className={cx(
              "size-5 shrink-0 text-fg-quaternary transition-inherit-all group-hover/item:text-fg-quaternary_hover",
              !collapsed && "mr-2",
            )}
          />
          {!collapsed && (
            <span className="flex-1 truncate text-sm font-semibold text-secondary transition-inherit-all group-hover/item:text-secondary_hover">
              Back to Site
            </span>
          )}
        </Link>
      </div>
    </aside>
  );
}
