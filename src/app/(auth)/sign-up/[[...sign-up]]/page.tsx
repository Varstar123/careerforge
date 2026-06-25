import { SignUp, ClerkLoading, ClerkLoaded, Show } from "@clerk/nextjs";
import { clerkConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/setup-notice";
import { AuthStatusCard } from "@/components/auth/auth-status-card";

export const metadata = { title: "Create account" };
export const dynamic = "force-dynamic";

export default function SignUpPage() {
  if (!clerkConfigured) {
    return (
      <SetupNotice
        title="Sign-up isn't enabled yet"
        reason="Add your Clerk API keys to start creating accounts."
      />
    );
  }
  return (
    <div className="w-full max-w-sm">
      <ClerkLoading>
        <AuthStatusCard label="Loading sign-up…" />
      </ClerkLoading>
      <ClerkLoaded>
        {/* Once registered, the <SignUp> widget empties itself and redirects.
            Show an intentional loader during that window instead of a blank card. */}
        <Show when="signed-out">
          <SignUp
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
          <AuthStatusCard label="Setting up your dashboard…" />
        </Show>
      </ClerkLoaded>
    </div>
  );
}
