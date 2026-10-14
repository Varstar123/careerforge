"use client";

import { Check, ArrowUpRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { CostScenario } from "./cost-scenario";
import { buildStartupPlan } from "@/lib/startup/planner";
import type { StartupProject, StartupScenario } from "@/lib/startup/types";

export const SECTIONS = [ ["validation", "Validate demand"], ["mvp", "Define the MVP"], ["technical", "Plan the build"], ["customers", "Find first customers"], ["roadmap", "Track next steps"], ["costs", "Explore costs"], ["evidence", "Record evidence"] ] as const;

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return <section id={`startup-${id}`} aria-labelledby={`startup-${id}-heading`} className="startup-section scroll-mt-24 border-t border-border py-7 first:border-0">
    <h2 id={`startup-${id}-heading`} className="text-xl font-semibold tracking-tight">{title}</h2>
    {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
    <div className="mt-5">{children}</div>
  </section>;
}

export function StartupReport({ project, onToggleTask, onScenario, onNotes }: { project: StartupProject; onToggleTask: (id: string) => void; onScenario: (scenario: StartupScenario) => void; onNotes: (notes: string) => void }) {
  const brief = project.brief;
  const plan = buildStartupPlan(brief);
  const tasks = plan.roadmap.flatMap(phase => phase.tasks);
  const done = tasks.filter(task => project.completedTasks.includes(task.id)).length;
  return <article className="startup-document min-w-0 rounded-xl border border-border bg-card px-5 sm:px-8">
    <header className="py-7">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span className="rounded-md bg-secondary px-2 py-1">{brief.productType}</span><span>{brief.stage} · self-reported</span></div>
      <h1 className="mt-4 break-words text-3xl font-semibold tracking-tight">{brief.name}</h1>
      <p className="mt-3 max-w-2xl whitespace-pre-wrap break-words leading-relaxed">{brief.idea}</p>
      <dl className="mt-6 grid gap-5 sm:grid-cols-2">
        <div><dt className="text-xs font-medium text-muted-foreground">First customer</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm">{brief.audience}</dd></div>
        <div><dt className="text-xs font-medium text-muted-foreground">Problem to test</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm">{brief.problem}</dd></div>
        <div><dt className="text-xs font-medium text-muted-foreground">Current alternative</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm">{brief.alternative || "Not recorded. Ask customers what they do today."}</dd></div>
        <div><dt className="text-xs font-medium text-muted-foreground">Proposed advantage</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm">{brief.advantage || "Not recorded. Compare the trial outcome with the current workaround."}</dd></div>
      </dl>
      <div className="mt-6 border-l-2 border-primary pl-4"><h2 className="font-medium">Your first move</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{plan.firstAction}</p></div>
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">This is a guided worksheet tailored to your brief. It has not researched the market, verified your claims or established technical feasibility. Suggested decision rules are starting points you can adapt in the evidence log.</p>
    </header>

    <Section id="validation" title="Validate demand" description="Seek a recent problem, a concrete commitment and a useful result. Keep observations separate from assumptions.">
      <div className="space-y-6">{plan.experiments.map((experiment, index) => <div key={experiment.id} className="startup-block grid gap-2 sm:grid-cols-[1.75rem_1fr]">
        <span className="text-lg font-semibold text-primary" aria-hidden="true">{index + 1}</span>
        <div><h3 className="font-semibold">{experiment.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{experiment.method}</p><p className="mt-2 text-sm leading-relaxed">{experiment.decisionRule}</p></div>
      </div>)}</div>
      <details className="mt-6 rounded-lg border border-border p-4 print:hidden"><summary className="cursor-pointer font-medium focus-visible:outline-2 focus-visible:outline-ring">Customer interview guide</summary><ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-muted-foreground">{plan.interviewQuestions.map(q => <li key={q}>{q}</li>)}</ol></details>
      <div className="hidden print:block"><h3 className="mt-5 font-semibold">Customer interview guide</h3><ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">{plan.interviewQuestions.map(q => <li key={q}>{q}</li>)}</ol></div>
    </Section>

    <Section id="mvp" title="Define the MVP" description="Keep the first version to one useful workflow and no more than three core capabilities. These are scope suggestions, not proven requirements.">
      <div className="space-y-5">{plan.features.map((feature, index) => <div key={index} className="startup-block border-l border-border pl-4"><h3 className="font-semibold">{feature.title}</h3><p className="mt-1 text-sm text-muted-foreground">{feature.reason}</p><p className="mt-2 text-sm leading-relaxed"><span className="font-medium">Acceptance check: </span>{feature.acceptance}</p></div>)}</div>
      <div className="mt-6 rounded-lg bg-secondary/50 p-4"><h3 className="text-sm font-semibold">Keep out of this version</h3><ul className="mt-2 list-disc space-y-2 pl-4 text-sm text-muted-foreground">{plan.outOfScope.map(item => <li key={item}>{item}</li>)}</ul></div>
    </Section>

    <Section id="technical" title="Plan the build" description="Choose components around the tested workflow. A manual pilot is a valid first implementation.">
      <div className="space-y-5">{plan.architecture.map(item => <div key={item.title} className="startup-block"><h3 className="font-semibold">{item.title}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.detail}</p></div>)}</div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2"><div><h3 className="font-semibold">Initial data records</h3><ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-muted-foreground">{plan.entities.map(e => <li key={e}>{e}</li>)}</ul><p className="mt-3 text-xs text-muted-foreground">Adapt these starting records to your actual workflow; this is not a production database design.</p></div><div><h3 className="font-semibold">Capacity and constraints</h3><ul className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{plan.constraints.map(c => <li key={c}>{c}</li>)}</ul></div></div>
    </Section>

    <Section id="customers" title="Find first customers" description="Start with conversations and small trials. No paid ads or market-size assumptions are needed for these experiments.">
      <div className="space-y-5">{plan.channels.map(channel => <div key={channel.title} className="startup-block"><h3 className="flex items-center gap-2 font-semibold"><ArrowUpRight className="size-4 text-primary" aria-hidden="true" />{channel.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{channel.action}</p></div>)}</div>
      <h3 className="mt-6 font-semibold">Questions for the business model</h3><ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-muted-foreground">{plan.businessQuestions.map(q => <li key={q}>{q}</li>)}</ul>
    </Section>

    <Section id="roadmap" title="Track next steps" description="The timeboxes are a proposed order within your available capacity. Checking off work records activity; customer evidence determines whether the idea is validated.">
      <div className="mb-6 flex items-center gap-4"><Progress className="flex-1" value={done / tasks.length * 100} aria-label="Roadmap tasks completed" /><span className="shrink-0 text-sm tabular-nums text-muted-foreground">{done} / {tasks.length} done</span></div>
      <div className="space-y-7">{plan.roadmap.map(phase => <div key={phase.title} className="startup-block"><div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="font-semibold">{phase.title}</h3><p className="text-xs text-muted-foreground">{phase.week}</p></div><p className="mt-1 text-sm text-muted-foreground">{phase.outcome}</p><ul className="mt-4 space-y-3">{phase.tasks.map(task => <li key={task.id}><label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-secondary/30"><input type="checkbox" checked={project.completedTasks.includes(task.id)} onChange={() => onToggleTask(task.id)} className="mt-1 size-4 shrink-0 accent-primary" /><span className="min-w-0"><span className="text-sm font-medium">{task.title}</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{task.doneWhen}</span></span>{project.completedTasks.includes(task.id) && <Check className="mt-1 size-4 shrink-0 text-success" aria-hidden="true" />}</label></li>)}</ul></div>)}</div>
    </Section>

    <Section id="costs" title="Explore costs" description="An optional worksheet using only numbers you enter. Zero is the starting value, not an estimate of what your startup will cost."><CostScenario value={project.scenario} onChange={onScenario} /></Section>
    <Section id="evidence" title="Record evidence" description="Keep dates, anonymized observations, actual commitments and decisions here. Avoid storing sensitive customer details in the worksheet.">
      <label htmlFor="startup-notes" className="text-sm font-medium print:hidden">Evidence and decisions</label>
      <Textarea id="startup-notes" value={project.notes} onChange={event => onNotes(event.target.value)} maxLength={8000} rows={9} placeholder="Date · experiment · what happened · what contradicted the idea · decision · next test" className="mt-2 print:hidden" />
      <div className="hidden whitespace-pre-wrap text-sm print:block">{project.notes || "No evidence recorded yet."}</div>
      <p className="mt-2 text-xs text-muted-foreground print:hidden">Saved in this browser. Download a backup before clearing site data or switching devices.</p>
    </Section>
  </article>;
}
