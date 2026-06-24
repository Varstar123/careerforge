import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, RefreshCw, ChevronDown, Sparkles } from "lucide-react";
import { getOrCreateUser } from "@/lib/auth";
import { getInterviewDetail } from "@/lib/queries";
import { toEvaluationView } from "@/lib/serialize";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { EvaluationCard } from "@/components/interview/evaluation-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const metadata = { title: "Interview results" };

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getOrCreateUser();
  if (!user) return null;

  const interview = await getInterviewDetail(id, user.id);
  if (!interview) notFound();
  if (interview.status !== "COMPLETED") {
    redirect(`/dashboard/interview/${id}`);
  }

  const answered = interview.questions.filter((q) => q.answer?.evaluation);
  const evals = answered.map((q) => q.answer!.evaluation!);

  const avg = (key: "correctness" | "communication" | "depth") =>
    evals.length
      ? Math.round(evals.reduce((s, e) => s + e[key], 0) / evals.length)
      : 0;

  const metrics = [
    { label: "Correctness", value: avg("correctness") },
    { label: "Communication", value: avg("communication") },
    { label: "Depth", value: avg("depth") },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/dashboard/interview"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All interviews
      </Link>

      {/* Summary header */}
      <Card className="overflow-hidden">
        <div className="relative p-6 sm:p-8">
          <div className="pointer-events-none absolute right-0 top-0 size-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <ScoreRing
              value={interview.overallScore ?? 0}
              size={120}
              label="overall"
            />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-xl font-semibold tracking-tight">
                  {interview.title}
                </h1>
                <Badge variant="success">Completed</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {interview.targetRole} · {interview.seniority} ·{" "}
                {answered.length} questions
              </p>
              {interview.summary && (
                <p className="mt-4 flex items-start gap-2 rounded-lg bg-secondary/40 p-3 text-sm leading-relaxed">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  {interview.summary}
                </p>
              )}
            </div>
          </div>

          <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-lg border border-border p-3">
                <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                  <span>{m.label}</span>
                  <span className="tabular-nums">{m.value}</span>
                </div>
                <Progress value={m.value} className="h-1.5" />
              </div>
            ))}
          </div>

          <div className="relative mt-6 flex flex-wrap gap-3">
            <Button variant="gradient" asChild>
              <Link href="/dashboard/interview/new">
                <Plus className="size-4" /> Practice again
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/interview/${id}`}>
                <RefreshCw className="size-4" /> Review &amp; re-answer
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* Per-question breakdown */}
      <h2 className="mb-3 mt-8 font-semibold">Question breakdown</h2>
      <div className="space-y-3">
        {interview.questions.map((q, i) => {
          const evaluation = toEvaluationView(q.answer?.evaluation);
          return (
            <details
              key={q.id}
              className="group rounded-xl border border-border bg-card [&_summary::-webkit-details-marker]:hidden"
              open={i === 0}
            >
              <summary className="flex cursor-pointer items-center gap-3 p-4">
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-lg text-sm font-semibold ${
                    evaluation
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {evaluation ? evaluation.score : "—"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{q.text}</p>
                  <p className="text-xs text-muted-foreground">
                    {q.category} · {q.type}
                  </p>
                </div>
                <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="space-y-4 border-t border-border p-4">
                {q.answer ? (
                  <>
                    <div className="rounded-lg border border-border bg-secondary/30 p-4">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        Your answer
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {q.answer.text}
                      </p>
                    </div>
                    {evaluation && <EvaluationCard evaluation={evaluation} />}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Not answered.
                  </p>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
