import type { JobListing, JobMatch, JobPreference } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fetchJobsForQuery, jobsSourceReady } from "@/lib/jobs/sources";
import {
  buildQueries,
  type JobSearchQuery,
  type BuildFocus,
} from "@/lib/jobs/query-builder";
import { matchJobs, type MatchCandidate } from "@/lib/ai/match-jobs";
import { ParsedResumeSchema, type ParsedResume } from "@/lib/types";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const FORCE_COOLDOWN_MS = 60 * 60 * 1000; // min 1h between forced refetches
const MAX_CANDIDATES = 24; // cap jobs sent to the matcher in one call
const STALE_LISTING_MS = 14 * 24 * 60 * 60 * 1000; // not re-seen in 14d -> gone
const MAX_LISTING_AGE_MS = 45 * 24 * 60 * 60 * 1000; // posted >45d ago -> expired

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
 * Purge listings that are over: past their deadline (when the source provides
 * one), not re-seen in 14 days, or posted more than 45 days ago. Related
 * JobMatch rows cascade-delete automatically. Returns how many were removed.
 */
export async function cleanupStaleJobs(): Promise<number> {
  const now = Date.now();
  const res = await prisma.jobListing.deleteMany({
    where: {
      OR: [
        { deadline: { lt: new Date(now) } },
        { updatedAt: { lt: new Date(now - STALE_LISTING_MS) } },
        { postedAt: { lt: new Date(now - MAX_LISTING_AGE_MS) } },
      ],
    },
  });
  return res.count;
}

/**
 * Ensure each query's listings are fresh in the cache. Skips queries fetched
 * <24h ago. No-ops gracefully when JSearch isn't configured (serves stale cache).
 */
const MAX_PER_QUERY = 20; // cap listings stored per query to bound DB writes

async function ensureOne(q: JobSearchQuery, force: boolean): Promise<void> {
  const cache = await prisma.jobQuery.findUnique({
    where: { queryKey: q.queryKey },
  });
  if (!force && cache && isFresh(cache.lastFetchedAt)) return;
  if (!jobsSourceReady()) return;

  try {
    const jobs = (await fetchJobsForQuery(q)).slice(0, MAX_PER_QUERY);

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

export async function ensureListings(
  queries: JobSearchQuery[],
  { force = false }: { force?: boolean } = {},
): Promise<void> {
  // Run queries concurrently so wall-time is the slowest query, not the sum
  // (keeps us well under the serverless function timeout).
  await Promise.all(queries.map((q) => ensureOne(q, force)));
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
  focus,
}: {
  userId: string;
  resumeParsed: unknown;
  prefs: JobPreference | null;
  force?: boolean;
  focus?: BuildFocus;
}): Promise<{ matched: number; candidates: number }> {
  const resume = ParsedResumeSchema.parse(resumeParsed ?? {});
  // Fewer queries on a focused (filter-driven) run keeps it fast.
  const queries = buildQueries(resume, prefs, {
    focus,
    maxQueries: focus ? 2 : 3,
  });

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
        // Hide listings whose deadline has already passed.
        OR: [{ deadline: null }, { deadline: { gte: new Date() } }],
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
