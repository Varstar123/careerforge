"use client";

import * as React from "react";
import {
  Building2,
  MapPin,
  Wifi,
  Clock,
  ExternalLink,
  Sparkles,
  Info,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, scoreBand, formatDate } from "@/lib/utils";
import type { JobCardData } from "@/lib/jobs/service";

const TYPE_LABEL: Record<string, string> = {
  FULLTIME: "Full-time",
  PARTTIME: "Part-time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
  OTHER: "Other",
};

const MODE_LABEL: Record<string, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
  UNKNOWN: "",
};

export function JobCard({ job }: { job: JobCardData }) {
  const [showReason, setShowReason] = React.useState(false);
  const band = scoreBand(job.matchScore);

  const deadlineLabel = job.deadline
    ? `Apply by ${formatDate(job.deadline)}`
    : "Open · Apply soon";

  let postedLabel: string | null = null;
  if (job.postedAt) {
    try {
      postedLabel = `${formatDistanceToNow(new Date(job.postedAt))} ago`;
    } catch {
      postedLabel = null;
    }
  }

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold leading-snug">{job.title}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="size-3.5 shrink-0" />
            <span className="truncate">{job.company}</span>
          </p>
        </div>
        <div
          className={cn(
            "flex shrink-0 flex-col items-center rounded-lg border border-border px-2.5 py-1",
            band.className,
          )}
          title="Resume match score"
        >
          <span className="text-base font-semibold leading-none tabular-nums">
            {job.matchScore}%
          </span>
          <span className="text-[10px] text-muted-foreground">match</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary">{TYPE_LABEL[job.employmentType] ?? job.employmentType}</Badge>
        {job.workMode === "REMOTE" ? (
          <Badge variant="success" className="gap-1">
            <Wifi className="size-3" /> Remote
          </Badge>
        ) : (
          MODE_LABEL[job.workMode] && (
            <Badge variant="outline">{MODE_LABEL[job.workMode]}</Badge>
          )
        )}
        {job.location && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" /> {job.location}
          </span>
        )}
        {postedLabel && (
          <span className="text-xs text-muted-foreground">· {postedLabel}</span>
        )}
      </div>

      {job.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 6).map((s) => (
            <span
              key={s}
              className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              {s}
            </span>
          ))}
          {job.skills.length > 6 && (
            <span className="px-1 text-xs text-muted-foreground">
              +{job.skills.length - 6}
            </span>
          )}
        </div>
      )}

      {job.qualifications.length > 0 && (
        <ul className="mt-3 space-y-1">
          {job.qualifications.slice(0, 2).map((q, i) => (
            <li
              key={i}
              className="flex gap-1.5 text-xs leading-relaxed text-muted-foreground"
            >
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
              <span className="line-clamp-2">{q}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Why this matches you */}
      {job.reason && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowReason((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            aria-expanded={showReason}
          >
            <Info className="size-3.5" /> Why this matches you
          </button>
          {showReason && (
            <p className="mt-1.5 flex gap-2 rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-xs leading-relaxed text-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
              {job.reason}
            </p>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" /> {deadlineLabel}
        </span>
        <Button size="sm" asChild>
          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
            Apply <ExternalLink className="size-3.5" />
          </a>
        </Button>
      </div>
    </Card>
  );
}
