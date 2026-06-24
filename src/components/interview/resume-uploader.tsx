"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MAX_RESUME_BYTES } from "@/lib/resume";
import type { ParsedResume } from "@/lib/types";

export interface UploadedResume {
  id: string;
  fileName: string;
  isPrimary: boolean;
  parsed: ParsedResume;
}

export function ResumeUploader({
  onUploaded,
  compact = false,
}: {
  onUploaded?: (resume: UploadedResume) => void;
  compact?: boolean;
}) {
  const [status, setStatus] = React.useState<
    "idle" | "uploading" | "done"
  >("idle");
  const [fileName, setFileName] = React.useState<string | null>(null);

  const upload = React.useCallback(
    async (file: File) => {
      setStatus("uploading");
      setFileName(file.name);
      const form = new FormData();
      form.append("file", file);

      try {
        const res = await fetch("/api/resume/upload", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");

        setStatus("done");
        toast.success("Resume analyzed", {
          description: `${data.resume.parsed.skills?.length ?? 0} skills extracted.`,
        });
        onUploaded?.(data.resume as UploadedResume);
      } catch (err) {
        setStatus("idle");
        setFileName(null);
        toast.error(
          err instanceof Error ? err.message : "Could not process resume",
        );
      }
    },
    [onUploaded],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    multiple: false,
    maxSize: MAX_RESUME_BYTES,
    noClick: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
      "text/plain": [".txt"],
    },
    onDropRejected: (rejections) => {
      const msg = rejections[0]?.errors[0]?.message ?? "File rejected";
      toast.error(msg);
    },
    onDropAccepted: (files) => {
      if (files[0]) void upload(files[0]);
    },
    disabled: status === "uploading",
  });

  return (
    <div
      {...getRootProps()}
      onClick={status === "uploading" ? undefined : open}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition-colors",
        compact ? "p-6" : "p-10",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-border bg-card/40 hover:border-primary/40 hover:bg-card/70",
        status === "uploading" && "pointer-events-none opacity-90",
      )}
    >
      <input {...getInputProps()} />

      {status === "uploading" ? (
        <>
          <Loader2 className="mb-3 size-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Analyzing {fileName}…</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Extracting skills, projects and experience
          </p>
        </>
      ) : status === "done" ? (
        <>
          <CheckCircle2 className="mb-3 size-8 text-success" />
          <p className="text-sm font-medium">{fileName} analyzed</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload a different file to replace it
          </p>
        </>
      ) : (
        <>
          <span className="mb-3 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <UploadCloud className="size-6" />
          </span>
          <p className="text-sm font-medium">
            {isDragActive ? "Drop your resume here" : "Drag & drop your resume"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or click to browse · PDF, DOCX or TXT · up to 8 MB
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="size-3.5" /> Your data stays private to your
            account
          </div>
        </>
      )}
    </div>
  );
}
