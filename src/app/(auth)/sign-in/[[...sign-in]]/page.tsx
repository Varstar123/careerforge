import { SignIn } from "@clerk/nextjs";
import { clerkConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/setup-notice";

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
    <SignIn
      appearance={{
        elements: {
          rootBox: "w-full max-w-sm",
          card: "bg-card border border-border shadow-xl",
        },
      }}
    />
  );
}
