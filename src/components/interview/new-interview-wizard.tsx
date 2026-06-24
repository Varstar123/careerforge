"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ResumeUploader,
  type UploadedResume,
} from "@/components/interview/resume-uploader";
import { cn } from "@/lib/utils";

export interface ResumeOption {
  id: string;
  fileName: string;
  isPrimary: boolean;
  skills: string[];
  seniority: string;
  suggestedRoles: string[];
}

const SENIORITIES = ["Student", "Entry", "Mid", "Senior", "Lead"] as const;
const FOCUSES = [
  { key: "MIXED", label: "Mixed", hint: "Technical + behavioral" },
  { key: "TECHNICAL", label: "Technical", hint: "Deep skills & design" },
  { key: "BEHAVIORAL", label: "Behavioral", hint: "STAR competencies" },
  { key: "HR", label: "HR", hint: "Culture & motivation" },
] as const;

export function NewInterviewWizard({
  initialResumes,
}: {
  initialResumes: ResumeOption[];
}) {
  const router = useRouter();
  const initialSelected =
    initialResumes.find((r) => r.isPrimary) ?? initialResumes[0] ?? null;

  const [resumes, setResumes] = React.useState<ResumeOption[]>(initialResumes);
  const [step, setStep] = React.useState(0);
  const [selectedId, setSelectedId] = React.useState<string | null>(
    initialSelected?.id ?? null,
  );

  const selected = resumes.find((r) => r.id === selectedId) ?? null;

  const [targetRole, setTargetRole] = React.useState(
    initialSelected?.suggestedRoles[0] ?? "",
  );
  const [seniority, setSeniority] = React.useState<string>(
    initialSelected?.seniority || "Entry",
  );
  const [focus, setFocus] =
    React.useState<(typeof FOCUSES)[number]["key"]>("MIXED");
  const [count, setCount] = React.useState(6);
  const [submitting, setSubmitting] = React.useState(false);

  // Prefill config from a resume (only fills the role if still empty).
  function applyResumeDefaults(r: ResumeOption) {
    setSeniority(r.seniority || "Entry");
    setTargetRole((prev) => prev || r.suggestedRoles[0] || "");
  }

  function selectResume(id: string) {
    setSelectedId(id);
    const r = resumes.find((x) => x.id === id);
    if (r) applyResumeDefaults(r);
  }

  function handleUploaded(r: UploadedResume) {
    const option: ResumeOption = {
      id: r.id,
      fileName: r.fileName,
      isPrimary: r.isPrimary,
      skills: r.parsed.skills ?? [],
      seniority: r.parsed.seniority ?? "Entry",
      suggestedRoles: r.parsed.suggestedRoles ?? [],
    };
    setResumes((prev) => [option, ...prev.filter((p) => p.id !== r.id)]);
    setSelectedId(option.id);
    applyResumeDefaults(option);
  }

  async function createInterview() {
    if (!selected || !targetRole.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/interview/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selected.id,
          targetRole: targetRole.trim(),
          seniority,
          focus,
          count,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create interview");
      toast.success("Interview ready", {
        description: "Generating your questions…",
      });
      router.push(`/dashboard/interview/${data.interviewId}`);
    } catch (err) {
      setSubmitting(false);
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Stepper step={step} />

      {step === 0 && (
        <div className="space-y-4">
          {resumes.length > 0 && (
            <div className="space-y-2">
              <Label>Use an existing resume</Label>
              <div className="grid gap-2">
                {resumes.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => selectResume(r.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                      selectedId === r.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {r.fileName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.seniority} · {r.skills.slice(0, 4).join(", ") || "—"}
                      </p>
                    </div>
                    {selectedId === r.id && (
                      <CheckCircle2 className="size-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>{resumes.length > 0 ? "…or upload a new one" : "Upload your resume"}</Label>
            <ResumeUploader onUploaded={handleUploaded} compact />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setStep(1)}
              disabled={!selected}
              variant="gradient"
            >
              Continue <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 1 && selected && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="role">Target role</Label>
            <Input
              id="role"
              placeholder="e.g. Frontend Engineer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
            {selected.suggestedRoles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selected.suggestedRoles.slice(0, 5).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setTargetRole(role)}
                    className="transition-transform hover:scale-[1.03]"
                  >
                    <Badge
                      variant={targetRole === role ? "default" : "outline"}
                    >
                      {role}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="seniority">Seniority</Label>
              <Select
                id="seniority"
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
              >
                {SENIORITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="count">Number of questions</Label>
              <Select
                id="count"
                value={String(count)}
                onChange={(e) => setCount(Number(e.target.value))}
              >
                {[4, 6, 8, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} questions
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Interview focus</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FOCUSES.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFocus(f.key)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors",
                    focus === f.key
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <p className="text-sm font-medium">{f.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {f.hint}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>
              <ArrowLeft className="size-4" /> Back
            </Button>
            <Button
              variant="gradient"
              onClick={createInterview}
              disabled={!targetRole.trim() || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Generate interview
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  const labels = ["Resume", "Configure"];
  return (
    <div className="mb-8 flex items-center gap-3">
      {labels.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "grid size-7 place-items-center rounded-full text-xs font-semibold transition-colors",
                i <= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "text-sm font-medium",
                i <= step ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div className="h-px flex-1 bg-border" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
