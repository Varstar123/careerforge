"use client";

import * as React from "react";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "@/components/theme-provider";

function AppToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        style: {
          borderRadius: "0.75rem",
        },
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <AppToaster />
    </ThemeProvider>
  );
}
