"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Send,
  ChevronLeft,
  ChevronRight,
  Flag,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  EvaluationCard,
  type EvaluationView,
} from "@/components/interview/evaluation-card";
import { revalidateInterviewViews } from "@/lib/actions";
import { cn } from "@/lib/utils";

export interface RunnerQuestion {
  id: string;
  order: number;
  type: string;
  category: string;
  text: string;
  difficulty: string;
  rationale?: string | null;
  answerText: string;
  evaluation: EvaluationView | null;
}

const TYPE_LABEL: Record<string, string> = {
  TECHNICAL: "Technical",
  BEHAVIORAL: "Behavioral",
  HR: "HR",
  SYSTEM_DESIGN: "System Design",
};

const DIFF_VARIANT: Record<
  string,
  "secondary" | "success" | "warning" | "destructive"
> = {
  EASY: "success",
  MEDIUM: "warning",
  HARD: "destructive",
};

export function InterviewRunner({
  interviewId,
  title,
  targetRole,
  initialQuestions,
}: {
  interviewId: string;
  title: string;
  targetRole: string;
  initialQuestions: RunnerQuestion[];
}) {
  const router = useRouter();
  const [questions, setQuestions] =
    React.useState<RunnerQuestion[]>(initialQuestions);
  const firstUnanswered = initialQuestions.findIndex((q) => !q.evaluation);
  const [index, setIndex] = React.useState(
    firstUnanswered === -1 ? 0 : firstUnanswered,
  );
  const [draft, setDraft] = React.useState(
    initialQuestions[firstUnanswered === -1 ? 0 : firstUnanswered]?.answerText ??
      "",
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [completing, setCompleting] = React.useState(false);

  const current = questions[index];
  const answeredCount = questions.filter((q) => q.evaluation).length;
  const progress = (answeredCount / questions.length) * 100;

  function goTo(i: number) {
    if (i < 0 || i >= questions.length) return;
    setIndex(i);
    setDraft(questions[i].answerText ?? "");
  }

  async function submitAnswer() {
    if (!draft.trim()) {
      toast.error("Write an answer before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/interview/${interviewId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: current.id, text: draft.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Evaluation failed");

      setQuestions((prev) =>
        prev.map((q, i) =>
          i === index
            ? { ...q, answerText: draft.trim(), evaluation: data.evaluation }
            : q,
        ),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function finishInterview() {
    setCompleting(true);
    try {
      const res = await fetch(`/api/interview/${interviewId}/complete`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not complete interview");
      // The API route can't bust the client Router Cache; without this the
      // Overview + interview list keep showing this interview as "In progress".
      await revalidateInterviewViews();
      toast.success("Interview complete!", {
        description: `Overall score: ${data.overallScore}/100`,
      });
      router.push(`/dashboard/interview/${interviewId}/results`);
    } catch (err) {
      setCompleting(false);
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      {/* Main column */}
      <div className="order-2 space-y-5 lg:order-1">
        {/* Progress */}
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">
              Question {index + 1} of {questions.length}
            </span>
            <span className="text-muted-foreground">
              {answeredCount}/{questions.length} answered
            </span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Question */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge>{TYPE_LABEL[current.type] ?? current.type}</Badge>
            <Badge variant="outline">{current.category}</Badge>
            <Badge variant={DIFF_VARIANT[current.difficulty] ?? "secondary"}>
              {current.difficulty}
            </Badge>
          </div>
          <p className="text-lg font-medium leading-relaxed">{current.text}</p>
          {current.rationale && (
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
              <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-primary" />
              {current.rationale}
            </p>
          )}
        </div>

        {/* Answer / evaluation */}
        {current.evaluation ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-secondary/30 p-4">
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Your answer
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {current.answerText}
              </p>
            </div>
            <EvaluationCard evaluation={current.evaluation} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setQuestions((prev) =>
                  prev.map((q, i) =>
                    i === index ? { ...q, evaluation: null } : q,
                  ),
                )
              }
            >
              Re-answer this question
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your answer as if you were speaking in a real interview…"
              className="min-h-40"
              disabled={submitting}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {draft.trim().split(/\s+/).filter(Boolean).length} words
              </span>
              <Button
                variant="gradient"
                onClick={submitAnswer}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Evaluating…
                  </>
                ) : (
                  <>
                    <Send className="size-4" /> Submit answer
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
          >
            <ChevronLeft className="size-4" /> Previous
          </Button>
          {index < questions.length - 1 ? (
            <Button variant="outline" onClick={() => goTo(index + 1)}>
              Next <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              variant="gradient"
              onClick={finishInterview}
              disabled={answeredCount === 0 || completing}
            >
              {completing ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Finishing…
                </>
              ) : (
                <>
                  <Flag className="size-4" /> Finish interview
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Sidebar question map */}
      <aside className="order-1 lg:order-2">
        <div className="rounded-xl border border-border bg-card p-4 lg:sticky lg:top-24">
          <p className="mb-1 text-sm font-medium">{title}</p>
          <p className="mb-4 text-xs text-muted-foreground">{targetRole}</p>
          <div className="grid grid-cols-6 gap-2 lg:grid-cols-4">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => goTo(i)}
                className={cn(
                  "grid aspect-square place-items-center rounded-lg border text-sm font-medium transition-colors",
                  i === index && "ring-2 ring-ring",
                  q.evaluation
                    ? "border-transparent bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40",
                )}
                title={q.category}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded bg-primary/15" /> Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded border border-border" /> Pending
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
