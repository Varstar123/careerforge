import {
  type NormalizedJob,
  classifyEmployment,
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

const FETCH_TIMEOUT_MS = 8000;

/** Fetch JSON with a hard timeout so a slow source can't stall the request. */
async function fetchJson(url: string | URL): Promise<unknown> {
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

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

  const json = (await fetchJson(url)) as { jobs?: RemotiveJob[] };

  return (json.jobs ?? [])
    .filter((j) => j.url && j.title)
    .map((j) => ({
      source: "remotive",
      externalId: `remotive:${j.id}`,
      title: j.title,
      company: j.company_name ?? "Unknown",
      location: j.candidate_required_location || "Remote",
      workMode: "REMOTE" as const,
      employmentType: classifyEmployment(j.title, j.job_type),
      description: stripHtml(j.description ?? "").slice(0, 6000),
      skills: Array.isArray(j.tags) ? j.tags.slice(0, 12) : [],
      qualifications: [],
      postedAt: j.publication_date ? new Date(j.publication_date) : null,
      deadline: null,
      applyUrl: j.url,
    }));
}

// ── Arbeitnow ───────────────────────────────────────────────────────────
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

  const json = (await fetchJson(url)) as { results?: AdzunaJob[] };

  return (json.results ?? [])
    .filter((j) => j.id && j.title && j.redirect_url)
    .map((j) => {
      const title = stripHtml(j.title ?? "");
      const text = stripHtml(j.description ?? "");
      const isRemote = /\bremote\b/i.test(`${title} ${text}`);
      let employmentType = classifyEmployment(title, j.contract_time);
      if (employmentType !== "INTERNSHIP" && j.contract_type === "contract") {
        employmentType = "CONTRACT";
      }

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

// ── Greenhouse (curated well-known companies, free, no key) ─────────────
interface GreenhouseJob {
  id?: number;
  title?: string;
  location?: { name?: string };
  absolute_url?: string;
  updated_at?: string;
}

// Recognisable companies whose Greenhouse boards are live (verified).
const GREENHOUSE_COMPANIES: { slug: string; name: string }[] = [
  { slug: "stripe", name: "Stripe" },
  { slug: "databricks", name: "Databricks" },
  { slug: "cloudflare", name: "Cloudflare" },
  { slug: "anthropic", name: "Anthropic" },
  { slug: "coinbase", name: "Coinbase" },
  { slug: "airbnb", name: "Airbnb" },
  { slug: "figma", name: "Figma" },
  { slug: "datadog", name: "Datadog" },
  { slug: "mongodb", name: "MongoDB" },
  { slug: "lyft", name: "Lyft" },
  { slug: "discord", name: "Discord" },
  { slug: "reddit", name: "Reddit" },
  { slug: "pinterest", name: "Pinterest" },
  { slug: "robinhood", name: "Robinhood" },
  { slug: "instacart", name: "Instacart" },
  { slug: "twitch", name: "Twitch" },
  { slug: "dropbox", name: "Dropbox" },
  { slug: "gitlab", name: "GitLab" },
  { slug: "twilio", name: "Twilio" },
  { slug: "okta", name: "Okta" },
  { slug: "affirm", name: "Affirm" },
  { slug: "scaleai", name: "Scale AI" },
  { slug: "samsara", name: "Samsara" },
  { slug: "asana", name: "Asana" },
];

const INTERN_TITLE = /\bintern(ship)?s?\b/i;

// Memoise board fetches (large, query-independent) across queries + warm
// invocations. Cache the promise so concurrent queries don't double-fetch.
const ghBoardCache = new Map<
  string,
  { at: number; p: Promise<GreenhouseJob[]> }
>();
const GH_BOARD_TTL = 10 * 60 * 1000;

function greenhouseBoard(slug: string): Promise<GreenhouseJob[]> {
  const hit = ghBoardCache.get(slug);
  if (hit && Date.now() - hit.at < GH_BOARD_TTL) return hit.p;
  const p = fetchJson(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`)
    .then((json) => (json as { jobs?: GreenhouseJob[] }).jobs ?? [])
    .catch((err) => {
      ghBoardCache.delete(slug); // allow a retry next time
      throw err;
    });
  ghBoardCache.set(slug, { at: Date.now(), p });
  return p;
}

async function fetchGreenhouse(q: JobSearchQuery): Promise<NormalizedJob[]> {
  const wantsIntern = q.employmentTypes.includes("INTERN");
  const terms = q.role
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && w !== "internship");

  const settled = await Promise.allSettled(
    GREENHOUSE_COMPANIES.map(async (co) => {
      const jobs = await greenhouseBoard(co.slug);
      return jobs
        .filter((j) => {
          const title = (j.title ?? "").toLowerCase();
          if (!title || !j.absolute_url || !j.id) return false;
          if (wantsIntern) return INTERN_TITLE.test(title);
          return terms.length === 0 || terms.some((t) => title.includes(t));
        })
        .slice(0, 8)
        .map((j): NormalizedJob => {
          const title = j.title as string;
          const loc = j.location?.name ?? null;
          const isRemote = /remote/i.test(`${title} ${loc ?? ""}`);
          return {
            source: "greenhouse",
            externalId: `greenhouse:${co.slug}:${j.id}`,
            title,
            company: co.name,
            location: loc,
            workMode: isRemote ? "REMOTE" : "ONSITE",
            employmentType: INTERN_TITLE.test(title) ? "INTERNSHIP" : "FULLTIME",
            description: "",
            skills: [],
            qualifications: [],
            postedAt: j.updated_at ? new Date(j.updated_at) : null,
            deadline: null,
            applyUrl: j.absolute_url as string,
          };
        });
    }),
  );

  return settled.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

/** Aggregate all available sources for one query, dedupe, apply remote filter. */
export async function fetchJobsForQuery(
  q: JobSearchQuery,
): Promise<NormalizedJob[]> {
  const adzunaOn = adzunaConfigured();

  // Greenhouse = recognizable companies, Adzuna = India breadth, Remotive =
  // remote. (Arbeitnow dropped — it flooded results with EU/German on-site
  // roles irrelevant to the target audience.)
  const sources: { name: string; run: () => Promise<NormalizedJob[]> }[] = [
    { name: "greenhouse", run: () => fetchGreenhouse(q) },
    { name: "remotive", run: () => fetchRemotive(q.query) },
  ];
  if (adzunaOn) sources.push({ name: "adzuna", run: () => fetchAdzuna(q) });

  const settled = await Promise.allSettled(sources.map((s) => s.run()));

  settled.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(
        `Job source ${sources[i].name} failed for "${q.query}":`,
        r.reason,
      );
    }
  });

  // Cap each source's contribution so one source can't crowd the others out of
  // the per-query slice (keeps a balanced mix across sources).
  const PER_SOURCE = 9;
  const all = settled.flatMap((r) =>
    r.status === "fulfilled" ? r.value.slice(0, PER_SOURCE) : [],
  );

  const seen = new Set<string>();
  const deduped: NormalizedJob[] = [];
  for (const job of all) {
    if (seen.has(job.externalId)) continue;
    if (q.remoteOnly && job.workMode !== "REMOTE") continue;
    seen.add(job.externalId);
    deduped.push(job);
  }

  // For internship-targeted queries, promote INTERNSHIP rows so they survive
  // the downstream per-query slice (Remotive's non-intern rows come first).
  if (q.employmentTypes.includes("INTERN")) {
    deduped.sort(
      (a, b) =>
        Number(b.employmentType === "INTERNSHIP") -
        Number(a.employmentType === "INTERNSHIP"),
    );
  }

  return deduped;
}
