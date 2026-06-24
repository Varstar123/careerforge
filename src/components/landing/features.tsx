"use client";

import {
  FileText,
  MessagesSquare,
  Gauge,
  Compass,
  Rocket,
  LineChart,
} from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

const features = [
  {
    icon: FileText,
    title: "Resume intelligence",
    desc: "We parse your resume into skills, projects and experience — the foundation for everything that follows.",
  },
  {
    icon: MessagesSquare,
    title: "Personalized interviews",
    desc: "Technical, behavioral and HR questions generated from your actual background, not a generic question bank.",
  },
  {
    icon: Gauge,
    title: "Instant scoring",
    desc: "Every answer is graded on correctness, communication and depth with concrete, actionable feedback.",
  },
  {
    icon: Compass,
    title: "Readiness analysis",
    desc: "See exactly where you stand against your target role and what to learn next to close the gap.",
  },
  {
    icon: Rocket,
    title: "AI startup builder",
    desc: "Turn an idea into a plan — business, finance, product, architecture and marketing agents working together.",
  },
  {
    icon: LineChart,
    title: "Progress tracking",
    desc: "Watch your scores climb over time with analytics that keep you accountable and motivated.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">
            Everything you need
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            One platform from first draft to dream offer
          </h2>
          <p className="mt-4 text-muted-foreground">
            CareerForge replaces a dozen fragmented tools with a single AI-native
            workspace built for your growth.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <div className="group h-full rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                <div className="mb-4 inline-flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
