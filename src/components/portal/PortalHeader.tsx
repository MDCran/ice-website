"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, User, Settings, ChevronDown, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ui/ThemeToggle";

const PAGE_NAMES: Record<string, string> = {
  "/portal": "Dashboard",
  "/portal/profile": "Company & Contacts",
  "/portal/resources": "Resources",
  "/portal/invoices": "Invoices",
  "/portal/surveys": "Surveys",
};

function getPageName(pathname: string): string {
  if (PAGE_NAMES[pathname]) return PAGE_NAMES[pathname];
  const parts = pathname.split("/").filter(Boolean);
  for (let i = parts.length; i >= 2; i--) {
    const check = "/" + parts.slice(0, i).join("/");
    if (PAGE_NAMES[check]) return PAGE_NAMES[check];
  }
  return "Portal";
}

function getBreadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs = [{ label: "Portal", href: "/portal" }];
  if (parts.length <= 1) return crumbs;
  for (let i = 1; i < parts.length; i++) {
    const cleanPath = "/" + parts.slice(0, i + 1).join("/");
    const name = PAGE_NAMES[cleanPath];
    crumbs.push({
      label: name ?? parts[i].charAt(0).toUpperCase() + parts[i].slice(1).replace(/-/g, " "),
      href: cleanPath,
    });
  }
  return crumbs;
}

export default function PortalHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const pageName = getPageName(pathname);
  const breadcrumbs = getBreadcrumbs(pathname);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: cu } = await supabase
        .from("client_users")
        .select("first_name")
        .eq("id", user.id)
        .single();
      setUserName(cu?.first_name || user.email || "User");
    }
    loadUser();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="h-16 admin-header flex items-center justify-between px-4 shrink-0">
      <div className="flex flex-col justify-center min-w-0">
        <h2 className="text-sm font-semibold admin-text truncate">{pageName}</h2>
        {breadcrumbs.length > 1 && (
          <nav className="flex items-center gap-1 text-xs admin-text-dimmed">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={10} />}
                {i < breadcrumbs.length - 1 ? (
                  <Link href={crumb.href} className="hover:underline">{crumb.label}</Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm admin-text-muted admin-hover transition-colors cursor-pointer"
          >
            <User size={16} />
            <span>{userName}</span>
            <ChevronDown size={14} className={`transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl admin-dropdown shadow-2xl z-50 overflow-hidden">
              <Link
                href="/portal/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm admin-text-muted admin-nav-hover transition-colors cursor-pointer"
              >
                <Settings size={16} />
                Settings
              </Link>
              <div className="admin-border-t" />
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
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
