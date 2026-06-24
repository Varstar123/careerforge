"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { toggleTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {/* CSS-driven by the `.dark` class so SSR/CSR markup always matches. */}
      <Sun className="hidden size-[1.15rem] dark:block" />
      <Moon className="size-[1.15rem] dark:hidden" />
    </Button>
  );
}
