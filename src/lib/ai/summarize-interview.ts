import { getOpenAI, MODELS, llmConfigured } from "@/lib/openai";

interface SummaryInput {
  targetRole: string;
  seniority: string;
  overall: number;
  perQuestion: {
    category: string;
    score: number;
    strengths: string[];
    improvements: string[];
  }[];
}

/**
 * Produce a short coaching summary for a completed interview. Best-effort:
 * falls back to a deterministic message if the LLM call fails.
 */
export async function summarizeInterview({
  targetRole,
  seniority,
  overall,
  perQuestion,
}: SummaryInput): Promise<string> {
  const fallback =
    overall >= 75
      ? `Strong showing for a ${targetRole} interview — you scored ${overall}/100. Keep refining the weaker areas and you'll be interview-ready.`
      : `You scored ${overall}/100 for this ${targetRole} interview. Focus on the improvement areas below and run another round to track your progress.`;

  if (!llmConfigured) return fallback;

  try {
    const digest = perQuestion
      .map(
        (q) =>
          `- ${q.category} (${q.score}/100). Strengths: ${q.strengths.join(
            "; ",
          )}. Improve: ${q.improvements.join("; ")}`,
      )
      .join("\n");

    const completion = await getOpenAI().chat.completions.create({
      model: MODELS.fast,
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content:
            "You are an encouraging interview coach. Write a concise 3-4 sentence overall summary of the candidate's mock interview performance, highlighting the biggest strength and the single most important thing to work on next. Be specific and motivating. Plain text only.",
        },
        {
          role: "user",
          content: `Role: ${targetRole} (${seniority}). Overall score: ${overall}/100.\nPer-question results:\n${digest}`,
        },
      ],
    });

    return completion.choices[0]?.message?.content?.trim() || fallback;
  } catch {
    return fallback;
  }
}
