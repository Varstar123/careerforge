import { getOrCreateUser } from "@/lib/auth";
import { getResumesForUser } from "@/lib/queries";
import { ParsedResumeSchema } from "@/lib/types";
import { PageHeader } from "@/components/dashboard/page-header";
import { ResumesClient } from "@/components/interview/resumes-client";
import type { ResumeCardData } from "@/components/interview/resume-card";

export const metadata = { title: "Resumes" };

export default async function ResumesPage() {
  const user = await getOrCreateUser();
  if (!user) return null;

  const resumes = await getResumesForUser(user.id);

  const data: ResumeCardData[] = resumes.map((r) => {
    const parsed = ParsedResumeSchema.parse(r.parsed ?? {});
    return {
      id: r.id,
      fileName: r.fileName,
      isPrimary: r.isPrimary,
      createdAt: r.createdAt,
      interviewCount: r._count.interviews,
      skills: parsed.skills,
      seniority: parsed.seniority,
      suggestedRoles: parsed.suggestedRoles,
    };
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Your resumes"
        description="Upload and manage the resumes that power your personalized interviews."
      />
      <ResumesClient resumes={data} />
    </div>
  );
}
