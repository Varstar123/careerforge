import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewInterviewLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="New mock interview"
        description="Pick a resume, set your target role, and we'll generate a tailored interview in seconds."
      />
      <Card className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <Skeleton className="h-11 w-40 rounded-lg" />
      </Card>
    </div>
  );
}
