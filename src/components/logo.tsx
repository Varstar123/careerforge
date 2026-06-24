import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
  showWord = true,
}: {
  className?: string;
  href?: string;
  showWord?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 font-semibold", className)}
    >
      <span className="relative grid size-8 place-items-center rounded-lg bg-[linear-gradient(135deg,var(--primary),color-mix(in_oklch,var(--primary)_60%,var(--chart-5)))] text-primary-foreground shadow-sm shadow-primary/30">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-5"
          aria-hidden="true"
        >
          <path
            d="M12 3l2.2 5.2L20 9.3l-4 3.9.95 5.8L12 16.9 7.05 19l.95-5.8-4-3.9 5.8-1.1L12 3z"
            fill="currentColor"
            opacity="0.95"
          />
        </svg>
      </span>
      {showWord && (
        <span className="text-[0.95rem] tracking-tight">
          CareerForge<span className="text-primary"> AI</span>
        </span>
      )}
    </Link>
  );
}
