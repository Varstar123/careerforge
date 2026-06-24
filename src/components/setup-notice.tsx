import Link from "next/link";
import { ArrowLeft, KeyRound, Terminal } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

/**
 * Shown when required keys (Clerk / DB) aren't configured yet, so auth-gated
 * routes give clear setup guidance instead of a 500 error.
 */
export function SetupNotice({
  title = "Almost there — finish setup",
  reason = "Authentication isn't configured yet.",
  dbError = false,
}: {
  title?: string;
  reason?: string;
  dbError?: boolean;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />

      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </span>
        </div>

        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{reason}</p>

        <div className="mt-6 space-y-3 rounded-xl border border-border bg-background/50 p-4 text-sm">
          <p className="font-medium">To enable the full app:</p>
          <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
            {dbError ? (
              <>
                <li>
                  Check your{" "}
                  <code className="rounded bg-secondary px-1 py-0.5 text-foreground">
                    DATABASE_URL
                  </code>{" "}
                  in both{" "}
                  <code className="rounded bg-secondary px-1 py-0.5 text-foreground">
                    .env
                  </code>{" "}
                  and{" "}
                  <code className="rounded bg-secondary px-1 py-0.5 text-foreground">
                    .env.local
                  </code>
                  .
                </li>
                <li>
                  Run{" "}
                  <code className="rounded bg-secondary px-1 py-0.5 text-foreground">
                    npm run db:migrate
                  </code>{" "}
                  to create the tables.
                </li>
              </>
            ) : (
              <>
                <li>
                  Add your Clerk keys,{" "}
                  <code className="rounded bg-secondary px-1 py-0.5 text-foreground">
                    DATABASE_URL
                  </code>{" "}
                  and{" "}
                  <code className="rounded bg-secondary px-1 py-0.5 text-foreground">
                    OPENAI_API_KEY
                  </code>{" "}
                  to{" "}
                  <code className="rounded bg-secondary px-1 py-0.5 text-foreground">
                    .env.local
                  </code>
                  .
                </li>
                <li>
                  Run{" "}
                  <code className="rounded bg-secondary px-1 py-0.5 text-foreground">
                    npm run db:migrate
                  </code>
                  , then restart the dev server.
                </li>
              </>
            )}
          </ol>
          <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
            <Terminal className="size-3.5" /> See README.md for the full guide.
          </p>
        </div>

        <Button variant="outline" asChild className="mt-6">
          <Link href="/">
            <ArrowLeft className="size-4" /> Back to home
          </Link>
        </Button>
      </div>
    </div>
  );
}
