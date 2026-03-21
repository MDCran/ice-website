"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  User,
  Settings,
  ChevronDown,
  ChevronRight,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useSidebar } from "./AdminSidebarContext";

const PAGE_NAMES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/cms": "CMS Pages",
  "/admin/navigation": "Navigation",
  "/admin/files": "Files",
  "/admin/clients": "Clients",
  "/admin/contact-changes": "Contact Changes",
  "/admin/contacts": "Form Submissions",
  "/admin/templates": "Templates",
  "/admin/settings": "Settings",
};

function getBreadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [
    { label: "Admin", href: "/admin" },
  ];
  if (parts.length <= 1) return crumbs;

  for (let i = 1; i < parts.length; i++) {
    const cleanPath = "/" + parts.slice(0, i + 1).join("/");
    const name = PAGE_NAMES[cleanPath];
    if (name) {
      crumbs.push({ label: name, href: cleanPath });
    } else {
      const segment = parts[i];
      const label =
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      crumbs.push({ label, href: cleanPath });
    }
  }
  return crumbs;
}

function getPageName(pathname: string): string {
  if (PAGE_NAMES[pathname]) return PAGE_NAMES[pathname];
  const parts = pathname.split("/").filter(Boolean);
  for (let i = parts.length; i >= 2; i--) {
    const check = "/" + parts.slice(0, i).join("/");
    if (PAGE_NAMES[check]) return PAGE_NAMES[check];
  }
  return "Admin Center";
}

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const pageName = getPageName(pathname);
  const breadcrumbs = getBreadcrumbs(pathname);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <header className="h-16 admin-header flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Sidebar toggle */}
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg admin-hover admin-text-muted transition-colors cursor-pointer shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

        {/* Page name + breadcrumb */}
        <div className="flex flex-col justify-center min-w-0">
          <h2 className="text-sm font-semibold admin-text truncate">
            {pageName}
          </h2>
          {breadcrumbs.length > 1 && (
            <nav className="flex items-center gap-1 text-xs admin-text-dimmed">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight size={10} />}
                  {i < breadcrumbs.length - 1 ? (
                    <Link href={crumb.href} className="hover:underline">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        {/* Account dropdown */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm admin-text-muted admin-hover transition-colors cursor-pointer"
          >
            <User size={16} />
            <span>Admin</span>
            <ChevronDown
              size={14}
              className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl admin-dropdown shadow-2xl z-50 overflow-hidden">
              <Link
                href="/admin/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm admin-text-muted admin-nav-hover transition-colors cursor-pointer"
              >
                <Settings size={16} />
                Settings
              </Link>
              <div className="admin-border-t" />
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
