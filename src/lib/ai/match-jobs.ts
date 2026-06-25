import { z } from "zod";
import { getOpenAI, MODELS } from "@/lib/openai";

export interface MatchCandidate {
  id: string;
  title: string;
  company: string;
  employmentType: string;
  location: string | null;
  skills: string[];
  snippet: string;
}

export interface ResumeProfile {
  skills: string[];
  seniority: string;
  roles: string[];
  summary: string;
}

export interface JobMatchResult {
  jobId: string;
  matchScore: number;
  reason: string;
}

const MatchSchema = z.object({
  matches: z
    .array(
      z.object({
        jobId: z.string(),
        matchScore: z.coerce
          .number()
          .transform((n) => Math.max(0, Math.min(100, Math.round(n || 0))))
          .catch(0),
        reason: z.string().catch("").default(""),
      }),
    )
    .catch([]),
});

const SYSTEM = `You are a job-fit matching engine for students and fresh graduates.
For each job, score 0-100 how well it fits the candidate's resume, and write a
short "reason" (1-2 sentences, addressed to the candidate as "You…") explaining
why it matches. Prioritise entry-level / internship suitability: penalise roles
demanding senior experience the candidate lacks; reward strong skill overlap and
student-friendly roles. Cover EVERY jobId provided exactly once.
Return ONLY valid JSON: {"matches":[{"jobId":string,"matchScore":number,"reason":string}]}`;

/**
 * Score & explain a batch of jobs against a resume in a single LLM call.
 * Candidates are capped by the caller; we keep the payload compact to control cost.
 */
export async function matchJobs({
  profile,
  candidates,
}: {
  profile: ResumeProfile;
  candidates: MatchCandidate[];
}): Promise<JobMatchResult[]> {
  if (candidates.length === 0) return [];

  const jobsPayload = candidates.map((c) => ({
    jobId: c.id,
    title: c.title,
    company: c.company,
    type: c.employmentType,
    location: c.location ?? "n/a",
    skills: c.skills.slice(0, 12),
    snippet: c.snippet.slice(0, 400),
  }));

  const user = `Candidate profile:
- Target roles: ${profile.roles.join(", ") || "n/a"}
- Seniority: ${profile.seniority}
- Skills: ${profile.skills.join(", ") || "n/a"}
- Summary: ${profile.summary || "n/a"}

Jobs to score (${jobsPayload.length}):
${JSON.stringify(jobsPayload)}`;

  const completion = await getOpenAI().chat.completions.create({
    model: MODELS.smart,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: user },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? '{"matches":[]}';
  let json: unknown = {};
  try {
    json = JSON.parse(content);
  } catch {
    json = {};
  }

  const parsed = MatchSchema.safeParse(json);
  const matches = parsed.success ? parsed.data.matches : [];

  // Only keep matches that reference a real candidate id.
  const validIds = new Set(candidates.map((c) => c.id));
  return matches.filter((m) => validIds.has(m.jobId));
}
