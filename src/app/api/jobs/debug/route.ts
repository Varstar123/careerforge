import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { diagnoseSources } from "@/lib/jobs/sources";
import { handleApiError } from "@/lib/api";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Diagnostic: which job sources actually work from this (production) environment.
 * Visit /api/jobs/debug while signed in. Shows per-source job counts / errors —
 * the quickest way to confirm if Vercel's IP is blocked by a career API.
 */
export async function GET() {
  try {
    await requireUser();
    const results = await diagnoseSources("software engineer");
    return NextResponse.json({ results });
  } catch (err) {
    return handleApiError(err);
  }
}
