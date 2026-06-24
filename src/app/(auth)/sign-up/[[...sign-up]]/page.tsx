import { SignUp } from "@clerk/nextjs";
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
    <SignUp
      appearance={{
        elements: {
          rootBox: "w-full max-w-sm",
          card: "bg-card border border-border shadow-xl",
        },
      }}
    />
  );
}
