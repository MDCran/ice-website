"use client";

import type { FC } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home01,
  Building07,
  Folder,
  File02,
  ClipboardCheck,
  ArrowLeft,
} from "@untitledui/icons";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";

interface NavItem {
  label: string;
  href: string;
  icon: FC<{ className?: string }>;
  badgeKey?: "surveys";
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/portal", icon: Home01 },
  { label: "Company & Contacts", href: "/portal/profile", icon: Building07 },
  { label: "Resources", href: "/portal/resources", icon: Folder },
  { label: "Invoices", href: "/portal/invoices", icon: File02 },
  {
    label: "Surveys",
    href: "/portal/surveys",
    icon: ClipboardCheck,
    badgeKey: "surveys",
  },
];

export default function PortalSidebar() {
  const pathname = usePathname();
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
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-secondary bg-primary">
      {/* Logo */}
      <div className="shrink-0 border-b border-secondary px-4 py-4">
        <Link
          href="/portal"
          className="block rounded-lg outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
        >
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

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "group relative flex w-full cursor-pointer items-center rounded-md p-2 outline-focus-ring transition duration-100 ease-linear select-none focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2",
                    active
                      ? "bg-active hover:bg-secondary_hover"
                      : "bg-primary hover:bg-primary_hover",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className={cx(
                      "mr-2 size-5 shrink-0 text-fg-quaternary transition-inherit-all group-hover:text-fg-quaternary_hover",
                      active && "text-fg-quaternary_hover",
                    )}
                  />
                  <span
                    className={cx(
                      "flex-1 truncate text-sm font-semibold text-secondary transition-inherit-all group-hover:text-secondary_hover",
                      active && "text-secondary_hover",
                    )}
                  >
                    {item.label}
                  </span>
                  {badgeCount > 0 && (
                    <Badge className="ml-3" color="brand" type="pill-color" size="sm">
                      {badgeCount}
                    </Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-secondary p-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md text-sm font-semibold text-tertiary outline-focus-ring transition duration-100 ease-linear hover:text-tertiary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ArrowLeft className="size-4 text-fg-quaternary" aria-hidden="true" />
          Back to Site
        </Link>
      </div>
    </aside>
  );
}
