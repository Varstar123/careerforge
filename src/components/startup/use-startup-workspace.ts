"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { readWorkspace } from "@/lib/startup/workspace";
import { StartupWorkspaceSchema, type StartupProject } from "@/lib/startup/types";

const EVENT = "careerforge-startup-workspace";
const serverSnapshot = () => null;
export function useStartupWorkspace(storageKey: string) {
  const subscribe = useCallback((notify: () => void) => {
    const storage = (event: StorageEvent) => { if (event.key === storageKey || event.key === null) notify(); };
    const local = (event: Event) => { if ((event as CustomEvent<string>).detail === storageKey) notify(); };
    window.addEventListener("storage", storage);
    window.addEventListener(EVENT, local);
    return () => { window.removeEventListener("storage", storage); window.removeEventListener(EVENT, local); };
  }, [storageKey]);
  const getSnapshot = useCallback(() => {
    try { return window.localStorage.getItem(storageKey); }
    catch { return "storage-unavailable"; }
  }, [storageKey]);
  const raw = useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
  const state = useMemo(() => {
    try { return { projects: readWorkspace(raw).projects, error: "" }; }
    catch { return { projects: [] as StartupProject[], error: "Saved projects could not be read. Storage may be blocked or the saved data may be damaged. Your saved data has not been changed." }; }
  }, [raw]);
  const save = useCallback((projects: StartupProject[]) => {
    // A failed read must not silently replace previously saved work.
    const existing = window.localStorage.getItem(storageKey);
    readWorkspace(existing);
    if (existing !== raw) throw new Error("The workspace changed in another tab. Your saved data is safe; try this change again after the workspace refreshes.");
    const next = StartupWorkspaceSchema.parse({ version: 1, projects });
    try { window.localStorage.setItem(storageKey, JSON.stringify(next)); }
    catch { throw new Error("Your browser could not save this change. Free some storage or enable local storage, then try again. Export your workspace to keep a backup."); }
    window.dispatchEvent(new CustomEvent(EVENT, { detail: storageKey }));
  }, [storageKey, raw]);
  const reset = useCallback(() => {
    window.localStorage.removeItem(storageKey);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: storageKey }));
  }, [storageKey]);
  return { ...state, save, raw, reset };
}
