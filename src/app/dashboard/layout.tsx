import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/auth";
import { clerkConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/setup-notice";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!clerkConfigured) {
    return <SetupNotice />;
  }

  let user;
  try {
    user = await getOrCreateUser();
  } catch {
    // Auth is configured but the database isn't reachable / migrated.
    return (
      <SetupNotice
        title="Database not ready"
        reason="We couldn't reach your database to load your account."
        dbError
      />
    );
  }

  if (!user) redirect("/sign-in");

  return <DashboardShell>{children}</DashboardShell>;
}
