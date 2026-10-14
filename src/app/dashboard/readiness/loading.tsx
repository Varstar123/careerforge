import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReadinessLoading() {
  return (
    <div className="mx-auto max-w-5xl" aria-label="Loading readiness" role="status">
      <PageHeader title="Career readiness" description="Turn your resume into a focused plan for the role you want." />
      <Card className="space-y-5 p-6">
        <Skeleton className="h-6 w-64 max-w-full" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Skeleton className="h-10" /><Skeleton className="h-10" />
        </div>
        <Skeleton className="h-10" />
        <Skeleton className="h-32" />
        <Skeleton className="h-11 w-40" />
      </Card>
    </div>
  );
}
