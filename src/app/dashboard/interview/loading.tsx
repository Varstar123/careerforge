import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { ListItemsSkeleton } from "@/components/dashboard/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function InterviewsLoading() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Real header — renders instantly on navigation */}
      <PageHeader
        title="AI Interview Coach"
        description="Resume-aware mock interviews with instant, actionable scoring."
      >
        <Button variant="gradient" asChild>
          <Link href="/dashboard/interview/new">
            <Plus className="size-4" /> New interview
          </Link>
        </Button>
      </PageHeader>
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
