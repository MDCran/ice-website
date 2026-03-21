"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Navigation,
  Layers,
  Image as ImageIcon,
  Users,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./AdminSidebarContext";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "CMS Pages", href: "/admin/cms", icon: FileText },
  { label: "Navigation", href: "/admin/navigation", icon: Navigation },
  { label: "Templates", href: "/admin/templates", icon: Layers },
  { label: "Files", href: "/admin/files", icon: ImageIcon },
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Form Submissions", href: "/admin/contacts", icon: Mail },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "h-screen admin-sidebar flex flex-col transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo — hidden when collapsed */}
      {!collapsed && (
        <div className="flex items-center justify-center admin-border-b shrink-0 py-4 px-3">
          <Link href="/admin" className="block w-full">
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

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer",
                collapsed && "justify-center px-0",
                active
                  ? "admin-nav-active"
                  : "admin-text-muted admin-nav-hover"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
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
