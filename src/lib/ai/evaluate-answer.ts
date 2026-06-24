import { getOpenAI, MODELS } from "@/lib/openai";
import { EVAL_SYSTEM, evalUser } from "@/lib/prompts";
import { AnswerEvaluationSchema, type AnswerEvaluation } from "@/lib/types";

const JSON_SHAPE = `{
  "score": number, "correctness": number, "communication": number, "depth": number,
  "strengths": string[], "improvements": string[],
  "feedback": string, "modelAnswer": string
}`;

interface EvaluateOptions {
  questionText: string;
  questionType: string;
  category: string;
  targetRole: string;
  seniority: string;
  answer: string;
}

export async function evaluateAnswer(
  opts: EvaluateOptions,
): Promise<AnswerEvaluation> {
  const completion = await getOpenAI().chat.completions.create({
    model: MODELS.smart,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: `${EVAL_SYSTEM}\n\nJSON schema:\n${JSON_SHAPE}` },
      { role: "user", content: evalUser(opts) },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "{}";
  const json = JSON.parse(content);
  return AnswerEvaluationSchema.parse(json);
}
