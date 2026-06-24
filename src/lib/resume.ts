import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";

export const ACCEPTED_RESUME_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "text/plain": [".txt"],
} as const;

export const MAX_RESUME_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Extract raw text from an uploaded resume buffer.
 * Supports PDF (via unpdf), DOCX (via mammoth) and plain text.
 */
export async function extractResumeText(
  buffer: Buffer,
  fileType: string,
  fileName: string,
): Promise<string> {
  const lower = fileName.toLowerCase();

  if (fileType === "application/pdf" || lower.endsWith(".pdf")) {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return cleanup(Array.isArray(text) ? text.join("\n") : text);
  }

  if (
    fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx")
  ) {
    const { value } = await mammoth.extractRawText({ buffer });
    return cleanup(value);
  }

  // Fallback: treat as plain text
  return cleanup(buffer.toString("utf-8"));
}

function cleanup(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ ​﻿]/g, " ") // nbsp / zero-width -> space
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
