"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";

export function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 text-center sm:p-16">
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-80 [background:radial-gradient(60%_120%_at_50%_0%,color-mix(in_oklch,var(--primary)_22%,transparent),transparent)]" />
            <div className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-20" />
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Your next opportunity is worth preparing for
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join CareerForge AI and turn uncertainty into a clear, confident
              plan — for your interviews, your skills and your ideas.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="gradient" size="lg" asChild className="group">
                <Link href="/sign-up">
                  Get started — it&apos;s free
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/sign-in">I already have an account</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
