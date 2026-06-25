import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListItemsSkeleton } from "@/components/dashboard/skeletons";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      {/* Greeting — real heading + action render instantly */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back 👋
          </h1>
          <Skeleton className="mt-2 h-4 w-80 max-w-full" />
        </div>
        <Button variant="gradient" asChild>
          <Link href="/dashboard/interview/new">
            <Plus className="size-4" /> New interview
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-24" />
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <Skeleton className="mb-4 h-5 w-28" />
            <Skeleton className="h-[220px] w-full rounded-lg" />
          </Card>
          <div>
            <Skeleton className="mb-3 h-5 w-40" />
            <ListItemsSkeleton count={3} />
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="mb-1 h-5 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="flex items-start gap-3 p-4">
              <Skeleton className="size-5 shrink-0 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
