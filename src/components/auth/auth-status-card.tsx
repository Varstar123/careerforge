import { Loader2 } from "lucide-react";

/**
 * Shared loading/redirecting card for the auth pages. Matches the Clerk widget's
 * card styling so swapping between "loading", the sign-in form, and "redirecting"
 * is seamless — no empty/broken-looking gap during the post-login redirect.
 */
export function AuthStatusCard({ label }: { label: string }) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-20 shadow-xl">
      <Loader2 className="size-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
