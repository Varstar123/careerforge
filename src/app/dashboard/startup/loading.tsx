import { PageHeader } from "@/components/dashboard/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function StartupLoading() {
  return <div className="mx-auto max-w-6xl" role="status" aria-label="Loading Startup Builder">
    <PageHeader title="Startup Builder" description="A practical workspace for testing demand and planning your first useful version." />
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]"><Skeleton className="h-40" /><div className="space-y-5 rounded-xl border border-border p-6"><Skeleton className="h-7 w-64 max-w-full" /><Skeleton className="h-10" /><Skeleton className="h-24" /><Skeleton className="h-10" /><Skeleton className="h-24" /></div></div>
  </div>;
}
