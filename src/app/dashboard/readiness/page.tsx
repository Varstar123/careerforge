import { getOrCreateUser } from "@/lib/auth";
import { getResumeOptions } from "@/lib/queries";
import { ParsedResumeSchema } from "@/lib/types";
import { PageHeader } from "@/components/dashboard/page-header";
import { ReadinessClient } from "@/components/readiness/readiness-client";
export const metadata = { title: "Career Readiness Analyzer" };
export default async function ReadinessPage() {
  const user = await getOrCreateUser();
  if (!user) return null;
  const resumes = await getResumeOptions(user.id);
  return <div className="mx-auto max-w-5xl">
    <PageHeader title="Career readiness" description="Turn your resume into a focused plan for the role you want." />
    <ReadinessClient resumes={resumes.map(r => { const p = ParsedResumeSchema.parse(r.parsed ?? {}); return { id: r.id, fileName: r.fileName, seniority: p.seniority, roles: p.suggestedRoles }; })} />
  </div>;
}
