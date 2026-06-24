"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Star, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteResume, setPrimaryResume } from "@/lib/actions";
import { formatDate } from "@/lib/utils";

export interface ResumeCardData {
  id: string;
  fileName: string;
  isPrimary: boolean;
  createdAt: Date | string;
  interviewCount: number;
  skills: string[];
  seniority: string;
  suggestedRoles: string[];
}

export function ResumeCard({ resume }: { resume: ResumeCardData }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [busy, setBusy] = React.useState<"delete" | "primary" | null>(null);

  function handleDelete() {
    setBusy("delete");
    start(async () => {
      try {
        await deleteResume(resume.id);
        toast.success("Resume deleted");
        router.refresh();
      } catch {
        toast.error("Could not delete resume");
      } finally {
        setBusy(null);
      }
    });
  }

  function handlePrimary() {
    setBusy("primary");
    start(async () => {
      try {
        await setPrimaryResume(resume.id);
        toast.success("Set as primary resume");
        router.refresh();
      } catch {
        toast.error("Could not update");
      } finally {
        setBusy(null);
      }
    });
  }

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <FileText className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">{resume.fileName}</p>
            {resume.isPrimary && (
              <Badge variant="default" className="gap-1">
                <Star className="size-3" /> Primary
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {resume.seniority} · {resume.interviewCount} interviews ·{" "}
            {formatDate(resume.createdAt)}
          </p>
        </div>
      </div>

      {resume.skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {resume.skills.slice(0, 8).map((s) => (
            <Badge key={s} variant="secondary" className="font-normal">
              {s}
            </Badge>
          ))}
          {resume.skills.length > 8 && (
            <Badge variant="outline" className="font-normal">
              +{resume.skills.length - 8}
            </Badge>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
        {!resume.isPrimary && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrimary}
            disabled={pending}
          >
            {busy === "primary" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Star className="size-3.5" />
            )}
            Set primary
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={pending}
          className="text-muted-foreground hover:text-destructive"
        >
          {busy === "delete" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
          Delete
        </Button>
      </div>
    </Card>
  );
}
