"use client";

import { Upload, Cpu, Target } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload your resume",
    desc: "Drop in a PDF or DOCX. We extract your skills, projects and experience in seconds.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "Practice with AI",
    desc: "Run interviews tailored to your background and target role. Answer, get scored, repeat.",
  },
  {
    icon: Target,
    step: "03",
    title: "Track & grow",
    desc: "See your readiness rise, close skill gaps, and walk into the real interview prepared.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">How it works</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            From resume to ready in three steps
          </h2>
        </Reveal>

        <div className="relative mt-14 grid gap-8 md:grid-cols-3">
          <div className="pointer-events-none absolute inset-x-[16%] top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
          {steps.map((s, i) => (
            <Reveal key={s.step} delay={i * 0.1} className="text-center">
              <div className="relative mx-auto mb-5 grid size-14 place-items-center rounded-2xl border border-border bg-card text-primary shadow-sm">
                <s.icon className="size-6" />
                <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {s.step}
                </span>
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
