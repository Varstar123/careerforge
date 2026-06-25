import { z } from "zod";

// Helper: a tolerant string-array — drops non-strings, never throws.
const stringArray = z
  .array(z.any())
  .transform((arr) =>
    arr.filter((s): s is string => typeof s === "string" && s.length > 0),
  )
  .catch([]);

/**
 * Structured resume extracted by the LLM from raw text.
 * Every field is resilient (defaults + `.catch`) so normal variance in the
 * model's JSON output can never crash resume upload. Worst case we keep less
 * structure, not throw.
 */
export const ParsedResumeSchema = z.object({
  fullName: z.string().nullable().catch(null).default(null),
  headline: z.string().nullable().catch(null).default(null),
  summary: z.string().catch("").default(""),
  seniority: z
    .enum(["Student", "Entry", "Mid", "Senior", "Lead"])
    .catch("Entry")
    .default("Entry"),
  yearsOfExperience: z.coerce.number().catch(0).default(0),
  skills: stringArray,
  education: z
    .array(
      z
        .object({
          institution: z.string().catch("").default(""),
          degree: z.string().nullable().catch(null).default(null),
          field: z.string().nullable().catch(null).default(null),
          year: z.string().nullable().catch(null).default(null),
        })
        .catch({
          institution: "",
          degree: null,
          field: null,
          year: null,
        }),
    )
    .catch([])
    .default([]),
  experience: z
    .array(
      z
        .object({
          company: z.string().catch("").default(""),
          role: z.string().catch("").default(""),
          duration: z.string().nullable().catch(null).default(null),
          highlights: stringArray,
        })
        .catch({
          company: "",
          role: "",
          duration: null,
          highlights: [],
        }),
    )
    .catch([])
    .default([]),
  projects: z
    .array(
      z
        .object({
          name: z.string().catch("").default(""),
          description: z.string().catch("").default(""),
          tech: stringArray,
        })
        .catch({ name: "", description: "", tech: [] }),
    )
    .catch([])
    .default([]),
  suggestedRoles: stringArray,
});

export type ParsedResume = z.infer<typeof ParsedResumeSchema>;

/** A single generated interview question. `text` is the only hard requirement. */
export const GeneratedQuestionSchema = z.object({
  type: z
    .enum(["TECHNICAL", "BEHAVIORAL", "HR", "SYSTEM_DESIGN"])
    .catch("TECHNICAL")
    .default("TECHNICAL"),
  category: z.string().catch("General").default("General"),
  text: z.string().min(1),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).catch("MEDIUM").default("MEDIUM"),
  rationale: z.string().catch("").default(""),
});
export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;

export const GeneratedQuestionSetSchema = z.object({
  questions: z.array(GeneratedQuestionSchema),
});

// 0-100 score that tolerates strings/floats/out-of-range and never throws.
const scoreField = z.coerce
  .number()
  .transform((n) => Math.max(0, Math.min(100, Math.round(n || 0))))
  .catch(0);

/** LLM evaluation of a candidate's answer. */
export const AnswerEvaluationSchema = z.object({
  score: scoreField,
  correctness: scoreField,
  communication: scoreField,
  depth: scoreField,
  strengths: stringArray,
  improvements: stringArray,
  feedback: z.string().catch("").default(""),
  modelAnswer: z.string().catch("").default(""),
});
export type AnswerEvaluation = z.infer<typeof AnswerEvaluationSchema>;
