"use client";

import { useRouter } from "next/navigation";
import { ResumeUploader } from "@/components/interview/resume-uploader";
import {
  ResumeCard,
  type ResumeCardData,
} from "@/components/interview/resume-card";

export function ResumesClient({ resumes }: { resumes: ResumeCardData[] }) {
  const router = useRouter();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {resumes.length > 0 ? (
          resumes.map((r) => <ResumeCard key={r.id} resume={r} />)
        ) : (
          <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No resumes yet. Upload one to get started.
          </p>
        )}
      </div>
      <div className="lg:sticky lg:top-24 lg:self-start">
        <ResumeUploader
          onUploaded={() => router.refresh()}
          onRemoved={() => router.refresh()}
        />
      </div>
    </div>
  );
}
