import { clerkConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/setup-notice";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!clerkConfigured) {
    return <SetupNotice />;
  }

  // The layout is intentionally synchronous so the shell + the page's loading.tsx
  // skeleton paint instantly on navigation. Auth is enforced upstream by the
  // middleware (proxy.ts → auth.protect on /dashboard(.*)), and each page resolves
  // the user under its own loading boundary, so there's no need to block the whole
  // dashboard on a DB round trip here — that block is what left the previous page
  // (e.g. the post-sign-in screen) frozen for a beat. DB failures are handled by
  // the sibling error.tsx.
  return <DashboardShell>{children}</DashboardShell>;
}
