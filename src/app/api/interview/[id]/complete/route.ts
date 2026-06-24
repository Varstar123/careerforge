import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { summarizeInterview } from "@/lib/ai/summarize-interview";
import { apiError, handleApiError } from "@/lib/api";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const interview = await prisma.interview.findFirst({
      where: { id, userId: user.id },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: { answer: { include: { evaluation: true } } },
        },
      },
    });
    if (!interview) return apiError("Interview not found.", 404);

    const evals = interview.questions
      .map((q) => q.answer?.evaluation)
      .filter((e): e is NonNullable<typeof e> => Boolean(e));

    if (evals.length === 0) {
      return apiError("Answer at least one question before completing.", 400);
    }

    const overall = Math.round(
      evals.reduce((sum, e) => sum + e.score, 0) / evals.length,
    );

    const summary = await summarizeInterview({
      targetRole: interview.targetRole,
      seniority: interview.seniority,
      overall,
      perQuestion: interview.questions
        .filter((q) => q.answer?.evaluation)
        .map((q) => ({
          category: q.category,
          score: q.answer!.evaluation!.score,
          strengths: (q.answer!.evaluation!.strengths as string[]) ?? [],
          improvements: (q.answer!.evaluation!.improvements as string[]) ?? [],
        })),
    });

    await prisma.interview.update({
      where: { id: interview.id },
      data: {
        status: "COMPLETED",
        overallScore: overall,
        summary,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ overallScore: overall, summary });
  } catch (err) {
    return handleApiError(err);
  }
}
