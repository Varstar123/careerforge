// Run with: node scripts/test-startup.cjs. Uses the installed TypeScript compiler;
// no external services, database writes or additional test dependencies.
/* eslint-disable @typescript-eslint/no-require-imports -- This CommonJS test harness compiles and loads the project's TypeScript modules. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const loaded = new Map();
function load(file, overrides = {}) {
  const full = path.resolve(file);
  if (loaded.has(full)) return loaded.get(full).exports;
  const entry = new Module(full, module);
  loaded.set(full, entry);
  entry.filename = full;
  entry.paths = module.paths;
  const baseRequire = entry.require.bind(entry);
  entry.require = name => {
    if (overrides[name]) return overrides[name];
    const local = name.startsWith("@/") ? path.resolve("src", name.slice(2)) : name.startsWith(".") ? path.resolve(path.dirname(full), name) : null;
    if (local) {
      for (const extension of [".ts", ".tsx"]) if (fs.existsSync(local + extension)) return load(local + extension);
    }
    return baseRequire(name);
  };
  entry._compile(ts.transpileModule(fs.readFileSync(full, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, full);
  return entry.exports;
}
const { StartupBriefSchema, StartupScenarioSchema, StartupWorkspaceSchema, EMPTY_SCENARIO, EXAMPLE_BRIEF, PRODUCT_TYPES } = load("src/lib/startup/types.ts");
const { buildStartupPlan, calculateScenario } = load("src/lib/startup/planner.ts");
const { readWorkspace, mergeProjects, MAX_BACKUP_BYTES } = load("src/lib/startup/workspace.ts");
const { startupMarkdown } = load("src/lib/startup/export.ts");
let checks = 0;
function check(name, run) { run(); checks++; console.log(`PASS ${name}`); }
function project(index = 0) {
  return { id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`, createdAt: "2026-10-14T10:00:00.000Z", updatedAt: "2026-10-14T10:00:00.000Z", brief: { ...EXAMPLE_BRIEF }, scenario: { ...EMPTY_SCENARIO }, completedTasks: [], notes: "" };
}
check("brief validation rejects blank ideas, overlong feature lists and invalid capacity", () => {
  assert(StartupBriefSchema.safeParse(EXAMPLE_BRIEF).success);
  for (const patch of [{ audience: " " }, { idea: "short" }, { features: "a\nb\nc\nd" }, { weeks: 13 }, { hoursPerWeek: NaN }]) assert.equal(StartupBriefSchema.safeParse({ ...EXAMPLE_BRIEF, ...patch }).success, false);
});
check("every product pattern has a bounded MVP and unique actionable roadmap", () => {
  for (const productType of PRODUCT_TYPES) {
    const brief = { ...EXAMPLE_BRIEF, productType };
    const plan = buildStartupPlan(brief);
    assert.deepEqual(plan, buildStartupPlan(brief));
    assert(plan.features.length > 0 && plan.features.length <= 3);
    assert.equal(plan.experiments.length, 3);
    assert(plan.architecture.length >= 5);
    const tasks = plan.roadmap.flatMap(phase => phase.tasks);
    assert.equal(new Set(tasks.map(task => task.id)).size, tasks.length);
    assert(tasks.every(task => task.title && task.doneWhen));
    for (const phase of plan.roadmap) for (const week of phase.week.match(/\d+/g)) assert(Number(week) >= 1 && Number(week) <= brief.weeks);
  }
});
check("requirements, customer type and founder-selected capabilities affect the plan", () => {
  const plan = buildStartupPlan({ ...EXAMPLE_BRIEF, customerType: "Businesses", needsPayments: true, needsAccounts: true, sensitiveData: true, features: "Request a session\nConfirm a match" });
  assert.deepEqual(plan.features.map(feature => feature.title), ["Request a session", "Confirm a match"]);
  assert(plan.experiments[0].method.includes("approve a purchase"));
  assert(plan.architecture.some(item => item.detail.includes("synthetic")));
  assert(plan.architecture.some(item => item.detail.includes("hosted checkout")));
  assert(plan.architecture.some(item => item.detail.includes("two separate accounts")));
});
check("validation goal does not present a full software build as a prerequisite", () => {
  assert.match(buildStartupPlan(EXAMPLE_BRIEF).roadmap[2].outcome, /defer software/);
  assert.match(buildStartupPlan({ ...EXAMPLE_BRIEF, goal: "Build an MVP" }).roadmap[2].title, /Build/);
});
check("financial arithmetic handles break-even, burn and setup costs", () => {
  const result = calculateScenario({ ...EMPTY_SCENARIO, cashAvailable: 1000, oneTimeCost: 100, fixedMonthlyCost: 200, monthlyPrice: 20, variableCost: 5, customers: 10 });
  assert.equal(result.revenue, 200);
  assert.equal(result.monthlyCost, 250);
  assert.equal(result.monthlyNet, -50);
  assert.equal(result.breakEvenCustomers, 14);
  assert.equal(result.runwayMonths, 18);
});
check("zero and negative margins do not produce fictional break-even or infinite runway", () => {
  assert.equal(calculateScenario(EMPTY_SCENARIO).breakEvenCustomers, null);
  assert.equal(calculateScenario(EMPTY_SCENARIO).runwayMonths, null);
  assert.equal(calculateScenario({ ...EMPTY_SCENARIO, monthlyPrice: 1, variableCost: 2 }).breakEvenCustomers, null);
  assert.equal(calculateScenario({ ...EMPTY_SCENARIO, oneTimeCost: 1, fixedMonthlyCost: 1 }).runwayMonths, null);
  assert.equal(StartupScenarioSchema.safeParse({ ...EMPTY_SCENARIO, fixedMonthlyCost: -1 }).success, false);
  assert.equal(StartupScenarioSchema.safeParse({ ...EMPTY_SCENARIO, customers: 1.5 }).success, false);
});
check("fractional prices do not introduce an extra break-even customer", () => {
  assert.equal(calculateScenario({ ...EMPTY_SCENARIO, fixedMonthlyCost: 0.07, monthlyPrice: 0.01 }).breakEvenCustomers, 7);
  assert.equal(calculateScenario({ ...EMPTY_SCENARIO, monthlyPrice: 0.1, customers: 3 }).revenue, 0.3);
});
check("backup round trip preserves inputs, evidence, costs and checklist state", () => {
  const original = project(); original.notes = "Observed two real trial commitments."; original.completedTasks = ["find-customers"];
  assert.deepEqual(readWorkspace(JSON.stringify({ version: 1, projects: [original] })).projects, [original]);
  assert.deepEqual(readWorkspace(null).projects, []);
});
check("bad or future-version backups cannot silently replace saved work", () => {
  assert.throws(() => readWorkspace("broken JSON"));
  assert.throws(() => readWorkspace(JSON.stringify({ version: 2, projects: [] })));
  assert.throws(() => readWorkspace("x".repeat(MAX_BACKUP_BYTES + 1)));
  assert.equal(StartupWorkspaceSchema.safeParse({ version: 1, projects: [project(), project()] }).success, false);
});
check("imports preserve existing projects and enforce the workspace limit", () => {
  const existing = project(1); existing.notes = "Keep existing notes.";
  const duplicate = project(1); duplicate.notes = "Never overwrite these notes.";
  const merged = mergeProjects([existing], [duplicate, project(2)]);
  assert.equal(merged.length, 2);
  assert.equal(merged.find(p => p.id === existing.id).notes, existing.notes);
  assert.throws(() => mergeProjects(Array.from({ length: 20 }, (_, i) => project(i)), [project(21)]));
});
check("Markdown export includes the complete worksheet and progress", () => {
  const value = project(); value.completedTasks = ["find-customers"]; value.notes = "Keep this observed outcome.";
  const output = startupMarkdown(value);
  for (const section of ["Idea brief", "Validation experiments", "MVP scope", "Technical plan", "Roadmap", "Cost scenario", "Evidence log"]) assert(output.includes(`## ${section}`));
  assert(output.includes("[x] Recruit five"));
  assert(output.includes(value.notes));
  assert(output.includes("not a revenue forecast"));
});
check("report renders every section and escapes user-authored content", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const { StartupReport, SECTIONS } = load("src/components/startup/startup-report.tsx");
  const value = project(); value.brief.name = '<script>alert("test")</script>';
  const output = renderToStaticMarkup(React.createElement(StartupReport, { project: value, onToggleTask() {}, onScenario() {}, onNotes() {} }));
  assert(!output.includes('<script>alert("test")</script>'));
  assert(output.includes("&lt;script&gt;"));
  for (const [id] of SECTIONS) assert(output.includes(`id="startup-${id}"`));
});
check("browser storage isolates accounts, detects stale writes and preserves data on save errors", () => {
  const previousWindow = global.window;
  const values = new Map();
  const events = new EventTarget();
  let full = false;
  global.window = {
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
    localStorage: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => { if (full) throw new Error("Quota exceeded"); values.set(key, value); },
      removeItem: key => values.delete(key),
    },
  };
  const { useStartupWorkspace } = load("src/components/startup/use-startup-workspace.ts", { react: {
    useCallback: callback => callback,
    useMemo: callback => callback(),
    useSyncExternalStore: (subscribe, snapshot) => snapshot(),
  } });
  try {
    const first = useStartupWorkspace("account-one");
    assert.deepEqual(first.projects, []);
    first.save([project()]);
    assert.equal(useStartupWorkspace("account-one").projects.length, 1);
    assert.deepEqual(useStartupWorkspace("account-two").projects, []);
    assert.throws(() => first.save([]), /another tab/);
    const current = useStartupWorkspace("account-one");
    full = true;
    assert.throws(() => current.save([]), /could not save/);
    full = false;
    assert.equal(useStartupWorkspace("account-one").projects.length, 1);
    values.set("account-two", "corrupted");
    const damaged = useStartupWorkspace("account-two");
    assert(damaged.error);
    assert.throws(() => damaged.save([]));
    assert.equal(values.get("account-two"), "corrupted");
    damaged.reset();
    assert.equal(values.has("account-two"), false);
    assert.equal(useStartupWorkspace("account-one").projects.length, 1);
  } finally { if (previousWindow === undefined) delete global.window; else global.window = previousWindow; }
});
console.log(`\n${checks} Startup Builder checks passed. No network requests or database changes.`);
