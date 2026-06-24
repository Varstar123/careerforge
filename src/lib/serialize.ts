import type { Evaluation } from "@prisma/client";
import type { EvaluationView } from "@/components/interview/evaluation-card";

/** Convert a Prisma Evaluation (Json fields) into the view shape. */
export function toEvaluationView(e: Evaluation | null | undefined): EvaluationView | null {
  if (!e) return null;
  return {
    score: e.score,
    correctness: e.correctness,
    communication: e.communication,
    depth: e.depth,
    strengths: (e.strengths as string[]) ?? [],
    improvements: (e.improvements as string[]) ?? [],
    feedback: e.feedback,
    modelAnswer: e.modelAnswer,
  };
}
