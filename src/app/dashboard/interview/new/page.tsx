import { getOrCreateUser } from "@/lib/auth";
import { getResumesForUser } from "@/lib/queries";
import { ParsedResumeSchema } from "@/lib/types";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  NewInterviewWizard,
  type ResumeOption,
} from "@/components/interview/new-interview-wizard";

export const metadata = { title: "New interview" };

export default async function NewInterviewPage() {
  const user = await getOrCreateUser();
  if (!user) return null;

  const resumes = await getResumesForUser(user.id);

  const options: ResumeOption[] = resumes.map((r) => {
    const parsed = ParsedResumeSchema.parse(r.parsed ?? {});
    return {
      id: r.id,
      fileName: r.fileName,
      isPrimary: r.isPrimary,
      skills: parsed.skills,
      seniority: parsed.seniority,
      suggestedRoles: parsed.suggestedRoles,
    };
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="New mock interview"
        description="Pick a resume, set your target role, and we'll generate a tailored interview in seconds."
      />
      <NewInterviewWizard initialResumes={options} />
    </div>
  );
}
