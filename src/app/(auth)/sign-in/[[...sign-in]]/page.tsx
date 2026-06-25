import { SignIn, ClerkLoading, ClerkLoaded, Show } from "@clerk/nextjs";
import { clerkConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/setup-notice";
import { AuthStatusCard } from "@/components/auth/auth-status-card";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default function SignInPage() {
  if (!clerkConfigured) {
    return (
      <SetupNotice
        title="Sign-in isn't enabled yet"
        reason="Add your Clerk API keys to start signing in."
      />
    );
  }
  return (
    <div className="w-full max-w-sm">
      <ClerkLoading>
        <AuthStatusCard label="Loading sign-in…" />
      </ClerkLoading>
      <ClerkLoaded>
        {/* Once authenticated, the <SignIn> widget empties itself and redirects.
            Show an intentional loader during that window instead of a blank card. */}
        <Show when="signed-out">
          <SignIn
            fallbackRedirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "w-full max-w-sm",
                card: "bg-card border border-border shadow-xl",
              },
            }}
          />
        </Show>
        <Show when="signed-in">
          <AuthStatusCard label="Taking you to your dashboard…" />
        </Show>
      </ClerkLoaded>
    </div>
  );
}
