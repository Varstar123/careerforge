import { CheckCircle2, ArrowUpRight, Lightbulb } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { scoreBand, cn } from "@/lib/utils";

export interface EvaluationView {
  score: number;
  correctness: number;
  communication: number;
  depth: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
  modelAnswer?: string | null;
}

export function EvaluationCard({
  evaluation,
  showModelAnswer = true,
}: {
  evaluation: EvaluationView;
  showModelAnswer?: boolean;
}) {
  const band = scoreBand(evaluation.score);
  const metrics = [
    { label: "Correctness", value: evaluation.correctness },
    { label: "Communication", value: evaluation.communication },
    { label: "Depth", value: evaluation.depth },
  ];

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground">AI Evaluation</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-2xl font-semibold tabular-nums", band.className)}>
            {evaluation.score}
          </span>
          <span className={cn("text-xs font-medium", band.className)}>
            {band.label}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>{m.label}</span>
                <span className="tabular-nums">{m.value}</span>
              </div>
              <Progress value={m.value} className="h-1.5" />
            </div>
          ))}
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {evaluation.feedback}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {evaluation.strengths.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-success">
                <CheckCircle2 className="size-3.5" /> Strengths
              </p>
              <ul className="space-y-1.5">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-success" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {evaluation.improvements.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-warning">
                <ArrowUpRight className="size-3.5" /> To improve
              </p>
              <ul className="space-y-1.5">
                {evaluation.improvements.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {showModelAnswer && evaluation.modelAnswer && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Lightbulb className="size-3.5" /> Model answer
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {evaluation.modelAnswer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
