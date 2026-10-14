import { z } from "zod";

export const PRODUCT_TYPES = ["Web app", "Mobile app", "Marketplace", "Service", "Physical product", "Content or community"] as const;
export const StartupBriefSchema = z.object({
  name: z.string().trim().min(2, "Give your idea a name.").max(80),
  idea: z.string().trim().min(20, "Describe the solution in at least 20 characters.").max(2000),
  audience: z.string().trim().min(5, "Describe a specific first customer.").max(400),
  problem: z.string().trim().min(15, "Describe the problem in at least 15 characters.").max(1200),
  alternative: z.string().trim().max(600).default(""),
  advantage: z.string().trim().max(600).default(""),
  productType: z.enum(PRODUCT_TYPES),
  customerType: z.enum(["Individuals", "Businesses"]),
  stage: z.enum(["Idea", "Customer conversations", "Prototype", "Paying customers"]),
  goal: z.enum(["Validate demand", "Build an MVP"]),
  skills: z.string().trim().max(600).default(""),
  features: z.string().trim().max(1000).refine(value => value.split("\n").filter(line => line.trim()).length <= 3, "Choose at most three core features, one per line."),
  constraints: z.string().trim().max(1000).default(""),
  weeks: z.number().int().min(2).max(12),
  hoursPerWeek: z.number().int().min(1).max(80),
  needsAccounts: z.boolean(),
  needsPayments: z.boolean(),
  sensitiveData: z.boolean(),
});
export type StartupBrief = z.infer<typeof StartupBriefSchema>;

export const MAX_SCENARIO_AMOUNT = 10_000_000;
const amount = z.number().finite().min(0).max(MAX_SCENARIO_AMOUNT);
export const StartupScenarioSchema = z.object({
  currency: z.enum(["INR", "USD", "EUR", "GBP"]),
  cashAvailable: amount,
  oneTimeCost: amount,
  fixedMonthlyCost: amount,
  monthlyPrice: amount,
  variableCost: amount,
  customers: z.number().int().min(0).max(1_000_000),
});
export type StartupScenario = z.infer<typeof StartupScenarioSchema>;
export const EMPTY_SCENARIO: StartupScenario = { currency: "INR", cashAvailable: 0, oneTimeCost: 0, fixedMonthlyCost: 0, monthlyPrice: 0, variableCost: 0, customers: 0 };

export const StartupProjectSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  brief: StartupBriefSchema,
  scenario: StartupScenarioSchema,
  completedTasks: z.array(z.string().max(80)).max(50),
  notes: z.string().max(8000),
});
export type StartupProject = z.infer<typeof StartupProjectSchema>;
export const StartupWorkspaceSchema = z.object({ version: z.literal(1), projects: z.array(StartupProjectSchema).max(20) }).refine(value => new Set(value.projects.map(project => project.id)).size === value.projects.length, "Project IDs must be unique.");
export type StartupWorkspace = z.infer<typeof StartupWorkspaceSchema>;
export const EMPTY_BRIEF: StartupBrief = { name: "", idea: "", audience: "", problem: "", alternative: "", advantage: "", productType: "Web app", customerType: "Individuals", stage: "Idea", goal: "Validate demand", skills: "", features: "", constraints: "", weeks: 4, hoursPerWeek: 8, needsAccounts: false, needsPayments: false, sensitiveData: false };

export const EXAMPLE_BRIEF: StartupBrief = {
  ...EMPTY_BRIEF,
  name: "Campus skill swap",
  idea: "Help students exchange a short tutoring session for help with a skill they want to learn.",
  audience: "Students in one university who need occasional peer tutoring",
  problem: "Students struggle to find trusted peers who can explain a topic before an assignment deadline.",
  alternative: "Class group chats and asking friends for introductions",
  advantage: "Start with one campus and match a specific learning request to a peer's availability.",
  productType: "Marketplace",
  skills: "Basic HTML, CSS and JavaScript; access to two student clubs",
};
