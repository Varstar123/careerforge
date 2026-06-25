import {
  type NormalizedJob,
  mapEmploymentType,
  stripHtml,
} from "@/lib/jobs/types";
import type { JobSearchQuery } from "@/lib/jobs/query-builder";

/**
 * Job sources. Search works on all of these (unlike JSearch's free tier).
 *
 * - Remotive  — remote jobs, supports keyword search (free, no key).
 * - Arbeitnow — broad EU/remote board, filtered by the role (free, no key).
 * - Adzuna    — broad multi-site aggregator with country + location coverage
 *               (incl. India). Free dev tier; activates when ADZUNA_APP_ID /
 *               ADZUNA_APP_KEY are set, otherwise skipped.
 */

/** Always available — Remotive/Arbeitnow need no credentials. */
export const jobsSourceReady = () => true;

const adzunaConfigured = () =>
  !!process.env.ADZUNA_APP_ID && !!process.env.ADZUNA_APP_KEY;

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

// ── Adzuna (optional, broad aggregator incl. India) ─────────────────────
interface AdzunaJob {
  id?: string;
  title?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  description?: string;
  redirect_url?: string;
  created?: string;
  contract_time?: string; // full_time | part_time
  contract_type?: string; // permanent | contract
}

async function fetchAdzuna(q: JobSearchQuery): Promise<NormalizedJob[]> {
  const id = process.env.ADZUNA_APP_ID;
  const key = process.env.ADZUNA_APP_KEY;
  if (!id || !key) return [];
  const country = (process.env.ADZUNA_COUNTRY || "in").toLowerCase();

  const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`);
  url.searchParams.set("app_id", id);
  url.searchParams.set("app_key", key);
  url.searchParams.set("results_per_page", "30");
  url.searchParams.set("what", q.query);
  if (q.location) url.searchParams.set("where", q.location);
  url.searchParams.set("max_days_old", "45");
  url.searchParams.set("content-type", "application/json");

  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Adzuna ${res.status}`);
  const json = (await res.json()) as { results?: AdzunaJob[] };

  return (json.results ?? [])
    .filter((j) => j.id && j.title && j.redirect_url)
    .map((j) => {
      const title = stripHtml(j.title ?? "");
      const text = stripHtml(j.description ?? "");
      const isRemote = /\bremote\b/i.test(`${title} ${text}`);
      let employmentType = mapEmploymentType(j.contract_time);
      if (/\bintern(ship)?\b/i.test(title)) employmentType = "INTERNSHIP";
      else if (j.contract_type === "contract") employmentType = "CONTRACT";

      return {
        source: "adzuna",
        externalId: `adzuna:${j.id}`,
        title,
        company: j.company?.display_name ?? "Unknown",
        location: j.location?.display_name ?? null,
        workMode: (isRemote ? "REMOTE" : "ONSITE") as NormalizedJob["workMode"],
        employmentType,
        description: text.slice(0, 6000),
        skills: [],
        qualifications: [],
        postedAt: j.created ? new Date(j.created) : null,
        deadline: null,
        applyUrl: j.redirect_url as string,
      };
    });
}

/** Aggregate all available sources for one query, dedupe, apply remote filter. */
export async function fetchJobsForQuery(
  q: JobSearchQuery,
): Promise<NormalizedJob[]> {
  const tasks = [fetchRemotive(q.query), fetchArbeitnow(q.role)];
  if (adzunaConfigured()) tasks.push(fetchAdzuna(q));
  const settled = await Promise.allSettled(tasks);

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
