"use client";

import { SetupNotice } from "@/components/setup-notice";

/**
 * Graceful fallback when a dashboard page's data load throws — most commonly the
 * database being unreachable on the auth/DB round trip each page makes. This used
 * to live as a try/catch in the layout; moving it here keeps the layout
 * synchronous (instant navigation) without losing the friendly setup guidance.
 */
export default function DashboardError() {
  return (
    <SetupNotice
      title="Database not ready"
      reason="We couldn't reach your database to load your account."
      dbError
    />
  );
}
