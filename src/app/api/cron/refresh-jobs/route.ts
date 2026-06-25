import { NextResponse, type NextRequest } from "next/server";
import { ensureListings, cleanupStaleJobs } from "@/lib/jobs/service";
import { CURATED_QUERIES } from "@/lib/jobs/query-builder";
import { jobsSourceReady } from "@/lib/jobs/sources";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Daily cron (configured in vercel.json) that keeps a curated set of
 * student/fresher job queries warm in the shared cache, so users get instant,
 * pre-fetched results. Protected by CRON_SECRET — Vercel sends it as a Bearer
 * token automatically when the env var is set.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!jobsSourceReady()) {
    return NextResponse.json({ ok: false, reason: "no job source available" });
  }

  try {
    await ensureListings(CURATED_QUERIES, { force: true });
    const removed = await cleanupStaleJobs();
    return NextResponse.json({
      ok: true,
      refreshed: CURATED_QUERIES.length,
      removed,
      at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Cron refresh-jobs failed:", err);
    return NextResponse.json({ ok: false, error: "refresh failed" }, { status: 500 });
  }
}
