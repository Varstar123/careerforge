import { auth } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { StartupBuilder } from "@/components/startup/startup-builder";

export const metadata = { title: "Startup Builder" };

export default async function StartupPage() {
  // This browser-local workspace needs identity, not a database profile.
  // Match the existing development-only bypass used by lib/auth and proxy.
  const local = process.env.NODE_ENV === "development" && process.env.LOCAL_AUTH_BYPASS === "true";
  const userId = local ? "local-development-user" : (await auth()).userId;
  if (!userId) return null;
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Startup Builder" description="A practical workspace for testing demand and planning your first useful version." />
      <StartupBuilder key={userId} storageKey={`careerforge-startup:v1:${userId}`} />
    </div>
  );
}
