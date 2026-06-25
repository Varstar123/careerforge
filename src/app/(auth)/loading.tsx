import { Loader2 } from "lucide-react";

export default function AuthLoading() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-20 shadow-xl">
      <Loader2 className="size-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}
