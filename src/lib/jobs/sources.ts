import {
  type NormalizedJob,
  classifyEmployment,
} from "@/lib/jobs/types";
import type { JobSearchQuery } from "@/lib/jobs/query-builder";

/**
 * Search public Greenhouse job boards. This API is unauthenticated and does
 * not require a paid API key; results are limited to the boards listed here.
 */
const FETCH_TIMEOUT_MS = 8000;
const GREENHOUSE_BOARDS: { token: string; company: string }[] = [
  { token: "stripe", company: "Stripe" },
  { token: "databricks", company: "Databricks" },
  { token: "cloudflare", company: "Cloudflare" },
  { token: "anthropic", company: "Anthropic" },
  { token: "coinbase", company: "Coinbase" },
  { token: "airbnb", company: "Airbnb" },
  { token: "figma", company: "Figma" },
  { token: "datadog", company: "Datadog" },
  { token: "mongodb", company: "MongoDB" },
  { token: "lyft", company: "Lyft" },
  { token: "discord", company: "Discord" },
  { token: "reddit", company: "Reddit" },
  { token: "pinterest", company: "Pinterest" },
  { token: "robinhood", company: "Robinhood" },
  { token: "instacart", company: "Instacart" },
  { token: "twitch", company: "Twitch" },
  { token: "dropbox", company: "Dropbox" },
  { token: "gitlab", company: "GitLab" },
  { token: "twilio", company: "Twilio" },
  { token: "okta", company: "Okta" },
  { token: "affirm", company: "Affirm" },
  { token: "scaleai", company: "Scale AI" },
  { token: "samsara", company: "Samsara" },
  { token: "asana", company: "Asana" },
];

export const jobsSourceReady = () => true;

interface GreenhouseJob {
  id?: number;
  title?: string;
  location?: { name?: string };
  absolute_url?: string;
  updated_at?: string;
}

async function fetchJson<T>(url: string | URL): Promise<T> {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as T;
}

async function fetchGreenhouse(query: JobSearchQuery): Promise<NormalizedJob[]> {
  const terms = query.role.toLowerCase().split(/\s+/).filter((term) => term.length > 2);
  const results = await Promise.allSettled(
    GREENHOUSE_BOARDS.map(async (board) => {
      const data = await fetchJson<{ jobs?: GreenhouseJob[] }>(
        `https://boards-api.greenhouse.io/v1/boards/${board.token}/jobs`,
      );
      return (data.jobs ?? [])
        .filter((job) => {
          if (!job.title || !job.id || !job.absolute_url) return false;
          const title = job.title.toLowerCase();
          if (query.employmentTypes.includes("INTERN")) {
            return /\bintern(ship)?s?\b/i.test(title);
          }
          return terms.length === 0 || terms.some((term) => title.includes(term));
        })
        .slice(0, 5)
        .map((job): NormalizedJob => {
          const title = job.title as string;
          return {
            source: "greenhouse",
            externalId: `greenhouse:${board.token}:${job.id}`,
            title,
            company: board.company,
            location: job.location?.name ?? null,
            workMode: /\bremote\b/i.test(`${title} ${job.location?.name ?? ""}`)
              ? "REMOTE"
              : "ONSITE",
            employmentType: classifyEmployment(title),
            description: "",
            skills: [],
            qualifications: [],
            postedAt: job.updated_at ? new Date(job.updated_at) : null,
            deadline: null,
            applyUrl: job.absolute_url as string,
          };
        });
    }),
  );
  if (results.every((result) => result.status === "rejected")) {
    throw new Error("All configured Greenhouse boards failed to respond.");
  }
  return results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
}

async function fetchAllSources(query: JobSearchQuery) {
  try {
    return { jobs: await fetchGreenhouse(query), failed: [] as string[] };
  } catch (error) {
    console.error(`Greenhouse search failed for "${query.query}":`, error);
    return { jobs: [] as NormalizedJob[], failed: ["greenhouse"] };
  }
}

export async function fetchJobsForQuery(
  query: JobSearchQuery,
): Promise<NormalizedJob[]> {
  const { jobs } = await fetchAllSources(query);
  return query.remoteOnly
    ? jobs.filter((job) => job.workMode === "REMOTE")
    : jobs;
}

export async function fetchJobsForQueryWithDiagnostics(
  query: JobSearchQuery,
): Promise<{ jobs: NormalizedJob[]; failed: string[] }> {
  const result = await fetchAllSources(query);
  return {
    jobs: query.remoteOnly
      ? result.jobs.filter((job) => job.workMode === "REMOTE")
      : result.jobs,
    failed: result.failed,
  };
}

export async function diagnoseSources(
  role: string,
): Promise<{ name: string; count: number; error: string | null }[]> {
  const query: JobSearchQuery = {
    queryKey: "diagnostic",
    query: role,
    role,
    location: null,
    remoteOnly: false,
    employmentTypes: ["FULLTIME", "INTERN"],
  };

  try {
    return [{ name: "greenhouse", count: (await fetchGreenhouse(query)).length, error: null }];
  } catch (error) {
    return [{
      name: "greenhouse",
      count: 0,
      error: error instanceof Error ? error.message : String(error),
    }];
  }
}
