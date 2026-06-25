import { SignUp, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { clerkConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/setup-notice";

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
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-20 shadow-xl">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading sign-up…</p>
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full max-w-sm",
              card: "bg-card border border-border shadow-xl",
            },
          }}
        />
      </ClerkLoaded>
    </div>
  );
}
