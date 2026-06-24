import type { ParsedResume } from "./types";

export const RESUME_PARSE_SYSTEM = `You are an expert technical recruiter and resume parser.
Extract structured data from the raw resume text provided by the user.
- Be faithful to the resume; never invent experience, but normalise skill names (e.g. "ReactJS" -> "React").
- Infer "seniority" from years of experience and scope: Student (no industry exp), Entry (0-2y), Mid (2-5y), Senior (5-9y), Lead (9y+ or leadership).
- "suggestedRoles" should be 3-5 realistic roles this candidate could interview for.
Return ONLY valid JSON matching the requested schema.`;

export function resumeParseUser(rawText: string) {
  const trimmed = rawText.slice(0, 16000);
  return `Resume text:\n"""\n${trimmed}\n"""`;
}

interface QuestionGenInput {
  resume: ParsedResume;
  targetRole: string;
  seniority: string;
  focus: "TECHNICAL" | "BEHAVIORAL" | "HR" | "MIXED";
  count: number;
}

export const QUESTION_GEN_SYSTEM = `You are a senior interviewer at a top tech company conducting a tailored mock interview.
Generate sharp, realistic interview questions grounded in THIS candidate's actual resume.
Rules:
- Reference concrete skills, projects and experience from the resume in your "rationale".
- TECHNICAL questions should probe real depth in the candidate's listed stack and the target role.
- BEHAVIORAL/HR questions follow STAR-style competency probing.
- Calibrate difficulty to the requested seniority.
- Vary categories; avoid duplicates.
Return ONLY valid JSON matching the requested schema.`;

export function questionGenUser({
  resume,
  targetRole,
  seniority,
  focus,
  count,
}: QuestionGenInput) {
  const mix =
    focus === "MIXED"
      ? "a balanced mix of TECHNICAL, BEHAVIORAL and HR questions (lean ~60% technical)"
      : focus === "TECHNICAL"
        ? "primarily TECHNICAL and SYSTEM_DESIGN questions"
        : focus === "BEHAVIORAL"
          ? "primarily BEHAVIORAL questions"
          : "primarily HR / culture-fit questions";

  return `Target role: ${targetRole}
Seniority: ${seniority}
Generate ${count} questions — ${mix}.

Candidate profile (parsed from resume):
- Skills: ${resume.skills.join(", ") || "n/a"}
- Experience: ${
    resume.experience
      .map((e) => `${e.role} @ ${e.company}`)
      .join("; ") || "n/a"
  }
- Projects: ${resume.projects.map((p) => p.name).join(", ") || "n/a"}
- Summary: ${resume.summary || "n/a"}`;
}

interface EvalInput {
  questionText: string;
  questionType: string;
  category: string;
  targetRole: string;
  seniority: string;
  answer: string;
}

export const EVAL_SYSTEM = `You are an exacting but encouraging interview coach.
Grade the candidate's answer to the interview question on a 0-100 scale across:
- correctness (technical/factual accuracy and relevance)
- communication (structure, clarity, conciseness)
- depth (insight, trade-offs, concrete examples)
Then set an overall "score" reflecting all three.
Be specific and reference what the candidate actually said. Provide 2-4 concrete "strengths" and 2-4 actionable "improvements".
"modelAnswer" is a concise example of a strong answer (3-6 sentences).
Be fair to short answers: if the answer is empty or evasive, score low and say why.
Return ONLY valid JSON matching the requested schema.`;

export function evalUser({
  questionText,
  questionType,
  category,
  targetRole,
  seniority,
  answer,
}: EvalInput) {
  return `Context: ${seniority} candidate interviewing for "${targetRole}".
Question type: ${questionType} (${category})
Question: ${questionText}

Candidate's answer:
"""
${answer || "(no answer provided)"}
"""`;
}
