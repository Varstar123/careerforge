import type { JobPreference } from "@prisma/client";
import type { ParsedResume } from "@/lib/types";

export interface JobSearchQuery {
  queryKey: string;
  query: string; // string sent to JSearch
  role: string;
  location: string | null;
  remoteOnly: boolean;
  employmentTypes: string[]; // JSearch tokens
}

/** Map our EmploymentType enum values to JSearch's employment_types tokens. */
function toJSearchTypes(jobTypes: string[]): string[] {
  const map: Record<string, string> = {
    FULLTIME: "FULLTIME",
    PARTTIME: "PARTTIME",
    INTERNSHIP: "INTERN",
    CONTRACT: "CONTRACTOR",
    FREELANCE: "CONTRACTOR",
  };
  const tokens = jobTypes.map((t) => map[t]).filter(Boolean);
  return Array.from(new Set(tokens));
}

function defaultTypesFor(level: string): string[] {
  if (level === "student") return ["INTERN"];
  if (level === "any") return ["FULLTIME", "INTERN", "CONTRACTOR", "PARTTIME"];
  return ["INTERN", "FULLTIME"]; // entry / fresher friendly
}

export function normalizeKey(
  role: string,
  location: string | null,
  remoteOnly: boolean,
  types: string[],
): string {
  return [
    role.trim().toLowerCase(),
    (location ?? "any").trim().toLowerCase(),
    remoteOnly ? "remote" : "any",
    [...types].sort().join(",").toLowerCase(),
  ].join("|");
}

interface BuildOpts {
  maxQueries?: number;
}

/**
 * Turn a parsed resume + saved preferences into a small set of normalized
 * search queries. Capped (default 3) to conserve the JSearch free quota.
 */
export function buildQueries(
  resume: ParsedResume | null,
  prefs: JobPreference | null,
  opts: BuildOpts = {},
): JobSearchQuery[] {
  const max = opts.maxQueries ?? 3;

  const prefRoles = (prefs?.roles as string[] | undefined)?.filter(Boolean) ?? [];
  const resumeRoles = resume?.suggestedRoles?.filter(Boolean) ?? [];
  const roles = (prefRoles.length ? prefRoles : resumeRoles).slice(0, max);
  if (roles.length === 0) roles.push("entry level software");

  const prefLocations =
    (prefs?.locations as string[] | undefined)?.filter(Boolean) ?? [];
  const location = prefLocations[0] ?? null;

  const remoteOnly = prefs?.remoteOnly ?? false;
  const level = prefs?.experienceLevel ?? "entry";
  const prefTypes = toJSearchTypes((prefs?.jobTypes as string[] | undefined) ?? []);
  const employmentTypes = prefTypes.length ? prefTypes : defaultTypesFor(level);

  const seen = new Set<string>();
  const queries: JobSearchQuery[] = [];

  for (const role of roles) {
    const queryKey = normalizeKey(role, location, remoteOnly, employmentTypes);
    if (seen.has(queryKey)) continue;
    seen.add(queryKey);

    const parts = [role];
    if (location) parts.push(`in ${location}`);
    else if (remoteOnly) parts.push("remote");

    queries.push({
      queryKey,
      query: parts.join(" "),
      role,
      location,
      remoteOnly,
      employmentTypes,
    });
    if (queries.length >= max) break;
  }

  return queries;
}

/** Curated student/fresher queries the daily cron keeps warm for everyone. */
export const CURATED_QUERIES: JobSearchQuery[] = [
  "software engineer intern",
  "frontend developer intern",
  "data analyst intern",
  "entry level software developer",
  "machine learning intern",
].map((role) => ({
  queryKey: normalizeKey(role, null, false, ["INTERN", "FULLTIME"]),
  query: role,
  role,
  location: null,
  remoteOnly: false,
  employmentTypes: ["INTERN", "FULLTIME"],
}));
