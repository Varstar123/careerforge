"use client";

import * as React from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Menu, X, Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  function toggleSidebar() {
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed;
      localStorage.setItem("careerforge-sidebar-collapsed", String(next));
      return next;
    });
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-card/40 py-5 transition-[width] duration-200 lg:flex",
          sidebarCollapsed ? "w-20 px-3" : "w-64 px-4",
        )}
      >
        <div className={cn("flex items-center", sidebarCollapsed ? "justify-center" : "justify-between px-2")}>
          {!sidebarCollapsed && <Logo href="/dashboard" />}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </Button>
        </div>
        <div className="mt-7 flex-1">
          <SidebarNav collapsed={sidebarCollapsed} />
        </div>
        <Link
          href="/dashboard/interview/new"
          title={sidebarCollapsed ? "New interview" : undefined}
          aria-label="New interview"
          className={cn(
            "mt-4 flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary",
            sidebarCollapsed ? "px-2" : "px-3",
          )}
        >
          <Plus className="size-4 shrink-0" />
          {!sidebarCollapsed && "New interview"}
        </Link>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-card px-4 py-5">
            <div className="flex items-center justify-between px-2">
              <Logo href="/dashboard" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            <div className="mt-7 flex-1">
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className={cn("flex min-w-0 flex-1 flex-col transition-[padding] duration-200", sidebarCollapsed ? "lg:pl-20" : "lg:pl-64")}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border glass px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex-1" />
          <ThemeToggle />
          <UserButton appearance={{ elements: { avatarBox: "size-8" } }} />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
