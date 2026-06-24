import Link from "next/link";
import { Plus, MessagesSquare } from "lucide-react";
import { getOrCreateUser } from "@/lib/auth";
import { getInterviewsForUser } from "@/lib/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { InterviewsClient } from "@/components/interview/interviews-client";
import type { InterviewListItemData } from "@/components/interview/interview-list-item";

export const metadata = { title: "Interview Coach" };

export default async function InterviewsPage() {
  const user = await getOrCreateUser();
  if (!user) return null;

  const interviews = await getInterviewsForUser(user.id);

  const items: InterviewListItemData[] = interviews.map((i) => ({
    id: i.id,
    title: i.title,
    targetRole: i.targetRole,
    status: i.status,
    overallScore: i.overallScore,
    createdAt: i.createdAt,
    questionCount: i._count.questions,
    resumeName: i.resume?.fileName,
  }));

  return (
    <div className="mx-auto max-w-4xl">
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

      {items.length > 0 ? (
        <InterviewsClient items={items} />
      ) : (
        <EmptyState
          icon={MessagesSquare}
          title="Start your first interview"
          description="Upload your resume and we'll generate a tailored mock interview with instant AI feedback."
          action={
            <Button variant="gradient" asChild>
              <Link href="/dashboard/interview/new">
                <Plus className="size-4" /> New interview
              </Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
