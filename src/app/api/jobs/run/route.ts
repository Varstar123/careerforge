import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreatePreferences, runJobMatch } from "@/lib/jobs/service";
import { apiError, handleApiError } from "@/lib/api";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;

    // Use the user's primary (most recent) resume as the matching profile.
    const resume = await prisma.resume.findFirst({
      where: { userId: user.id },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
    });
    if (!resume) {
      return apiError(
        "Upload a resume first so we can match you to jobs.",
        400,
      );
    }

    const prefs = await getOrCreatePreferences(user.id);
    const result = await runJobMatch({
      userId: user.id,
      resumeParsed: resume.parsed,
      prefs,
      force,
    });

    return NextResponse.json(result);
  } catch (err) {
    return handleApiError(err);
  }
}
