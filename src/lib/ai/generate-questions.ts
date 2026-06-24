import { getOpenAI, MODELS } from "@/lib/openai";
import { QUESTION_GEN_SYSTEM, questionGenUser } from "@/lib/prompts";
import {
  GeneratedQuestionSetSchema,
  type GeneratedQuestion,
  type ParsedResume,
} from "@/lib/types";

const JSON_SHAPE = `{
  "questions": [
    {
      "type": "TECHNICAL"|"BEHAVIORAL"|"HR"|"SYSTEM_DESIGN",
      "category": string,
      "text": string,
      "difficulty": "EASY"|"MEDIUM"|"HARD",
      "rationale": string
    }
  ]
}`;

interface GenerateOptions {
  resume: ParsedResume;
  targetRole: string;
  seniority: string;
  focus: "TECHNICAL" | "BEHAVIORAL" | "HR" | "MIXED";
  count?: number;
}

export async function generateQuestions({
  resume,
  targetRole,
  seniority,
  focus,
  count = 6,
}: GenerateOptions): Promise<GeneratedQuestion[]> {
  const completion = await getOpenAI().chat.completions.create({
    model: MODELS.fast,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: `${QUESTION_GEN_SYSTEM}\n\nJSON schema:\n${JSON_SHAPE}` },
      {
        role: "user",
        content: questionGenUser({ resume, targetRole, seniority, focus, count }),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? '{"questions":[]}';
  const json = JSON.parse(content);
  const parsed = GeneratedQuestionSetSchema.parse(json);
  return parsed.questions.slice(0, count);
}
