import { PageHeader } from "@/components/dashboard/page-header";
import { JobSkeletonGrid } from "@/components/jobs/job-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobFinderLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      {/* Real header so it's identical to the loaded page (no flash). */}
      <PageHeader
        title="Job & Internship Finder"
        description="Live internships and entry-level roles, fetched automatically and ranked by how well they fit your resume."
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full sm:w-44" />
        <Skeleton className="h-10 w-full sm:w-32" />
        <Skeleton className="h-10 w-full sm:w-28" />
      </div>
      <JobSkeletonGrid />
    </div>
  );
}
