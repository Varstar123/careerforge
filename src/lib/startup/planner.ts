import type { StartupBrief, StartupScenario } from "./types";

type Feature = { title: string; reason: string; acceptance: string };
type Experiment = { id: string; title: string; method: string; decisionRule: string };
export type RoadmapTask = { id: string; title: string; doneWhen: string };
export type RoadmapPhase = { title: string; week: string; outcome: string; tasks: RoadmapTask[] };

const PATTERNS: Record<StartupBrief["productType"], { prototype: string; features: Feature[]; entities: string[]; avoid: string[] }> = {
  "Web app": {
    prototype: "Use a clickable screen or a single-page demo with sample data. Deliver the result manually before building automation.",
    features: [
      { title: "Capture one customer request", reason: "Start with the problem customers actually bring.", acceptance: "A first-time user can enter the required information and recover from invalid input." },
      { title: "Deliver the core result", reason: "Prove the main benefit before adding secondary workflows.", acceptance: "One representative request produces a useful result the customer can explain back to you." },
      { title: "Collect outcome feedback", reason: "Learn whether the result helped, not just whether the interface was liked.", acceptance: "The customer can describe the outcome and leave a follow-up contact with consent." },
    ],
    entities: ["Request: input, status, created time", "Result: request reference, output, delivered time", "Feedback: result reference, usefulness, optional contact"],
    avoid: ["Multiple dashboards", "Real-time collaboration", "Automated recommendations before a useful manual result"],
  },
  "Mobile app": {
    prototype: "Test the core flow in a clickable phone prototype or a mobile web page before investing in app-store distribution.",
    features: [
      { title: "Complete one phone-friendly task", reason: "Validate why this workflow needs a phone.", acceptance: "A customer can finish the core task on a small screen with minimal steps." },
      { title: "Save or retrieve the result", reason: "Make the primary outcome available when it is needed again.", acceptance: "The result survives reopening the app, with an understandable empty state." },
      { title: "Report a problem", reason: "Learn from real use before widening distribution.", acceptance: "A test user can report what failed without sharing unnecessary personal information." },
    ],
    entities: ["Core record: input, status, last update", "Saved result: record reference, output", "Feedback: issue description, device context"],
    avoid: ["Native apps for both platforms at once", "Push notifications before repeat use", "Background tracking without a validated need"],
  },
  "Marketplace": {
    prototype: "Recruit a small group on each side and make the first matches manually. Track requests and fulfillment in a simple sheet.",
    features: [
      { title: "Capture supply and a specific request", reason: "A marketplace needs both sides available for the same use case.", acceptance: "You can find an available provider for a clearly described customer request." },
      { title: "Make and confirm a match", reason: "A completed exchange matters more than a large listing count.", acceptance: "Both parties understand the match and confirm the next step." },
      { title: "Record completion and issues", reason: "Learn where exchanges fail and whether participants would return.", acceptance: "Each trial exchange has an outcome, issue log and a follow-up." },
    ],
    entities: ["Offer: provider, capability, availability", "Request: customer need, constraints, status", "Match: offer and request references, confirmation, outcome"],
    avoid: ["Launching in multiple locations", "Ranking algorithms before repeat matches", "Building payment escrow into the first prototype"],
  },
  "Service": {
    prototype: "Offer a clearly scoped manual pilot. Use a short intake form, a written deliverable and direct follow-up.",
    features: [
      { title: "Define a bounded service package", reason: "Customers need to understand the deliverable and limits.", acceptance: "The pilot has an agreed scope, completion condition and turnaround." },
      { title: "Intake and fulfill a request", reason: "Test delivery effort before automating operations.", acceptance: "One real request moves from intake to a customer-reviewed deliverable." },
      { title: "Collect delivery feedback", reason: "Learn whether the outcome justifies the customer's time or money.", acceptance: "Record the customer's next action and the actual effort needed to deliver." },
    ],
    entities: ["Customer request: scope, contact consent, deadline", "Delivery: status, deliverable, effort", "Feedback: accepted outcome, follow-up"],
    avoid: ["Building a platform before delivering the service", "Unbounded custom work", "Hiring before understanding delivery effort"],
  },
  "Physical product": {
    prototype: "Test a sketch, mockup or small prototype with prospective users before ordering inventory. Record manufacturing and delivery unknowns.",
    features: [
      { title: "Demonstrate the core use case", reason: "Learn whether the product solves the physical task.", acceptance: "A prospective user can attempt the task with the mockup and explain its limitations." },
      { title: "Test sourcing and fulfillment", reason: "Delivery constraints can invalidate an otherwise useful idea.", acceptance: "Record a real supplier quote, lead time and a trial fulfillment process." },
      { title: "Capture interest without unsupported promises", reason: "Separate casual interest from a concrete next step.", acceptance: "Interested users agree to a follow-up, with clear prototype limitations." },
    ],
    entities: ["Prototype: revision, materials, test results", "Interest: use case, follow-up consent", "Quote: supplier, quantity, date, landed cost"],
    avoid: ["Buying bulk inventory before tests", "Custom ecommerce software", "Treating expressed interest as completed sales"],
  },
  "Content or community": {
    prototype: "Run a short content series or a small facilitated group using channels your audience already uses. Test return participation.",
    features: [
      { title: "Publish one focused offering", reason: "A specific recurring benefit gives people a reason to join.", acceptance: "A participant can explain who the offering is for and the outcome it supports." },
      { title: "Deliver and facilitate participation", reason: "Learn whether members engage without constant prompting.", acceptance: "Run one complete session or content cycle and record participation." },
      { title: "Invite a repeat action", reason: "Returning is stronger evidence than an initial signup.", acceptance: "Track whether participants return or refer someone, with their consent." },
    ],
    entities: ["Offering: topic, delivery schedule, format", "Participant: consent, participation", "Feedback: outcome, repeat action"],
    avoid: ["Building a social network", "Scaling moderation before a small pilot", "Using follower counts as proof of value"],
  },
};

export function buildStartupPlan(brief: StartupBrief) {
  const pattern = PATTERNS[brief.productType];
  const customFeatures = brief.features.split("\n").map(line => line.trim()).filter(Boolean);
  const features: Feature[] = customFeatures.length ? customFeatures.map(title => ({ title, reason: "Founder-selected scope; test whether this is needed for the customer's first useful result.", acceptance: `A representative customer completes “${title}” without help; record the result and any blocker.` })) : pattern.features;
  const business = brief.customerType === "Businesses";
  const experiments: Experiment[] = [
    { id: "interviews", title: "Find evidence of the problem", method: `Recruit five people from: ${brief.audience}. Ask about their most recent experience with the problem before describing your solution. ${business ? "Include the person doing the work and the person who can approve a purchase." : "Use a channel where these people already ask for help."}`, decisionRule: "Suggested rule: at least three independently describe a recent, costly or frustrating occurrence and an existing workaround. If the pattern is weak, narrow the audience or problem and repeat." },
    { id: "pilot", title: "Ask for a concrete commitment", method: `${pattern.prototype} Invite interviewees to one small trial with a clear outcome and honest limits.`, decisionRule: "Suggested rule: two people agree to a scheduled trial or provide a real task to solve. Compliments and unconfirmed waitlist entries alone do not meet this rule." },
    { id: "repeat", title: "Test whether the outcome earns another use", method: "Deliver the trial, record your actual effort and ask what the customer did next. Invite another use or a specific introduction.", decisionRule: "Suggested rule: a participant repeats the workflow or makes a relevant introduction. Record refusals and reasons; change the offer if the result is not useful." },
  ];
  const interviewQuestions = [
    "Tell me about the last time you faced this problem. What triggered it?",
    "Walk me through what you did, step by step. What did you use?",
    "Which part took the most time, effort or money? How do you know?",
    "What have you already tried? What made it fall short?",
    business ? "Who owns this workflow, who approves spending, and what would a trial require?" : "How do you decide whether to try a different approach?",
    "Could we follow up about a real example or observe the workflow with your permission?",
  ];
  const architecture = [
    { title: "Start with the smallest delivery system", detail: pattern.prototype },
    { title: "Choose a familiar implementation", detail: brief.skills ? `Use the tools you can maintain: ${brief.skills}. Keep one codebase and add infrastructure only when a tested workflow requires it.` : "Use a manual prototype first. For a software MVP, choose one stack your team already understands and one primary data store; learning a new stack is a separate time cost." },
    { title: "Keep a clear data boundary", detail: brief.sensitiveData ? "Prototype with synthetic or redacted records. Before using sensitive customer data, define the collection purpose, retention, access controls and a deletion path." : "Collect only the records required for the core workflow. Keep credentials on the server and give each user access only to their own private records." },
    { title: "Identity and access", detail: brief.needsAccounts ? "Use an established authentication library or provider after checking its current free-tier limits. Enforce ownership in every server read and write; test with two separate accounts." : "Skip signup for the first trial if identity is not needed. If records must be private, add an access boundary before collecting them." },
    { title: "Payments", detail: brief.needsPayments ? "Validate willingness to pay before integrating billing. For paid pilots, use a provider's hosted checkout after checking transaction fees; confirm payment status on the server and handle retries idempotently." : "Keep billing outside the first build. Ask what commitment customers would make and record actual delivery costs before choosing a price." },
    { title: "A release you can support", detail: "Keep development and production configuration separate. Test the main workflow, failure states and data recovery. Record deployment steps and how to undo a bad release." },
  ];
  const week = (fraction: number) => Math.max(1, Math.min(brief.weeks, Math.ceil(brief.weeks * fraction)));
  const roadmap: RoadmapPhase[] = [
    { title: "Validate the problem", week: `Week 1–${week(0.25)}`, outcome: "A specific audience, recent problem examples and a decision to continue or change direction.", tasks: [
      { id: "find-customers", title: "Recruit five relevant interviewees", doneWhen: "Record who fits the audience, how you reached them and consent for follow-up." },
      { id: "problem-interviews", title: "Run problem interviews", doneWhen: "Save observed workarounds, recent examples and contradictory evidence in the evidence log." },
      { id: "validation-decision", title: "Choose a validation decision", doneWhen: "Write what evidence supports continuing, what is missing and the next test." },
    ] },
    { title: "Test the proposed result", week: `Week ${week(0.25)}–${week(0.5)}`, outcome: "A small trial that tests the outcome before a full build.", tasks: [
      { id: "map-workflow", title: "Map one end-to-end customer workflow", doneWhen: "Define the input, useful result, failure case and who completes each step." },
      { id: "run-prototype", title: "Run a manual or clickable pilot", doneWhen: "Invite trial participants and record commitments, outcomes and refusals." },
    ] },
    { title: brief.goal === "Validate demand" ? "Test the minimum useful version" : "Build the minimum useful version", week: `Week ${week(0.5)}–${week(0.85)}`, outcome: brief.goal === "Validate demand" ? "Test the core outcome with the smallest manual or clickable version; defer software that is not needed to learn." : "Only the core workflow, backed by acceptance checks.", tasks: [
      ...features.map((feature, index) => ({ id: `mvp-feature-${index}`, title: feature.title, doneWhen: feature.acceptance })),
      { id: "test-boundaries", title: "Test failures and data boundaries", doneWhen: "Check invalid input, unavailable services and data recovery; if accounts exist, verify one user cannot read another user's records." },
    ] },
    { title: "Launch a small pilot and decide", week: `Week ${week(0.85)}–${brief.weeks}`, outcome: "Real use and a written decision about the next iteration.", tasks: [
      { id: "launch-pilot", title: "Onboard the first trial users personally", doneWhen: "Observe whether a user reaches the useful result and log where assistance was needed." },
      { id: "review-evidence", title: "Review outcomes and choose the next move", doneWhen: "Compare observed use and effort to your decision rules. Decide to iterate, narrow the audience or stop this version." },
    ] },
  ];
  return {
    experiments, interviewQuestions, features, architecture, roadmap,
    entities: pattern.entities,
    outOfScope: pattern.avoid,
    firstAction: brief.stage === "Paying customers" ? "Talk to a recent customer who returned and one who did not. Find out which outcome and delivery constraint should shape the next version." : brief.goal === "Validate demand" ? "Find one person who fits your first-customer description and ask about their last real experience with the problem." : "Write the acceptance check for the core outcome, then put a manual or clickable version in front of a relevant customer before committing the full build window.",
    channels: business ? [
      { title: "Direct workflow outreach", action: "Contact a small set of relevant operators with a short request to learn about their process. Keep it personal; track replies and scheduled conversations, not send volume." },
      { title: "Warm introductions", action: "Ask interviewees for introductions to another person with the same workflow. Explain who is a good fit and get permission before sharing contact details." },
    ] : [
      { title: "One relevant community", action: "With the organizer's permission, ask for problem interviews in a group where the audience already participates. Use their words to refine the offer." },
      { title: "A small demonstration", action: "Show one useful before-and-after workflow and invite a scheduled trial. Track completed trials and repeat use instead of views or likes." },
    ],
    businessQuestions: [business ? "Who uses the product, who approves it, and who controls the budget?" : "Who feels the problem often enough to change their current behavior?", "What useful outcome could you deliver manually today?", "What does the current workaround cost in actual time, effort or money?", "What commitment would make a small trial worth running?", "Which delivery costs increase with each customer?"],
    constraints: [brief.constraints || "No additional constraints recorded. Capture limitations in the brief before choosing your build scope.", `Available capacity: ${brief.weeks} weeks × ${brief.hoursPerWeek} hours = ${brief.weeks * brief.hoursPerWeek} total founder/team hours. This is a planning limit, not a completion guarantee.`, "Start with tools you already have. Verify current free-tier limits before adopting hosting, forms, email, authentication or payment services; this planner does not provision them."],
  };
}
export type StartupPlan = ReturnType<typeof buildStartupPlan>;

export function calculateScenario(scenario: StartupScenario) {
  // Integer minor units avoid rounding a fractional break-even up by a customer.
  const minor = (value: number) => Math.round(value * 100);
  const price = minor(scenario.monthlyPrice);
  const variable = minor(scenario.variableCost);
  const fixed = minor(scenario.fixedMonthlyCost);
  const revenue = price * scenario.customers / 100;
  const monthlyCost = (fixed + variable * scenario.customers) / 100;
  const contribution = (price - variable) / 100;
  const cashAfterSetup = (minor(scenario.cashAvailable) - minor(scenario.oneTimeCost)) / 100;
  const monthlyNet = (price * scenario.customers - fixed - variable * scenario.customers) / 100;
  return {
    revenue, monthlyCost, monthlyNet, contribution, cashAfterSetup,
    breakEvenCustomers: price > variable ? Math.ceil(fixed / (price - variable)) : null,
    runwayMonths: cashAfterSetup >= 0 && monthlyNet < 0 ? cashAfterSetup / -monthlyNet : null,
  };
}
