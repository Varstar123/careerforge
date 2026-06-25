import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function InterviewRunnerLoading() {
  return (
    <div className="mx-auto max-w-5xl">
      <Skeleton className="mb-5 h-4 w-32" />

      {/* Title + progress */}
      <div className="mb-6 space-y-3">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Question card */}
      <Card className="space-y-5 p-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>
        <Skeleton className="h-40 w-full rounded-lg" />
        <div className="flex justify-end gap-3">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </Card>
    </div>
  );
}
