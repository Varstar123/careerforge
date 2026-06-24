import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ParsedResumeSchema } from "@/lib/types";
import { generateQuestions } from "@/lib/ai/generate-questions";
import { apiError, handleApiError } from "@/lib/api";

export const runtime = "nodejs";
export const maxDuration = 60;

const BodySchema = z.object({
  resumeId: z.string().min(1),
  targetRole: z.string().min(1).max(120),
  seniority: z.enum(["Student", "Entry", "Mid", "Senior", "Lead"]),
  focus: z.enum(["TECHNICAL", "BEHAVIORAL", "HR", "MIXED"]),
  count: z.number().int().min(3).max(12).default(6),
  title: z.string().max(120).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = BodySchema.parse(await req.json());

    const resume = await prisma.resume.findFirst({
      where: { id: body.resumeId, userId: user.id },
    });
    if (!resume) return apiError("Resume not found.", 404);

    const parsed = ParsedResumeSchema.parse(resume.parsed ?? {});

    const questions = await generateQuestions({
      resume: parsed,
      targetRole: body.targetRole,
      seniority: body.seniority,
      focus: body.focus,
      count: body.count,
    });

    if (questions.length === 0) {
      return apiError("Failed to generate questions. Please try again.", 502);
    }

    const interview = await prisma.interview.create({
      data: {
        userId: user.id,
        resumeId: resume.id,
        title:
          body.title?.trim() ||
          `${body.targetRole} — ${new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}`,
        targetRole: body.targetRole,
        seniority: body.seniority,
        focus: body.focus,
        status: "IN_PROGRESS",
        questions: {
          create: questions.map((q, i) => ({
            order: i,
            type: q.type,
            category: q.category,
            text: q.text,
            difficulty: q.difficulty,
            rationale: q.rationale,
          })),
        },
      },
    });

    return NextResponse.json({ interviewId: interview.id });
  } catch (err) {
    return handleApiError(err);
  }
}
