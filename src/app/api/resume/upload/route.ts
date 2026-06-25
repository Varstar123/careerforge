import { NextResponse, after, type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  extractResumeText,
  MAX_RESUME_BYTES,
  ACCEPTED_RESUME_TYPES,
} from "@/lib/resume";
import { parseResume } from "@/lib/ai/parse-resume";
import { getOrCreatePreferences, runJobMatch } from "@/lib/jobs/service";
import { apiError, handleApiError } from "@/lib/api";

export const runtime = "nodejs";
export const maxDuration = 60;

const ACCEPTED = Object.keys(ACCEPTED_RESUME_TYPES);

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return apiError("No file provided.");
    }

    if (file.size > MAX_RESUME_BYTES) {
      return apiError("File too large. Max 8 MB.");
    }

    const name = file.name ?? "resume";
    const type = file.type || "application/octet-stream";
    const looksAccepted =
      ACCEPTED.includes(type) ||
      /\.(pdf|docx|txt)$/i.test(name);
    if (!looksAccepted) {
      return apiError("Unsupported file type. Upload a PDF, DOCX or TXT.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await extractResumeText(buffer, type, name);

    if (rawText.trim().length < 40) {
      return apiError(
        "We couldn't read meaningful text from that file. Try a text-based PDF or DOCX.",
      );
    }

    const parsed = await parseResume(rawText);

    const existingCount = await prisma.resume.count({
      where: { userId: user.id },
    });

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        fileName: name,
        fileType: type,
        rawText,
        parsed,
        isPrimary: existingCount === 0,
      },
    });

    // Pre-warm the Job Finder in the background: fetch + match jobs against
    // this resume AFTER the response is sent, so results are ready (or warming)
    // by the time the user opens the Job Finder. Doesn't delay the upload.
    after(async () => {
      try {
        const prefs = await getOrCreatePreferences(user.id);
        await runJobMatch({
          userId: user.id,
          resumeParsed: parsed,
          prefs,
          force: false,
        });
      } catch (err) {
        console.error("Background job pre-warm failed:", err);
      }
    });

    return NextResponse.json({
      resume: {
        id: resume.id,
        fileName: resume.fileName,
        isPrimary: resume.isPrimary,
        parsed,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
