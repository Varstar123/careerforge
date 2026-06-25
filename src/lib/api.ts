import { NextResponse } from "next/server";

/** Normalised JSON error helper for route handlers. */
export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Map thrown errors to a sensible HTTP response with an actionable message. */
export function handleApiError(err: unknown) {
  // Always log the real error so it's visible in server / Vercel logs.
  console.error("API error:", err);

  const message = err instanceof Error ? err.message : "Unexpected error";
  const status =
    typeof (err as { status?: unknown })?.status === "number"
      ? (err as { status: number }).status
      : undefined;

  if (message === "UNAUTHORIZED") {
    return apiError("You must be signed in.", 401);
  }

  // Rate limited by the AI provider (e.g. Groq free-tier limits).
  if (status === 429 || /rate.?limit|429|quota/i.test(message)) {
    return apiError(
      "The AI service is busy right now. Please wait a few seconds and try again.",
      429,
    );
  }

  // Misconfigured / invalid AI key.
  if (
    status === 401 ||
    status === 403 ||
    message.includes("LLM API key") ||
    /api key/i.test(message)
  ) {
    return apiError(
      "The AI service isn't configured correctly. Please contact the site owner.",
      503,
    );
  }

  // Request timed out (slow model / large file).
  if (status === 408 || /timeout|timed out|ETIMEDOUT|aborted/i.test(message)) {
    return apiError(
      "That took too long to process. Please try again, or use a smaller file.",
      504,
    );
  }

  return apiError("Something went wrong. Please try again.", 500);
}
