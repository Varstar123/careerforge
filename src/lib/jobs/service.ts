import type { JobListing, JobMatch, JobPreference } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fetchJobsForQuery, jobsSourceReady } from "@/lib/jobs/sources";
import {
  buildQueries,
  type JobSearchQuery,
} from "@/lib/jobs/query-builder";
import { matchJobs, type MatchCandidate } from "@/lib/ai/match-jobs";
import { ParsedResumeSchema, type ParsedResume } from "@/lib/types";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const FORCE_COOLDOWN_MS = 60 * 60 * 1000; // min 1h between forced refetches
const MAX_CANDIDATES = 24; // cap jobs sent to the matcher in one call

export interface JobCardData {
  id: string; // job id
  title: string;
  company: string;
  location: string | null;
  workMode: string;
  employmentType: string;
  skills: string[];
  qualifications: string[];
  deadline: string | null;
  applyUrl: string;
  postedAt: string | null;
  matchScore: number;
  reason: string;
}

function isFresh(lastFetchedAt: Date) {
  return Date.now() - lastFetchedAt.getTime() < CACHE_TTL_MS;
}

/**
 * Ensure each query's listings are fresh in the cache. Skips queries fetched
 * <24h ago. No-ops gracefully when JSearch isn't configured (serves stale cache).
 */
export async function ensureListings(
  queries: JobSearchQuery[],
  { force = false }: { force?: boolean } = {},
): Promise<void> {
  for (const q of queries) {
    const cache = await prisma.jobQuery.findUnique({
      where: { queryKey: q.queryKey },
    });
    if (!force && cache && isFresh(cache.lastFetchedAt)) continue;
    if (!jobsSourceReady()) continue;

    try {
      const jobs = await fetchJobsForQuery(q);

      await Promise.all(
        jobs.map((job) =>
          prisma.jobListing.upsert({
            where: { externalId: job.externalId },
            update: { ...job, queryKey: q.queryKey },
            create: { ...job, queryKey: q.queryKey },
          }),
        ),
      );

      await prisma.jobQuery.upsert({
        where: { queryKey: q.queryKey },
        update: { lastFetchedAt: new Date(), resultCount: jobs.length },
        create: {
          queryKey: q.queryKey,
          role: q.role,
          location: q.location,
          resultCount: jobs.length,
        },
      });
    } catch (err) {
      // Source/network errors shouldn't break the request — log & serve cache.
      console.error(`Job fetch failed for "${q.query}":`, err);
    }
  }
}

function toCandidate(job: JobListing): MatchCandidate {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    employmentType: job.employmentType,
    location: job.location,
    skills: (job.skills as string[]) ?? [],
    snippet: job.description ?? "",
  };
}

function profileFromResume(resume: ParsedResume, prefs: JobPreference | null) {
  const prefRoles = (prefs?.roles as string[] | undefined)?.filter(Boolean) ?? [];
  return {
    skills: resume.skills,
    seniority: resume.seniority,
    roles: prefRoles.length ? prefRoles : resume.suggestedRoles,
    summary: resume.summary,
  };
}

/**
 * Full run for a user: refresh cache (if stale), pull candidates, score them
 * with Groq, and persist the per-user matches. Returns how many were matched.
 */
export async function runJobMatch({
  userId,
  resumeParsed,
  prefs,
  force = false,
}: {
  userId: string;
  resumeParsed: unknown;
  prefs: JobPreference | null;
  force?: boolean;
}): Promise<{ matched: number; candidates: number }> {
  const resume = ParsedResumeSchema.parse(resumeParsed ?? {});
  const queries = buildQueries(resume, prefs);

  // Quota guard: even on a forced refresh, don't re-hit JSearch for a query
  // fetched within the cooldown window (protects the free tier from spam).
  let effectiveForce = force;
  if (force) {
    const recent = await prisma.jobQuery.findFirst({
      where: {
        queryKey: { in: queries.map((q) => q.queryKey) },
        lastFetchedAt: { gt: new Date(Date.now() - FORCE_COOLDOWN_MS) },
      },
    });
    if (recent) effectiveForce = false;
  }

  await ensureListings(queries, { force: effectiveForce });

  const candidates = await prisma.jobListing.findMany({
    where: { queryKey: { in: queries.map((q) => q.queryKey) } },
    orderBy: { postedAt: "desc" },
    take: MAX_CANDIDATES,
  });

  if (candidates.length === 0) return { matched: 0, candidates: 0 };

  const results = await matchJobs({
    profile: profileFromResume(resume, prefs),
    candidates: candidates.map(toCandidate),
  });

  await Promise.all(
    results.map((r) =>
      prisma.jobMatch.upsert({
        where: { userId_jobId: { userId, jobId: r.jobId } },
        update: { matchScore: r.matchScore, reason: r.reason },
        create: {
          userId,
          jobId: r.jobId,
          matchScore: r.matchScore,
          reason: r.reason,
        },
      }),
    ),
  );

  return { matched: results.length, candidates: candidates.length };
}

export interface JobFilters {
  jobType?: string; // EmploymentType
  remoteOnly?: boolean;
  location?: string;
}

/** The user's ranked matches, newest-scored first, with optional filtering. */
export async function getUserJobs(
  userId: string,
  filters: JobFilters = {},
): Promise<JobCardData[]> {
  const matches = await prisma.jobMatch.findMany({
    where: {
      userId,
      job: {
        ...(filters.jobType
          ? { employmentType: filters.jobType as JobListing["employmentType"] }
          : {}),
        ...(filters.remoteOnly ? { workMode: "REMOTE" } : {}),
        ...(filters.location
          ? { location: { contains: filters.location, mode: "insensitive" } }
          : {}),
      },
    },
    include: { job: true },
    orderBy: { matchScore: "desc" },
    take: 60,
  });

  return matches.map(toCardData);
}

function toCardData(m: JobMatch & { job: JobListing }): JobCardData {
  return {
    id: m.job.id,
    title: m.job.title,
    company: m.job.company,
    location: m.job.location,
    workMode: m.job.workMode,
    employmentType: m.job.employmentType,
    skills: (m.job.skills as string[]) ?? [],
    qualifications: (m.job.qualifications as string[]) ?? [],
    deadline: m.job.deadline ? m.job.deadline.toISOString() : null,
    applyUrl: m.job.applyUrl,
    postedAt: m.job.postedAt ? m.job.postedAt.toISOString() : null,
    matchScore: m.matchScore,
    reason: m.reason,
  };
}

/** Get the user's job preferences, creating sensible defaults on first use. */
export async function getOrCreatePreferences(
  userId: string,
): Promise<JobPreference> {
  const existing = await prisma.jobPreference.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.jobPreference.create({
    data: {
      userId,
      roles: [],
      locations: [],
      remoteOnly: false,
      jobTypes: [],
      experienceLevel: "entry",
    },
  });
}
