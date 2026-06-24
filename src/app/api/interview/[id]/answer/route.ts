import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateAnswer } from "@/lib/ai/evaluate-answer";
import { apiError, handleApiError } from "@/lib/api";

export const runtime = "nodejs";
export const maxDuration = 60;

const BodySchema = z.object({
  questionId: z.string().min(1),
  text: z.string().max(8000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = BodySchema.parse(await req.json());

    const question = await prisma.question.findFirst({
      where: {
        id: body.questionId,
        interviewId: id,
        interview: { userId: user.id },
      },
      include: { interview: true },
    });
    if (!question) return apiError("Question not found.", 404);

    const evaluation = await evaluateAnswer({
      questionText: question.text,
      questionType: question.type,
      category: question.category,
      targetRole: question.interview.targetRole,
      seniority: question.interview.seniority,
      answer: body.text,
    });

    // Persist answer + evaluation (idempotent per question).
    const answer = await prisma.answer.upsert({
      where: { questionId: question.id },
      update: { text: body.text },
      create: { questionId: question.id, text: body.text },
    });

    await prisma.evaluation.upsert({
      where: { answerId: answer.id },
      update: {
        score: evaluation.score,
        correctness: evaluation.correctness,
        communication: evaluation.communication,
        depth: evaluation.depth,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        feedback: evaluation.feedback,
        modelAnswer: evaluation.modelAnswer,
      },
      create: {
        answerId: answer.id,
        score: evaluation.score,
        correctness: evaluation.correctness,
        communication: evaluation.communication,
        depth: evaluation.depth,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        feedback: evaluation.feedback,
        modelAnswer: evaluation.modelAnswer,
      },
    });

    return NextResponse.json({ evaluation });
  } catch (err) {
    return handleApiError(err);
  }
}
