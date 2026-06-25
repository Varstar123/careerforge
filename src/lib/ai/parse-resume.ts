import { getOpenAI, MODELS } from "@/lib/openai";
import { RESUME_PARSE_SYSTEM, resumeParseUser } from "@/lib/prompts";
import { ParsedResumeSchema, type ParsedResume } from "@/lib/types";

const JSON_SHAPE = `{
  "fullName": string|null,
  "headline": string|null,
  "summary": string,
  "seniority": "Student"|"Entry"|"Mid"|"Senior"|"Lead",
  "yearsOfExperience": number,
  "skills": string[],
  "education": [{ "institution": string, "degree": string|null, "field": string|null, "year": string|null }],
  "experience": [{ "company": string, "role": string, "duration": string|null, "highlights": string[] }],
  "projects": [{ "name": string, "description": string, "tech": string[] }],
  "suggestedRoles": string[]
}`;

export async function parseResume(rawText: string): Promise<ParsedResume> {
  const completion = await getOpenAI().chat.completions.create({
    model: MODELS.fast,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: `${RESUME_PARSE_SYSTEM}\n\nJSON schema:\n${JSON_SHAPE}` },
      { role: "user", content: resumeParseUser(rawText) },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "{}";

  let json: unknown = {};
  try {
    json = JSON.parse(content);
  } catch {
    // Non-JSON output (rare with json_object mode) — fall back to defaults.
    json = {};
  }

  // The schema is fully `.catch`-guarded, so this won't throw on odd output;
  // safeParse is a final belt-and-suspenders guard.
  const result = ParsedResumeSchema.safeParse(json);
  const parsed = result.success ? result.data : ParsedResumeSchema.parse({});

  // Drop entries the model left effectively empty.
  parsed.education = parsed.education.filter((e) => e.institution.trim());
  parsed.experience = parsed.experience.filter(
    (e) => e.company.trim() || e.role.trim(),
  );
  parsed.projects = parsed.projects.filter((p) => p.name.trim());

  return parsed;
}
