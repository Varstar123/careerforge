import Link from "next/link";
import { ChevronRight, FileText, ListChecks } from "lucide-react";
import { StatusBadge } from "@/components/interview/status-badge";
import { formatDate, cn, scoreBand } from "@/lib/utils";
import type { InterviewStatus } from "@prisma/client";

export interface InterviewListItemData {
  id: string;
  title: string;
  targetRole: string;
  status: InterviewStatus;
  overallScore: number | null;
  createdAt: Date | string;
  questionCount: number;
  resumeName?: string | null;
}

export function InterviewListItem({ item }: { item: InterviewListItemData }) {
  const href =
    item.status === "COMPLETED"
      ? `/dashboard/interview/${item.id}/results`
      : `/dashboard/interview/${item.id}`;

  const band = item.overallScore != null ? scoreBand(item.overallScore) : null;

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
    >
      <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
        {item.overallScore != null ? (
          <span className={cn("tabular-nums", band?.className)}>
            {item.overallScore}
          </span>
        ) : (
          <ListChecks className="size-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{item.title}</p>
          <StatusBadge status={item.status} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{item.targetRole}</span>
          <span className="inline-flex items-center gap-1">
            <ListChecks className="size-3" /> {item.questionCount} questions
          </span>
          {item.resumeName && (
            <span className="inline-flex items-center gap-1">
              <FileText className="size-3" /> {item.resumeName}
            </span>
          )}
          <span>{formatDate(item.createdAt)}</span>
        </div>
      </div>

      <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}
