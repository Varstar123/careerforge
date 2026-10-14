"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Plus, Download, Upload, Printer, Pencil, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StartupForm } from "./startup-form";
import { StartupReport, SECTIONS } from "./startup-report";
import { useStartupWorkspace } from "./use-startup-workspace";
import { EMPTY_BRIEF, EMPTY_SCENARIO, type StartupBrief, type StartupProject } from "@/lib/startup/types";
import { MAX_BACKUP_BYTES, MAX_PROJECTS, mergeProjects, readWorkspace } from "@/lib/startup/workspace";
import { startupMarkdown } from "@/lib/startup/export";
import { cn } from "@/lib/utils";

function download(text: string, name: string, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function fileName(name: string) { return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "startup-plan"; }

export function StartupBuilder({ storageKey }: { storageKey: string }) {
  const { projects, error: storageError, save, raw, reset } = useStartupWorkspace(storageKey);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "new" | "edit">("view");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const upload = useRef<HTMLInputElement>(null);
  const selected = projects.find(project => project.id === selectedId) ?? projects[0] ?? null;
  const showForm = mode !== "view" || !selected;

  function persist(next: StartupProject[], message = "Saved in this browser.") {
    try { save(next); setError(""); setNotice(message); return true; }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to save this change. Export a backup and try again."); return false; }
  }
  function saveBrief(brief: StartupBrief) {
    const timestamp = new Date().toISOString();
    if (mode === "edit" && selected) {
      if (persist(projects.map(project => project.id === selected.id ? { ...project, brief, updatedAt: timestamp, completedTasks: [] } : project), "Worksheet updated; checklist reset. Evidence and costs kept.")) setMode("view");
      return;
    }
    if (projects.length >= MAX_PROJECTS) { setError("This workspace holds up to 20 projects. Export a backup and remove an old project before adding another."); return; }
    const project: StartupProject = { id: crypto.randomUUID(), createdAt: timestamp, updatedAt: timestamp, brief, scenario: { ...EMPTY_SCENARIO }, completedTasks: [], notes: "" };
    if (persist([project, ...projects], "Worksheet created and saved in this browser.")) { setSelectedId(project.id); setMode("view"); }
  }
  function updateProject(update: Partial<Pick<StartupProject, "completedTasks" | "scenario" | "notes">>) {
    if (!selected) return;
    persist(projects.map(project => project.id === selected.id ? { ...project, ...update, updatedAt: new Date().toISOString() } : project));
  }
  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error("Choose a Startup Builder JSON backup smaller than 2 MB.");
      const incoming = readWorkspace(await file.text());
      const merged = mergeProjects(projects, incoming.projects);
      const added = merged.length - projects.length;
      if (persist(merged, added ? `Imported ${added} project${added === 1 ? "" : "s"}. Existing projects were preserved.` : "All projects in this backup are already saved.")) { setMode("view"); if (added) setSelectedId(merged[0].id); }
    } catch (err) { setError(err instanceof Error && !(err instanceof SyntaxError) ? err.message : "This file is not a valid Startup Builder JSON backup."); }
  }
  function removeProject() {
    if (!selected || !window.confirm(`Remove “${selected.brief.name}” from this browser? Download a backup first if you want to keep it.`)) return;
    if (persist(projects.filter(project => project.id !== selected.id), "Project removed from this browser.")) { setSelectedId(null); setMode("view"); }
  }

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
      <p className="max-w-xl text-sm text-muted-foreground">Validate the idea. Scope one useful version. Plan the next test.</p>
      <div className="flex flex-wrap gap-2"><Button variant="outline" className="min-h-11" onClick={() => upload.current?.click()} disabled={!!storageError}><Upload className="size-4" />Import backup</Button><Button variant="outline" className="min-h-11" disabled={!projects.length || !!storageError} onClick={() => download(JSON.stringify({ version: 1, projects }, null, 2), "careerforge-startup-backup.json", "application/json")}><Download className="size-4" />Back up workspace</Button><Button className="min-h-11" disabled={!!storageError} onClick={() => { setMode("new"); setError(""); setNotice(""); }}><Plus className="size-4" />New idea</Button></div>
      <input ref={upload} className="hidden" type="file" accept="application/json,.json" aria-label="Import Startup Builder backup" onChange={importBackup} />
    </div>
    {(error || storageError) && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error || storageError}{storageError && <div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" onClick={() => { if (raw && raw !== "storage-unavailable") download(raw, "startup-workspace-recovery.json", "application/json"); }} disabled={!raw || raw === "storage-unavailable"}>Download recovery copy</Button><Button variant="outline" onClick={() => { if (window.confirm("Clear this account's Startup Builder workspace from this browser? Download a recovery copy first. This does not affect your other CareerForge data.")) { try { reset(); setError(""); } catch { setError("Browser storage is blocked. Enable local storage to save projects here."); } } }}>Clear unreadable workspace</Button></div>}</div>}
    <p role="status" className="text-xs text-muted-foreground print:hidden">{notice || "No AI API calls or credits. Projects stay in this browser; they are not synced across devices."}</p>
    <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="space-y-6 lg:sticky lg:top-24 print:hidden">
        <div><h2 className="text-sm font-extrabold">Your ideas <span className="font-normal text-muted-foreground">({projects.length}/{MAX_PROJECTS})</span></h2>
          {projects.length ? <ul className="mt-3 flex gap-2 overflow-x-auto pb-2 lg:flex-col">{projects.map(project => <li key={project.id} className="min-w-40 lg:min-w-0"><button type="button" aria-current={selected?.id === project.id && mode === "view" ? "true" : undefined} onClick={() => { setSelectedId(project.id); setMode("view"); setError(""); setNotice(""); }} className={cn("w-full rounded-lg border px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-ring", selected?.id === project.id && mode === "view" ? "border-primary/40 bg-primary/5" : "border-border hover:bg-secondary/50")}><span className="block truncate text-sm font-medium">{project.brief.name}</span><span className="mt-1 block text-xs text-muted-foreground">{project.brief.productType}</span></button></li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">Your saved worksheets will appear here.</p>}
        </div>
        {selected && !showForm ? <nav aria-label="Startup worksheet sections" className="hidden border-l border-border pl-3 lg:block"><ul className="space-y-1">{SECTIONS.map(([id, title]) => <li key={id}><a href={`#startup-${id}`} className="block rounded-md py-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">{title}</a></li>)}</ul></nav> : <div className="hidden border-t border-border pt-5 lg:block"><FileText className="size-5 text-primary" aria-hidden="true" /><h3 className="mt-3 text-sm font-bold">A worksheet you can act on</h3><ol className="mt-3 list-decimal space-y-3 pl-4 text-sm leading-relaxed text-muted-foreground"><li>Describe one customer and one problem.</li><li>Test assumptions with conversations and a small trial.</li><li>Use the results to decide what to build.</li></ol></div>}
      </aside>
      <div className="min-w-0 space-y-4">
        {showForm ? <StartupForm key={mode === "edit" && selected ? selected.id : "new"} initial={mode === "edit" && selected ? selected.brief : EMPTY_BRIEF} editing={mode === "edit"} onSave={saveBrief} onCancel={selected ? () => setMode("view") : undefined} /> : <>
          <div className="flex flex-wrap gap-2 print:hidden"><Button variant="outline" className="min-h-11" onClick={() => setMode("edit")}><Pencil className="size-4" />Edit brief</Button><Button variant="outline" className="min-h-11" onClick={() => download(startupMarkdown(selected), `${fileName(selected.brief.name)}.md`, "text/markdown;charset=utf-8")}><Download className="size-4" />Download plan</Button><Button variant="outline" className="min-h-11" onClick={() => window.print()}><Printer className="size-4" />Print / save PDF</Button><Button variant="ghost" className="min-h-11 text-destructive" onClick={removeProject}><Trash2 className="size-4" />Remove</Button></div>
          <StartupReport key={selected.id} project={selected} onToggleTask={id => updateProject({ completedTasks: selected.completedTasks.includes(id) ? selected.completedTasks.filter(task => task !== id) : [...selected.completedTasks, id] })} onScenario={scenario => updateProject({ scenario })} onNotes={notes => updateProject({ notes })} />
        </>}
      </div>
    </div>
  </div>;
}
