import { getOrCreateUser } from "@/lib/auth";
import { getPrimaryResume } from "@/lib/queries";
import { jobsSourceReady } from "@/lib/jobs/sources";
import { PageHeader } from "@/components/dashboard/page-header";
import { JobsClient } from "@/components/jobs/jobs-client";

export const metadata = { title: "Job & Internship Finder" };

export default async function JobFinderPage() {
  const user = await getOrCreateUser();
  if (!user) return null;

  // Only the cheap "has a resume?" check blocks the shell; the jobs themselves
  // are loaded client-side so the header + controls render instantly on nav.
  const resume = await getPrimaryResume(user.id);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Job & Internship Finder"
        description="Live internships and entry-level roles, fetched automatically and ranked by how well they fit your resume."
      />
      <JobsClient hasResume={!!resume} jsearchReady={jobsSourceReady()} />
    </div>
  );
}
