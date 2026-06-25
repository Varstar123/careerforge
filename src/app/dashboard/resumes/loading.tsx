import { PageHeaderSkeleton } from "@/components/dashboard/skeletons";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResumesLoading() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeaderSkeleton />
      {/* Uploader dropzone */}
      <Skeleton className="mb-6 h-32 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-12 rounded-md" />
              <Skeleton className="h-5 w-14 rounded-md" />
            </div>
            <Skeleton className="h-3 w-1/2" />
          </Card>
        ))}
      </div>
    </div>
  );
}
