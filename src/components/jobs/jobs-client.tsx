"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  Loader2,
  Briefcase,
  FileText,
  Wifi,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/dashboard/empty-state";
import { JobCard } from "@/components/jobs/job-card";
import { JobSkeletonGrid } from "@/components/jobs/job-skeleton";
import { cn } from "@/lib/utils";
import type { JobCardData } from "@/lib/jobs/service";

type FocusHint = { type?: string; remoteOnly?: boolean; search?: string };

export function JobsClient({
  initialJobs,
  hasResume,
  jsearchReady,
}: {
  initialJobs: JobCardData[];
  hasResume: boolean;
  jsearchReady: boolean;
}) {
  const [jobs, setJobs] = React.useState<JobCardData[]>(initialJobs);
  const [loading, setLoading] = React.useState(false);
  const [type, setType] = React.useState("ALL");
  const [remoteOnly, setRemoteOnly] = React.useState(false);
  const [q, setQ] = React.useState("");
  // If a resume exists but no matches are in yet, the background pre-warm
  // (kicked off at upload time) is likely still running — poll for it.
  const [preparing, setPreparing] = React.useState(
    () => hasResume && initialJobs.length === 0,
  );

  React.useEffect(() => {
    if (!preparing) return;
    let cancelled = false;
    let attempts = 0;
    const poll = async () => {
      if (cancelled) return;
      attempts += 1;
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        if (!cancelled && Array.isArray(data.jobs) && data.jobs.length > 0) {
          setJobs(data.jobs);
          setPreparing(false);
          return;
        }
      } catch {
        // ignore — try again
      }
      if (!cancelled) {
        if (attempts >= 8) setPreparing(false);
        else setTimeout(poll, 3000);
      }
    };
    const id = setTimeout(poll, 2500);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [preparing]);

  async function run(force: boolean, focus?: FocusHint) {
    setPreparing(false); // a manual run supersedes any background poll
    setLoading(true);
    try {
      const res = await fetch("/api/jobs/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force, focus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not fetch jobs");

      // Pull the freshly-ranked matches. Keep existing results if this hiccups
      // so the grid never blanks out unexpectedly.
      const jobsRes = await fetch("/api/jobs");
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        if (Array.isArray(jobsData.jobs)) setJobs(jobsData.jobs);
      }

      if ((data.matched ?? 0) === 0) {
        toast("No matches yet", {
          description: "Try refreshing later or broadening your preferences.",
        });
      } else {
        toast.success(`Matched ${data.matched} jobs to your resume`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const filtered = jobs.filter((j) => {
    if (type !== "ALL" && j.employmentType !== type) return false;
    if (remoteOnly && j.workMode !== "REMOTE") return false;
    if (q) {
      const hay = `${j.title} ${j.company} ${j.skills.join(" ")}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  // When a discrete filter (type / remote) has no match in the cached results,
  // automatically re-fetch from the job boards FOR that filter — once per
  // distinct filter, so it can't loop.
  const autoFetchedRef = React.useRef("");
  React.useEffect(() => {
    if (loading || preparing || jobs.length === 0) return;
    const hasDiscreteFilter = type !== "ALL" || remoteOnly;
    if (!hasDiscreteFilter || filtered.length > 0) return;
    const key = `${type}|${remoteOnly}`;
    if (autoFetchedRef.current === key) return;
    autoFetchedRef.current = key;
    const focus: FocusHint = {
      type: type !== "ALL" ? type : undefined,
      remoteOnly: remoteOnly || undefined,
    };
    const t = setTimeout(() => void run(true, focus), 0);
    return () => clearTimeout(t);
  }, [type, remoteOnly, filtered.length, jobs.length, loading, preparing]);

  function searchBoards() {
    autoFetchedRef.current = ""; // allow a manual retry
    void run(true, {
      type: type !== "ALL" ? type : undefined,
      remoteOnly: remoteOnly || undefined,
      search: q.trim() || undefined,
    });
  }

  // No resume yet → can't match.
  if (!hasResume) {
    return (
      <EmptyState
        icon={FileText}
        title="Upload a resume to find jobs"
        description="We match live job & internship listings to your actual skills and experience — so we need your resume first."
        action={
          <Button variant="gradient" asChild>
            <Link href="/dashboard/resumes">Upload resume</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      {!jsearchReady && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-warning" />
          <span className="text-muted-foreground">
            The live jobs source isn&apos;t connected yet. Add a{" "}
            <code className="rounded bg-secondary px-1 text-foreground">
              RAPIDAPI_KEY
            </code>{" "}
            to enable fresh listings.
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, company or skill…"
            className="pl-9"
          />
        </div>
        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="sm:w-44"
        >
          <option value="ALL">All types</option>
          <option value="INTERNSHIP">Internship</option>
          <option value="FULLTIME">Full-time</option>
          <option value="PARTTIME">Part-time</option>
          <option value="CONTRACT">Contract</option>
        </Select>
        <button
          type="button"
          onClick={() => setRemoteOnly((v) => !v)}
          className={cn(
            "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors",
            remoteOnly
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          <Wifi className="size-4" /> Remote only
        </button>
        <Button
          variant="gradient"
          onClick={() => run(jobs.length > 0)}
          disabled={loading || preparing}
        >
          {loading || preparing ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Finding…
            </>
          ) : (
            <>
              <RefreshCw className="size-4" />
              {jobs.length > 0 ? "Refresh" : "Find jobs"}
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {preparing || loading ? (
        <>
          <p className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            {preparing
              ? "Finding jobs that match your resume…"
              : "Matching the latest listings to your resume…"}
          </p>
          <JobSkeletonGrid />
        </>
      ) : filtered.length > 0 ? (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "match" : "matches"}
            {jobs.length !== filtered.length && ` of ${jobs.length}`}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </>
      ) : jobs.length > 0 ? (
        <EmptyState
          icon={Search}
          title="No matching jobs in your current results"
          description="None of your cached matches fit this filter. Search the job boards directly for it."
          action={
            <Button variant="gradient" onClick={searchBoards} disabled={loading}>
              <Search className="size-4" /> Search job boards
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={Briefcase}
          title="Find jobs matched to your resume"
          description="We'll pull live internships and entry-level roles, then rank them by how well they fit you."
          action={
            <Button variant="gradient" onClick={() => run(false)} disabled={loading}>
              <Briefcase className="size-4" /> Find jobs
            </Button>
          }
        />
      )}
    </div>
  );
}
