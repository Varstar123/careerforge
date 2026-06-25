import type { EmploymentType, WorkMode } from "@prisma/client";

/** Normalised listing shape we persist to JobListing (minus db-managed fields). */
export interface NormalizedJob {
  source: string;
  externalId: string;
  title: string;
  company: string;
  location: string | null;
  workMode: WorkMode;
  employmentType: EmploymentType;
  description: string;
  skills: string[];
  qualifications: string[];
  postedAt: Date | null;
  deadline: Date | null;
  applyUrl: string;
}

/** Map a free-form employment-type string to our enum. */
export function mapEmploymentType(t?: string): EmploymentType {
  switch ((t ?? "").toLowerCase().replace(/[\s-]+/g, "_")) {
    case "full_time":
    case "fulltime":
      return "FULLTIME";
    case "part_time":
    case "parttime":
      return "PARTTIME";
    case "internship":
    case "intern":
      return "INTERNSHIP";
    case "contract":
    case "contractor":
      return "CONTRACT";
    case "freelance":
      return "FREELANCE";
    default:
      return "OTHER";
  }
}

const INTERN_RE = /\bintern(ship)?s?\b/i;

/**
 * Classify a listing's employment type. The job TITLE wins for internships,
 * since sources frequently tag intern roles as "full_time" — which would
 * otherwise make the Internship filter return nothing.
 */
export function classifyEmployment(title: string, raw?: string): EmploymentType {
  if (INTERN_RE.test(title)) return "INTERNSHIP";
  return mapEmploymentType(raw);
}

/** Strip HTML tags + decode the common entities from a description blob. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
