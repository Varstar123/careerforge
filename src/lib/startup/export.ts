import { buildStartupPlan, calculateScenario } from "./planner";
import type { StartupProject } from "./types";

export function startupMarkdown(project: StartupProject) {
  const b = project.brief;
  const p = buildStartupPlan(b);
  const scenario = calculateScenario(project.scenario);
  const lines = [
    `# ${b.name}`, "", "A guided planning worksheet. Market demand, costs and feasibility are not independently verified.", "",
    "## Idea brief", `- Solution: ${b.idea}`, `- First customer: ${b.audience}`, `- Problem: ${b.problem}`,
    `- Product: ${b.productType}`, `- Customer: ${b.customerType}`, `- Stage (self-reported): ${b.stage}`, `- Goal: ${b.goal}`,
    `- Current alternative: ${b.alternative || "Not recorded"}`, `- Proposed advantage: ${b.advantage || "Not recorded"}`,
    `- Founder skills: ${b.skills || "Not recorded"}`, `- Accounts: ${b.needsAccounts ? "Needed" : "Not requested"}; payments: ${b.needsPayments ? "Needed" : "Not requested"}; sensitive data: ${b.sensitiveData ? "Yes" : "Not requested"}`,
    "", "## First action", p.firstAction,
    "", "## Validation experiments", "Decision rules below are suggested starting points, not findings or statistical proof.",
  ];
  p.experiments.forEach(e => lines.push("", `### ${e.title}`, e.method, e.decisionRule));
  lines.push("", "### Customer interview guide", ...p.interviewQuestions.map(q => `- ${q}`));
  lines.push("", "## MVP scope");
  p.features.forEach(f => lines.push("", `### ${f.title}`, f.reason, `Acceptance check: ${f.acceptance}`));
  lines.push("", "### Keep out of this version", ...p.outOfScope.map(s => `- ${s}`));
  lines.push("", "## Technical plan");
  p.architecture.forEach(a => lines.push("", `### ${a.title}`, a.detail));
  lines.push("", "### Initial data records", ...p.entities.map(s => `- ${s}`), "", "### Capacity and constraints", ...p.constraints.map(s => `- ${s}`));
  lines.push("", "## First customers and business model", ...p.businessQuestions.map(q => `- ${q}`));
  p.channels.forEach(c => lines.push("", `### ${c.title}`, c.action));
  lines.push("", "## Roadmap", "Task completion records activity, not proof of demand.");
  p.roadmap.forEach(phase => {
    lines.push("", `### ${phase.week}: ${phase.title}`, phase.outcome);
    phase.tasks.forEach(task => lines.push(`- [${project.completedTasks.includes(task.id) ? "x" : " "}] ${task.title}`, `  Done when: ${task.doneWhen}`));
  });
  const s = project.scenario;
  lines.push("", `## Cost scenario (${s.currency})`, "User-entered assumptions. This is arithmetic, not a revenue forecast. Amounts below are in the selected currency.",
    `- Available cash: ${s.cashAvailable}`, `- One-time cost: ${s.oneTimeCost}`, `- Fixed monthly cost: ${s.fixedMonthlyCost}`, `- Monthly price per customer: ${s.monthlyPrice}`, `- Variable monthly cost per customer: ${s.variableCost}`, `- Assumed customers: ${s.customers}`,
    `- Monthly revenue: ${scenario.revenue}`, `- Monthly cost: ${scenario.monthlyCost}`, `- Monthly net: ${scenario.monthlyNet}`, `- Cash after setup: ${scenario.cashAfterSetup}`, `- Contribution per customer: ${scenario.contribution}`, `- Break-even customers: ${scenario.breakEvenCustomers ?? "Not calculable with non-positive contribution"}`, `- Runway: ${scenario.runwayMonths === null ? "Not calculated (no monthly burn or setup exceeds cash)" : `${scenario.runwayMonths.toFixed(1)} months at this fixed scenario`}`,
    "", "## Evidence log", project.notes || "No evidence recorded yet.",
  );
  return lines.join("\n");
}
