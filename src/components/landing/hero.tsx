"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InterviewPreview } from "@/components/landing/interview-preview";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-20 sm:pt-44">
      {/* ambient gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-[0.35] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black,transparent)]" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[42rem] w-[68rem] -translate-x-1/2 rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklch, var(--primary) 40%, transparent), transparent)",
        }}
        animate={{ opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="mx-auto max-w-6xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border glass px-4 py-1.5 text-sm"
        >
          <Sparkles className="size-3.5 text-primary" />
          <span className="text-muted-foreground">
            AI career mentor <span className="text-foreground">+</span> AI
            co-founder
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mx-auto max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
        >
          <span className="text-gradient">Forge the career</span>
          {" you’re capable of."}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground"
        >
          Upload your resume and CareerForge AI runs personalized mock
          interviews, scores your industry readiness, closes your skill gaps,
          and even helps you validate your startup idea — all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button variant="gradient" size="lg" asChild className="group">
            <Link href="/sign-up">
              Start practicing free
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#modules">Explore the platform</a>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-warning text-warning" />
            ))}
          </div>
          <span>Loved by students &amp; early-career engineers</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.32 }}
          className="mx-auto mt-16 max-w-4xl"
        >
          <InterviewPreview />
        </motion.div>
      </div>
    </section>
  );
}
