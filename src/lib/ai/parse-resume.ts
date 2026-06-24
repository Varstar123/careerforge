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
  const json = JSON.parse(content);
  // Zod fills defaults and coerces, so partial model output stays safe.
  return ParsedResumeSchema.parse(json);
}
