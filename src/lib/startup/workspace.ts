import { StartupWorkspaceSchema, type StartupProject, type StartupWorkspace } from "./types";

export const MAX_PROJECTS = 20;
export const MAX_BACKUP_BYTES = 2_000_000;
export function readWorkspace(raw: string | null): StartupWorkspace {
  if (raw === null) return { version: 1, projects: [] };
  if (raw.length > MAX_BACKUP_BYTES) throw new Error("The saved workspace is too large to open.");
  const result = StartupWorkspaceSchema.safeParse(JSON.parse(raw));
  if (!result.success) throw new Error("This workspace is not a supported Startup Builder backup.");
  return result.data;
}

/** Imports never replace an existing project with the same ID. */
export function mergeProjects(current: StartupProject[], incoming: StartupProject[]) {
  const known = new Set(current.map(project => project.id));
  const additions = incoming.filter(project => !known.has(project.id));
  if (current.length + additions.length > MAX_PROJECTS) throw new Error("A workspace can hold up to 20 projects. Export a backup and remove an old project before importing more.");
  return [...additions, ...current];
}
