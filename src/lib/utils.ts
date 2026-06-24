import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Map a 0-100 score to a semantic label + tailwind color token. */
export function scoreBand(score: number): {
  label: string;
  className: string;
} {
  if (score >= 85) return { label: "Excellent", className: "text-success" };
  if (score >= 70) return { label: "Strong", className: "text-primary" };
  if (score >= 50) return { label: "Developing", className: "text-warning" };
  return { label: "Needs work", className: "text-destructive" };
}

export function initials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
