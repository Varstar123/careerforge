"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, TrendingUp } from "lucide-react";

const metrics = [
  { label: "Correctness", value: 88 },
  { label: "Communication", value: 82 },
  { label: "Depth", value: 76 },
];

export function InterviewPreview() {
  return (
    <div className="relative rounded-2xl border border-border bg-card/60 p-2 shadow-2xl shadow-primary/5 backdrop-blur">
      <div className="rounded-xl border border-border bg-background/80 p-5 text-left sm:p-7">
        {/* window chrome */}
        <div className="mb-5 flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-destructive/70" />
          <span className="size-3 rounded-full bg-warning/70" />
          <span className="size-3 rounded-full bg-success/70" />
          <div className="ml-3 inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            <Sparkles className="size-3 text-primary" /> Mock interview ·
            Frontend Engineer
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-5">
          {/* question + answer */}
          <div className="space-y-3 sm:col-span-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-primary">
                Question 3 · React
              </div>
              <p className="text-sm">
                Your resume mentions a real-time dashboard. How would you keep a
                React UI responsive while streaming hundreds of updates per
                second?
              </p>
            </div>

            <div className="rounded-lg border border-border bg-secondary/40 p-4">
              <div className="mb-1 text-xs font-medium text-muted-foreground">
                Your answer
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                I&apos;d batch updates with a buffer flushed on
                requestAnimationFrame, virtualize long lists, and memoize rows
                so only changed cells re-render…
              </p>
            </div>
          </div>

          {/* evaluation */}
          <div className="space-y-3 sm:col-span-2">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  AI Evaluation
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                  <TrendingUp className="size-3" /> 84
                </span>
              </div>
              <div className="space-y-2.5">
                {metrics.map((m, i) => (
                  <div key={m.label}>
                    <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                      <span>{m.label}</span>
                      <span>{m.value}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${m.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.15 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                Strengths
              </div>
              <ul className="space-y-1.5">
                {["Batching strategy", "Mentioned virtualization"].map((s) => (
                  <li
                    key={s}
                    className="flex items-center gap-2 text-xs text-foreground"
                  >
                    <CheckCircle2 className="size-3.5 text-success" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
