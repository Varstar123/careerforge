"use client";

import { Reveal } from "@/components/landing/reveal";

const stats = [
  { value: "4", label: "AI modules in one platform" },
  { value: "3", label: "Score dimensions per answer" },
  { value: "<10s", label: "Resume parsed to interview" },
  { value: "100%", label: "Tailored to your resume" },
];

export function Stats() {
  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 py-12 sm:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.05} className="text-center">
            <div className="text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
              {s.value}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
