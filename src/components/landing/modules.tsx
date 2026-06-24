"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MODULES } from "@/config/modules";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/landing/reveal";

export function Modules() {
  return (
    <section id="modules" className="relative py-24">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[30rem] -translate-y-1/2 bg-primary/5 blur-3xl" />
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">
            Four AI modules, one ecosystem
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Your personal mentor and AI co-founder
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {MODULES.map((m, i) => (
            <Reveal key={m.key} delay={i * 0.06}>
              <Link
                href={m.href}
                className="group relative block h-full overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
                <div className="flex items-start justify-between">
                  <div
                    className={`inline-flex size-12 items-center justify-center rounded-xl bg-secondary ${m.accent}`}
                  >
                    <m.icon className="size-6" />
                  </div>
                  {m.status === "live" ? (
                    <Badge variant="success">Live</Badge>
                  ) : (
                    <Badge variant="secondary">Coming soon</Badge>
                  )}
                </div>

                <h3 className="mt-5 text-xl font-semibold tracking-tight">
                  {m.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-primary/80">
                  {m.tagline}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {m.description}
                </p>

                <ArrowUpRight className="absolute right-6 top-1/2 size-5 -translate-y-1/2 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
