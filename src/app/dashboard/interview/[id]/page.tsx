import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOrCreateUser } from "@/lib/auth";
import { getInterviewDetail } from "@/lib/queries";
import { toEvaluationView } from "@/lib/serialize";
import {
  InterviewRunner,
  type RunnerQuestion,
} from "@/components/interview/interview-runner";

export const metadata = { title: "Interview" };

export default async function InterviewRunnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getOrCreateUser();
  if (!user) return null;

  const interview = await getInterviewDetail(id, user.id);
  if (!interview) notFound();
  if (interview.status === "COMPLETED") {
    redirect(`/dashboard/interview/${id}/results`);
  }

  const questions: RunnerQuestion[] = interview.questions.map((q) => ({
    id: q.id,
    order: q.order,
    type: q.type,
    category: q.category,
    text: q.text,
    difficulty: q.difficulty,
    rationale: q.rationale,
    answerText: q.answer?.text ?? "",
    evaluation: toEvaluationView(q.answer?.evaluation),
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/dashboard/interview"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All interviews
      </Link>
      <InterviewRunner
        interviewId={interview.id}
        title={interview.title}
        targetRole={interview.targetRole}
        initialQuestions={questions}
      />
    </div>
  );
}
