import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getLatestJobSourceFailures,
  getOrCreatePreferences,
  runJobMatch,
} from "@/lib/jobs/service";
import { apiError, handleApiError } from "@/lib/api";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const requestStartedAt = Date.now();
  try {
    const user = await requireUser();
    console.info("[jobs/run] authenticated", { ms: Date.now() - requestStartedAt });
    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;

    // Optional filter hint so an empty filter can re-fetch for that filter.
    const focus =
      body?.focus && typeof body.focus === "object"
        ? {
            type:
              typeof body.focus.type === "string" ? body.focus.type : undefined,
            remoteOnly: body.focus.remoteOnly === true ? true : undefined,
            search:
              typeof body.focus.search === "string"
                ? body.focus.search.slice(0, 100)
                : undefined,
          }
        : undefined;

    // Use the user's primary (most recent) resume as the matching profile.
    const resume = await prisma.resume.findFirst({
      where: { userId: user.id },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
    });
    console.info("[jobs/run] resume loaded", { ms: Date.now() - requestStartedAt });
    if (!resume) {
      return apiError(
        "Upload a resume first so we can match you to jobs.",
        400,
      );
    }

    const prefs = await getOrCreatePreferences(user.id);
    console.info("[jobs/run] preferences loaded", { ms: Date.now() - requestStartedAt });
    const result = await runJobMatch({
      userId: user.id,
      resumeParsed: resume.parsed,
      prefs,
      force,
      focus,
    });
    console.info("[jobs/run] completed", {
      ms: Date.now() - requestStartedAt,
      candidates: result.candidates,
      matched: result.matched,
    });

    return NextResponse.json({
      ...result,
      diagnostics: { sources: getLatestJobSourceFailures() },
    });
  } catch (err) {
    console.error("[jobs/run] failed", { ms: Date.now() - requestStartedAt });
    return handleApiError(err);
  }
}
