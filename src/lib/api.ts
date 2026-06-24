import { NextResponse } from "next/server";

/** Normalised JSON error helper for route handlers. */
export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Map thrown errors to a sensible HTTP response. */
export function handleApiError(err: unknown) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  if (message === "UNAUTHORIZED") {
    return apiError("You must be signed in.", 401);
  }
  if (message.includes("LLM API key") || message.includes("API_KEY")) {
    return apiError(message, 503);
  }
  console.error("API error:", err);
  return apiError("Something went wrong. Please try again.", 500);
}
