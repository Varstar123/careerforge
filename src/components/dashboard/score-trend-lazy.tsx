"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Lazy boundary for the score chart. `recharts` is ~100KB of client JS, so we
 * keep it out of the dashboard's initial bundle and load it only after the
 * shell has painted. `ssr: false` is safe here — recharts' ResponsiveContainer
 * measures the DOM and renders nothing meaningful on the server anyway.
 */
export const ScoreTrend = dynamic(
  () => import("./score-trend").then((m) => m.ScoreTrend),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[220px] w-full rounded-lg" />,
  },
);
