"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PRODUCT_TYPES, StartupBriefSchema, EXAMPLE_BRIEF, type StartupBrief } from "@/lib/startup/types";

export function StartupForm({ initial, editing, onSave, onCancel }: { initial: StartupBrief; editing: boolean; onSave: (brief: StartupBrief) => void; onCancel?: () => void }) {
  const [brief, setBrief] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  function update<K extends keyof StartupBrief>(key: K, value: StartupBrief[K]) { setBrief(current => ({ ...current, [key]: value })); }
  function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = StartupBriefSchema.safeParse(brief);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map(issue => [String(issue.path[0]), issue.message])));
      return;
    }
    setErrors({});
    onSave(parsed.data);
  }
  const field = (key: "name" | "idea" | "audience" | "problem" | "alternative" | "advantage" | "skills" | "features" | "constraints", title: string, placeholder: string, max: number, required = false) => <div className="space-y-2">
    <Label htmlFor={`startup-brief-${key}`}>{title}{!required && <span className="font-normal text-muted-foreground"> (optional)</span>}</Label>
    {key === "name" || key === "audience" ? <Input id={`startup-brief-${key}`} value={brief[key]} onChange={event => update(key, event.target.value)} maxLength={max} required={required} placeholder={placeholder} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `startup-error-${key}` : undefined} /> : <Textarea id={`startup-brief-${key}`} value={brief[key]} onChange={event => update(key, event.target.value)} maxLength={max} required={required} placeholder={placeholder} rows={key === "features" ? 3 : 2} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `startup-error-${key}` : undefined} />}
    {errors[key] && <p id={`startup-error-${key}`} className="text-sm text-destructive">{errors[key]}</p>}
  </div>;
  return <form onSubmit={submit} className="rounded-xl border border-border bg-card p-5 sm:p-7">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold">{editing ? "Refine your brief" : "Start with a specific problem"}</h2><p className="mt-1 text-sm text-muted-foreground">A narrow first customer makes the next step easier to test.</p></div>{!editing && <Button type="button" variant="ghost" onClick={() => { setBrief({ ...EXAMPLE_BRIEF }); setErrors({}); }}>Try an example</Button>}</div>
    <div className="mt-6 space-y-5">
      {field("name", "Working name", "Give this idea a short name", 80, true)}
      {field("idea", "What are you building?", "Describe what the customer can do and the useful result they get.", 2000, true)}
      {field("audience", "Who is the first customer?", "e.g. Placement coordinators at small engineering colleges", 400, true)}
      {field("problem", "What problem do they face?", "Describe a specific situation, what happens today and why it is frustrating.", 1200, true)}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="startup-product">Product type</Label><Select id="startup-product" value={brief.productType} onChange={event => update("productType", event.target.value as StartupBrief["productType"])}>{PRODUCT_TYPES.map(item => <option key={item}>{item}</option>)}</Select></div>
        <div className="space-y-2"><Label htmlFor="startup-customer">Customer type</Label><Select id="startup-customer" value={brief.customerType} onChange={event => update("customerType", event.target.value as StartupBrief["customerType"])}><option>Individuals</option><option>Businesses</option></Select></div>
        <div className="space-y-2"><Label htmlFor="startup-goal">Main goal</Label><Select id="startup-goal" value={brief.goal} onChange={event => update("goal", event.target.value as StartupBrief["goal"])}><option>Validate demand</option><option>Build an MVP</option></Select></div>
        <div className="space-y-2"><Label htmlFor="startup-stage">Current stage</Label><Select id="startup-stage" value={brief.stage} onChange={event => update("stage", event.target.value as StartupBrief["stage"])}>{["Idea", "Customer conversations", "Prototype", "Paying customers"].map(stage => <option key={stage}>{stage}</option>)}</Select></div>
        <div className="space-y-2"><Label htmlFor="startup-weeks">Planning window (weeks)</Label><Input id="startup-weeks" type="number" min={2} max={12} required value={Number.isNaN(brief.weeks) ? "" : brief.weeks} onChange={event => update("weeks", event.target.valueAsNumber)} />{errors.weeks && <p className="text-sm text-destructive">{errors.weeks}</p>}</div>
        <div className="space-y-2"><Label htmlFor="startup-hours">Total team hours per week</Label><Input id="startup-hours" type="number" min={1} max={80} required value={Number.isNaN(brief.hoursPerWeek) ? "" : brief.hoursPerWeek} onChange={event => update("hoursPerWeek", event.target.valueAsNumber)} />{errors.hoursPerWeek && <p className="text-sm text-destructive">{errors.hoursPerWeek}</p>}</div>
      </div>
      <details className="rounded-lg border border-border p-4" open={errors.features ? true : undefined}>
        <summary className="cursor-pointer text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring">Add context and technical requirements</summary>
        <div className="mt-5 space-y-5">
          {field("alternative", "What do customers use today?", "Include manual workarounds or alternatives you have actually observed.", 600)}
          {field("advantage", "Why might they switch?", "Describe the benefit you want to test. Treat this as a hypothesis.", 600)}
          {field("skills", "Your team's skills and tools", "e.g. Python, React, spreadsheets, design, campus community access", 600)}
          {field("features", "Up to three core features, one per line", "Leave blank to use a starting scope for your product type.", 1000)}
          {field("constraints", "Constraints", "e.g. No paid services, evenings only, must work on older phones", 1000)}
          <fieldset className="space-y-3"><legend className="mb-3 text-sm font-medium">Requirements to plan for</legend>{([ ["needsAccounts", "Private accounts or customer records"], ["needsPayments", "Payments in the proposed product"], ["sensitiveData", "Sensitive customer data"] ] as const).map(([key, title]) => <label key={key} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={brief[key]} onChange={event => update(key, event.target.checked)} className="size-4 accent-primary" />{title}</label>)}</fieldset>
        </div>
      </details>
      {Object.keys(errors).length > 0 && <p role="alert" className="text-sm text-destructive">Check the marked fields. If you entered core features, keep the list to three.</p>}
      {editing && <p className="text-sm text-muted-foreground">Updating the brief rebuilds the worksheet and resets the task checklist. Your evidence log and cost assumptions stay saved.</p>}
      <div className="flex flex-wrap gap-3"><Button type="submit" className="min-h-11">{editing ? "Update worksheet" : "Build my worksheet"}</Button>{onCancel && <Button type="button" variant="outline" className="min-h-11" onClick={onCancel}>Cancel</Button>}</div>
      <p className="text-xs text-muted-foreground">No AI credits needed. Saved in this browser for your account; download a backup to move it to another device.</p>
    </div>
  </form>;
}
