/**
 * Server-side checks for whether required integrations are configured.
 * Used to degrade gracefully (friendly setup screens) instead of crashing
 * when keys aren't set yet.
 */
export const clerkConfigured =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

export const aiConfigured =
  !!process.env.GROQ_API_KEY || !!process.env.OPENAI_API_KEY;
