import { z } from "zod";
const text = z.string().trim().min(1).max(2000);
const finding = z.object({ title: text, evidence: text, action: text });
const score = z.number().int().min(0).max(100);
export const ReadinessRequestSchema = z.object({
  resumeId: z.string().min(1), targetRole: z.string().trim().min(2).max(120),
  seniority: z.enum(["Student", "Entry", "Mid", "Senior", "Lead"]),
  jobDescription: z.string().trim().max(12000).default(""),
});
export const ReadinessReportSchema = z.object({
  summary: text,
  dimensions: z.object({ roleFit: score, evidence: score, clarity: score, skills: score }),
  strengths: z.array(finding).min(1).max(6), weaknesses: z.array(finding).min(1).max(6),
  skillsToAdd: z.array(z.object({ skill: text, reason: text, nextStep: text })).max(8),
  skillsToRemove: z.array(z.object({ skill: text, reason: text })).max(8),
  evidenceChecks: z.array(z.object({ area: z.enum(["Decision", "Personal contribution", "Results and metrics"]), status: z.enum(["Supported", "Needs clarification", "Not evidenced"]), evidence: text, followUp: text })).length(3),
  actionPlan: z.array(z.object({ priority: z.enum(["High", "Medium", "Low"]), action: text, proof: text })).min(1).max(6),
});
export type ReadinessReport = z.infer<typeof ReadinessReportSchema>;
export function readinessScore(report: ReadinessReport) {
  const d = report.dimensions;
  return Math.round(d.roleFit * 0.3 + d.evidence * 0.3 + d.clarity * 0.2 + d.skills * 0.2);
}
