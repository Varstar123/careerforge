import { JobSkeletonGrid } from "@/components/jobs/job-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobFinderLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
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
