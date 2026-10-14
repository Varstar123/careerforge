"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV } from "@/config/nav";
import { cn } from "@/lib/utils";

export function SidebarNav({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  // Warm the full page on intent, rather than querying every dashboard page
  // as soon as the sidebar appears. Default prefetch still warms loading UI.
  const [warmHref, setWarmHref] = useState<string | null>(null);

  return (
    <nav className="flex flex-col gap-1">
      {DASHBOARD_NAV.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={!active && warmHref === item.href ? true : null}
            onMouseEnter={() => setWarmHref(item.href)}
            onFocus={() => setWarmHref(item.href)}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            aria-label={collapsed ? item.label : undefined}
            className={cn(
              "group flex items-center rounded-lg py-2 text-sm font-medium transition-colors",
              collapsed ? "justify-center px-2" : "gap-3 px-3",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
          >
            <item.icon
              className={cn(
                "size-[1.15rem] shrink-0",
                active ? "text-primary" : "text-muted-foreground",
              )}
            />
            {!collapsed && <span className="flex-1">{item.label}</span>}
            {!collapsed && item.badge === "soon" && (
              <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                Soon
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
