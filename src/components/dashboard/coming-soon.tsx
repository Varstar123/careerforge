import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ComingSoon({
  icon: Icon,
  title,
  tagline,
  description,
  bullets,
}: {
  icon: LucideIcon;
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 sm:p-12">
        <div className="pointer-events-none absolute right-0 top-0 -z-0 size-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-6" />
            </span>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="size-3" /> Coming soon
            </Badge>
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 font-medium text-primary/80">{tagline}</p>
          <p className="mt-4 max-w-xl text-muted-foreground">{description}</p>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {bullets.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2 rounded-lg border border-border bg-background/50 p-3 text-sm"
              >
                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard/interview/new">
                Try the Interview Coach
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="size-4" /> Back to overview
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
