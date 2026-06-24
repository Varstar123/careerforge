import { z } from "zod";

/** Structured resume extracted by the LLM from raw text. */
export const ParsedResumeSchema = z.object({
  fullName: z.string().nullable().default(null),
  headline: z.string().nullable().default(null),
  summary: z.string().default(""),
  seniority: z
    .enum(["Student", "Entry", "Mid", "Senior", "Lead"])
    .default("Entry"),
  yearsOfExperience: z.number().min(0).max(60).default(0),
  skills: z.array(z.string()).default([]),
  education: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string().nullable().default(null),
        field: z.string().nullable().default(null),
        year: z.string().nullable().default(null),
      }),
    )
    .default([]),
  experience: z
    .array(
      z.object({
        company: z.string(),
        role: z.string(),
        duration: z.string().nullable().default(null),
        highlights: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().default(""),
        tech: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  suggestedRoles: z.array(z.string()).default([]),
});

export type ParsedResume = z.infer<typeof ParsedResumeSchema>;

/** A single generated interview question. */
export const GeneratedQuestionSchema = z.object({
  type: z.enum(["TECHNICAL", "BEHAVIORAL", "HR", "SYSTEM_DESIGN"]),
  category: z.string(),
  text: z.string(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  rationale: z.string().default(""),
});
export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;

export const GeneratedQuestionSetSchema = z.object({
  questions: z.array(GeneratedQuestionSchema).min(1),
});

/** LLM evaluation of a candidate's answer. */
export const AnswerEvaluationSchema = z.object({
  score: z.number().min(0).max(100),
  correctness: z.number().min(0).max(100),
  communication: z.number().min(0).max(100),
  depth: z.number().min(0).max(100),
  strengths: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([]),
  feedback: z.string(),
  modelAnswer: z.string().default(""),
});
export type AnswerEvaluation = z.infer<typeof AnswerEvaluationSchema>;
