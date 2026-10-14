"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { ReadinessReportSchema, readinessScore, type ReadinessReport } from "@/lib/readiness";

type Resume = { id: string; fileName: string; seniority: string; roles: string[] };
export function ReadinessClient({ resumes }: { resumes: Resume[] }) {
  const [resumeId, setResumeId] = useState(resumes[0]?.id ?? "");
  const [targetRole, setTargetRole] = useState(resumes[0]?.roles[0] ?? "");
  const [seniority, setSeniority] = useState(resumes[0]?.seniority ?? "Entry");
  const [jobDescription, setJobDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ report: ReadinessReport; role: string; file: string; truncated: boolean } | null>(null);

  async function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/readiness", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeId, targetRole, seniority, jobDescription }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Analysis failed. Please try again.");
      const report = ReadinessReportSchema.parse(data.report);
      setResult({ report, role: targetRole, file: resumes.find(r => r.id === resumeId)?.fileName ?? "Resume", truncated: data.truncated === true });
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to analyze. Please try again."); }
    finally { setBusy(false); }
  }

  if (!resumes.length) return <Card className="p-8 text-center"><h2 className="text-xl font-extrabold">Start with your resume</h2><p className="mt-2 text-muted-foreground">Upload a resume to discover your strengths, skill gaps and next steps for your target role.</p><Link href="/dashboard/resumes" className="mt-6 inline-flex min-h-11 items-center gap-2 font-medium text-primary">Upload a resume <ArrowRight className="size-4" /></Link></Card>;

  return <div className="space-y-6">
    <Card className="p-6">
      <h2 className="text-lg font-extrabold">What role are you working toward?</h2>
      <p className="mt-1 text-sm text-muted-foreground">Choose your resume and goal. A job description makes recommendations more specific.</p>
      <form onSubmit={analyze} className="mt-6 space-y-5" aria-busy={busy}>
        <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="readiness-resume">Resume</Label><Select id="readiness-resume" value={resumeId} onChange={e => { setResumeId(e.target.value); setResult(null); const r = resumes.find(r => r.id === e.target.value); if (r) { setSeniority(r.seniority); setTargetRole(r.roles[0] ?? ""); } }}>{resumes.map(r => <option key={r.id} value={r.id}>{r.fileName}</option>)}</Select></div>
          <div className="space-y-2"><Label htmlFor="readiness-level">Target seniority</Label><Select id="readiness-level" value={seniority} onChange={e => { setSeniority(e.target.value); setResult(null); }}>{["Student", "Entry", "Mid", "Senior", "Lead"].map(s => <option key={s}>{s}</option>)}</Select></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="readiness-role">Target role</Label><Input id="readiness-role" required minLength={2} maxLength={120} placeholder="e.g. Frontend engineer" value={targetRole} onChange={e => { setTargetRole(e.target.value); setResult(null); }} /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="readiness-description">Job description (optional)</Label><Textarea id="readiness-description" rows={5} maxLength={12000} placeholder="Paste the responsibilities and requirements of a role you want." value={jobDescription} onChange={e => { setJobDescription(e.target.value); setResult(null); }} /><p className="text-xs text-muted-foreground">Without one, the analysis uses general expectations for your target role.</p></div>
        </fieldset>
        <Button type="submit" disabled={busy || targetRole.trim().length < 2} className="min-h-11">{busy && <Loader2 className="size-4 animate-spin" />}{busy ? "Analyzing your resume…" : "Analyze readiness"}</Button>
        <p role="status" className="text-sm text-muted-foreground">{busy ? "Reviewing role fit, evidence, skills and next steps. This may take a minute." : "Each analysis uses your selected resume and current target. Reports remain available on this page until you leave or change your target."}</p>
        {error && <p role="alert" className="text-sm text-destructive">{error} Use Analyze readiness to retry.</p>}
      </form>
    </Card>
    {result && <div className="space-y-6" aria-live="polite">
      <Card className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        <ScoreRing value={readinessScore(result.report)} size={128} label="out of 100" />
        <div className="min-w-0 flex-1"><p className="text-sm font-medium text-primary">Overall resume score</p><h2 className="mt-1 text-xl font-extrabold break-words">{result.role}</h2><p className="mt-1 break-words text-xs text-muted-foreground">{result.file}</p><p className="mt-3 text-sm leading-relaxed">{result.report.summary}</p><p className="mt-3 text-xs text-muted-foreground">AI estimate based on resume text, not a hiring prediction. Weighted score: role fit 30%, evidence 30%, clarity 20%, skills 20%.</p>{result.truncated && <p className="mt-2 text-sm text-muted-foreground">Only the first 24,000 characters of this resume were analyzed.</p>}</div>
      </Card>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{(Object.entries(result.report.dimensions) as [keyof ReadinessReport["dimensions"], number][]).map(([key, value]) => <Card key={key} className="p-4"><p className="text-sm text-muted-foreground">{{ roleFit: "Role fit", evidence: "Evidence", clarity: "Clarity", skills: "Relevant skills" }[key]}</p><p className="mt-2 text-2xl font-semibold">{value}<span className="text-sm font-normal text-muted-foreground"> / 100</span></p></Card>)}</div>
      <div className="grid gap-6 md:grid-cols-2">{(["strengths", "weaknesses"] as const).map(key => <Card key={key} className="p-6"><h3 className="text-lg font-bold">{key === "strengths" ? "Strengths to keep" : "Weaknesses to address"}</h3><ul className="mt-4 space-y-5">{result.report[key].map((item, i) => <li key={i}><h4 className="font-medium">{item.title}</h4><p className="mt-1 text-sm text-muted-foreground">{item.evidence}</p><p className="mt-2 text-sm">{item.action}</p></li>)}</ul></Card>)}</div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6"><h3 className="text-lg font-bold">Skills to learn or demonstrate</h3><p className="mt-1 text-sm text-muted-foreground">Add a skill to your resume only when you can back it up.</p><ul className="mt-4 space-y-5">{result.report.skillsToAdd.map((s, i) => <li key={i}><h4 className="font-medium">{s.skill}</h4><p className="mt-1 text-sm text-muted-foreground">{s.reason}</p><p className="mt-2 text-sm">{s.nextStep}</p></li>)}</ul>{!result.report.skillsToAdd.length && <p className="mt-4 text-sm">No priority skill additions identified.</p>}</Card>
        <Card className="p-6"><h3 className="text-lg font-bold">Skills to remove or de-emphasize</h3><p className="mt-1 text-sm text-muted-foreground">Make room for what matters to this role.</p><ul className="mt-4 space-y-5">{result.report.skillsToRemove.map((s, i) => <li key={i}><h4 className="font-medium">{s.skill}</h4><p className="mt-1 text-sm text-muted-foreground">{s.reason}</p></li>)}</ul>{!result.report.skillsToRemove.length && <p className="mt-4 text-sm">No listed skills need removing for this target.</p>}</Card>
      </div>
      <Card className="p-6"><h3 className="flex items-center gap-2 text-lg font-bold"><ShieldCheck className="size-5 text-primary" />Can you defend the story?</h3><p className="mt-2 text-sm text-muted-foreground">These checks assess what the text supports. They do not verify claims or assume missing metrics are false.</p><div className="mt-5 grid gap-6 md:grid-cols-3">{result.report.evidenceChecks.map(c => <div key={c.area}><h4 className="font-medium">{c.area}</h4><p className="mt-1 text-xs font-medium text-primary">{c.status}</p><p className="mt-3 text-sm text-muted-foreground">{c.evidence}</p><p className="mt-3 text-sm">{c.followUp}</p></div>)}</div></Card>
      <Card className="p-6"><h3 className="text-lg font-bold">Your next steps</h3><ol className="mt-5 space-y-5">{result.report.actionPlan.map((a, i) => <li key={i} className="flex gap-3"><span className="font-semibold text-primary">{i + 1}.</span><div><p className="text-xs font-medium text-muted-foreground">{a.priority} priority</p><p className="mt-1 font-medium">{a.action}</p><p className="mt-1 text-sm text-muted-foreground">Evidence to build: {a.proof}</p></div></li>)}</ol><Link href="/dashboard/interview/new" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary">Practice defending your experience <ArrowRight className="size-4" /></Link></Card>
    </div>}
  </div>;
}
