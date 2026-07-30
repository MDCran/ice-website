"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut01, User01, Settings01, ChevronDown, ChevronRight } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import PortalNotifications from "@/components/portal/PortalNotifications";

const PAGE_NAMES: Record<string, string> = {
  "/portal": "Dashboard",
  "/portal/profile": "Company & Contacts",
  "/portal/resources": "Resources",
  "/portal/reports": "QBR & reports",
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
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState<string>("");

  const pageName = getPageName(pathname);
  const breadcrumbs = getBreadcrumbs(pathname);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: cu } = await supabase
        .from("client_users")
        .select("first_name, role")
        .eq("id", user.id)
        .single();
      setUserName(cu?.first_name || user.email || "User");
      setRole(cu?.role || "viewer");
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-secondary bg-primary px-4 md:px-6">
      <div className="flex min-w-0 flex-col justify-center">
        <h2 className="truncate text-sm font-semibold text-primary">{pageName}</h2>
        {breadcrumbs.length > 1 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-quaternary">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1">
                {i > 0 && <ChevronRight aria-hidden="true" className="size-3 text-fg-quaternary" />}
                {i < breadcrumbs.length - 1 ? (
                  <Link
                    href={crumb.href}
                    className="rounded-sm font-medium text-tertiary outline-focus-ring transition duration-100 ease-linear hover:text-tertiary_hover hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-quaternary">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-2">
        <PortalNotifications />
        <ThemeToggle />
        {role && (
          <Badge
            size="sm"
            color={role === "admin" ? "brand" : role === "editor" ? "blue" : "gray"}
            className="hidden sm:inline-flex"
          >
            {role}
          </Badge>
        )}
        <Dropdown.Root>
          <Button color="tertiary" size="sm" iconLeading={User01} iconTrailing={ChevronDown}>
            {userName}
          </Button>
          <Dropdown.Popover>
            <Dropdown.Menu>
              <Dropdown.Item
                icon={Settings01}
                label="Settings"
                onAction={() => router.push("/portal/profile")}
              />
              <Dropdown.Separator />
              <Dropdown.Item
                icon={LogOut01}
                label="Sign Out"
                onAction={() => handleLogout()}
              />
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown.Root>
      </div>
    </header>
  );
}
