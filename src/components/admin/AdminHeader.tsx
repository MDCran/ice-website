"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  LayoutLeft,
  LogOut01,
  Moon01,
  Settings01,
  Sun,
  User01,
} from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/lib/themeProvider";
import { Avatar } from "@/components/base/avatar/avatar";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { useSidebar } from "./AdminSidebarContext";

const PAGE_NAMES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/cms": "CMS Pages",
  "/admin/navigation": "Navigation",
  "/admin/seo": "SEO & Analytics",
  "/admin/performance": "Core Web Vitals",
  "/admin/audit": "Audit log",
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
  const { theme, toggleTheme } = useTheme();
  const [displayName, setDisplayName] = useState<string>("Admin");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

  const pageName = getPageName(pathname);
  const breadcrumbs = getBreadcrumbs(pathname);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data: profile } = await supabase
        .from("admin_profiles")
        .select("display_name, email, avatar_url")
        .eq("id", user.id)
        .single();

      if (cancelled) return;

      const name =
        profile?.display_name?.trim() ||
        profile?.email?.trim() ||
        user.email ||
        "Admin";
      setDisplayName(name);
      setEmail(profile?.email || user.email || "");
      setAvatarUrl(profile?.avatar_url || null);
    }
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await fetch("/api/admin/2fa/logout", { method: "POST" }).catch(() => {});
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-secondary bg-primary px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <ButtonUtility
          color="tertiary"
          size="sm"
          icon={LayoutLeft}
          tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggle}
        />

        <div className="flex min-w-0 flex-col justify-center">
          <h2 className="truncate text-sm font-semibold text-primary">
            {pageName}
          </h2>
          {breadcrumbs.length > 1 && (
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1 text-xs font-medium text-quaternary"
            >
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1">
                  {i > 0 && (
                    <ChevronRight
                      aria-hidden="true"
                      className="size-3 shrink-0 text-fg-quaternary"
                    />
                  )}
                  {i < breadcrumbs.length - 1 ? (
                    <Link
                      href={crumb.href}
                      className="rounded-xs outline-focus-ring transition duration-100 ease-linear hover:text-tertiary focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-tertiary">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ButtonUtility
          color="tertiary"
          size="sm"
          icon={theme === "dark" ? Sun : Moon01}
          tooltip={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          onClick={toggleTheme}
        />

        <Dropdown.Root>
          <AriaButton
            className={({ isPressed, isHovered, isFocusVisible }) => {
              const base =
                "group flex cursor-pointer items-center gap-2 rounded-lg py-1.5 pr-2 pl-1.5 outline-focus-ring transition duration-100 ease-linear";
              const hovered = isPressed || isHovered ? " bg-primary_hover" : "";
              const focused = isFocusVisible ? " outline-2 outline-offset-2" : "";
              return base + hovered + focused;
            }}
          >
            <Avatar
              size="xs"
              alt={displayName}
              src={avatarUrl || undefined}
              placeholderIcon={User01}
            />
            <span className="hidden max-w-40 truncate text-sm font-semibold text-secondary sm:inline">
              {displayName}
            </span>
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 stroke-[2.5px] text-fg-quaternary"
            />
          </AriaButton>
          <Dropdown.Popover>
            <Dropdown.Menu
              onAction={(key) => {
                if (key === "settings") router.push("/admin/settings");
                if (key === "signout") handleLogout();
              }}
            >
              {(email || displayName) && (
                <Dropdown.Item
                  id="profile-label"
                  label={displayName}
                  addon={email || undefined}
                  icon={User01}
                  isDisabled
                />
              )}
              <Dropdown.Item id="settings" label="Settings" icon={Settings01} />
              <Dropdown.Separator />
              <Dropdown.Item id="signout" label="Sign out" icon={LogOut01} />
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown.Root>
      </div>
    </header>
  );
}
