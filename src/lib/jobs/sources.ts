import {
  type NormalizedJob,
  mapEmploymentType,
  stripHtml,
} from "@/lib/jobs/types";
import type { JobSearchQuery } from "@/lib/jobs/query-builder";

/**
 * Free, no-key, no-card job sources. Search actually works on these (unlike
 * JSearch's free tier), so they're the default. The rest of the pipeline
 * (caching, Groq matching, UI) is unchanged.
 *
 * - Remotive  — remote jobs, supports keyword search.
 * - Arbeitnow — broad EU/remote board, client-side filtered by the role.
 */

/** Always available — these sources need no credentials. */
export const jobsSourceReady = () => true;

// ── Remotive ────────────────────────────────────────────────────────────
interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  candidate_required_location?: string;
  job_type?: string;
  publication_date?: string;
  description?: string;
  tags?: string[];
}

async function fetchRemotive(query: string): Promise<NormalizedJob[]> {
  const url = new URL("https://remotive.com/api/remote-jobs");
  if (query) url.searchParams.set("search", query);
  url.searchParams.set("limit", "40");

  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Remotive ${res.status}`);
  const json = (await res.json()) as { jobs?: RemotiveJob[] };

  return (json.jobs ?? [])
    .filter((j) => j.url && j.title)
    .map((j) => ({
      source: "remotive",
      externalId: `remotive:${j.id}`,
      title: j.title,
      company: j.company_name ?? "Unknown",
      location: j.candidate_required_location || "Remote",
      workMode: "REMOTE" as const,
      employmentType: mapEmploymentType(j.job_type),
      description: stripHtml(j.description ?? "").slice(0, 6000),
      skills: Array.isArray(j.tags) ? j.tags.slice(0, 12) : [],
      qualifications: [],
      postedAt: j.publication_date ? new Date(j.publication_date) : null,
      deadline: null,
      applyUrl: j.url,
    }));
}

// ── Arbeitnow ───────────────────────────────────────────────────────────
interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description?: string;
  remote?: boolean;
  url: string;
  tags?: string[];
  job_types?: string[];
  location?: string;
  created_at?: number;
}

async function fetchArbeitnow(role: string): Promise<NormalizedJob[]> {
  const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Arbeitnow ${res.status}`);
  const json = (await res.json()) as { data?: ArbeitnowJob[] };

  const terms = role
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  return (json.data ?? [])
    .filter((j) => {
      if (!j.url || !j.title) return false;
      const hay = `${j.title} ${(j.tags ?? []).join(" ")}`.toLowerCase();
      return terms.length === 0 || terms.some((t) => hay.includes(t));
    })
    .slice(0, 20)
    .map((j) => ({
      source: "arbeitnow",
      externalId: `arbeitnow:${j.slug}`,
      title: j.title,
      company: j.company_name ?? "Unknown",
      location: j.location || (j.remote ? "Remote" : null),
      workMode: (j.remote ? "REMOTE" : "ONSITE") as NormalizedJob["workMode"],
      employmentType: mapEmploymentType(j.job_types?.[0]),
      description: stripHtml(j.description ?? "").slice(0, 6000),
      skills: Array.isArray(j.tags) ? j.tags.slice(0, 12) : [],
      qualifications: [],
      postedAt: j.created_at ? new Date(j.created_at * 1000) : null,
      deadline: null,
      applyUrl: j.url,
    }));
}

/** Aggregate the free sources for one query, dedupe, and apply remote filter. */
export async function fetchJobsForQuery(
  q: JobSearchQuery,
): Promise<NormalizedJob[]> {
  const settled = await Promise.allSettled([
    fetchRemotive(q.query),
    fetchArbeitnow(q.role),
  ]);

  const all = settled.flatMap((r) =>
    r.status === "fulfilled" ? r.value : [],
  );

  const seen = new Set<string>();
  const deduped: NormalizedJob[] = [];
  for (const job of all) {
    if (seen.has(job.externalId)) continue;
    if (q.remoteOnly && job.workMode !== "REMOTE") continue;
    seen.add(job.externalId);
    deduped.push(job);
  }
  return deduped;
}
