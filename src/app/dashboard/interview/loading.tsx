import {
  PageHeaderSkeleton,
  ListItemsSkeleton,
} from "@/components/dashboard/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function InterviewsLoading() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeaderSkeleton action />
      {/* Tab bar */}
      <div className="mb-5 flex gap-2">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      <ListItemsSkeleton count={5} />
    </div>
  );
}
