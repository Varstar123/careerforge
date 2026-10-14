# CareerForge AI

**Live demo:** https://careerforge-one-murex.vercel.app/

> Your AI-powered career mentor **and** co-founder — personalized interview
> coaching, career-readiness analysis, AI mentoring, and startup planning in one
> premium platform.

The platform includes an AI Interview Coach, role-specific Readiness Analyzer,
Job & Internship Finder, and a guided Startup Builder.

---

## ✨ What's built

### AI Interview Coach (end-to-end)
- **Resume intelligence** — upload a PDF / DOCX / TXT; text is extracted and an
  LLM structures it into skills, experience, projects, education and suggested
  roles.
- **Personalized interviews** — resume-aware technical / behavioral / HR
  questions generated for your target role and seniority.
- **Instant AI scoring** — every answer is graded on correctness, communication
  and depth, with concrete strengths, improvements and a model answer.
- **Results & progress** — overall score, per-question breakdown, an AI coaching
  summary, and a score-trend chart across interviews.

### Platform foundation
- Premium, animated **landing page** (Linear / Vercel / Stripe aesthetic).
- **Dashboard** shell with sidebar, responsive layout, dark/light theme.
- **Clerk** authentication (+ webhook user sync) and **Prisma/PostgreSQL** data layer.
- Custom **shadcn-style UI kit**, design tokens (OKLCH), and Framer Motion.

### Startup Builder
- A free guided worksheet for validating demand and planning an MVP. It makes
  no AI API calls, needs no additional service keys, and does not provision
  third-party infrastructure.
- Plans adapt to product type, customer type, founder skills, stage, goals,
  capacity, selected capabilities, and account/payment/data requirements.
- Includes customer interview questions, suggested validation experiments,
  MVP acceptance checks, technical components and starting data records,
  first-customer experiments, and an editable task checklist.
- An optional cost worksheet calculates break-even and runway using only
  user-entered assumptions. It does not estimate revenue or verify demand.
- Projects, evidence notes, and cost assumptions are saved in this browser,
  scoped to the signed-in account. They do not sync across devices and are
  removed if browser site data is cleared. Keep a JSON workspace backup.
- Download a Markdown plan, import/export JSON backups, or use Print / save PDF
  to export the full worksheet. Import merges new IDs without overwriting an
  existing project. Unreadable data is preserved until the user chooses to clear it.
- No database schema change is required for this module.

Run `npm run test:startup` for offline validation, planning, calculation,
backup, export and server-rendering regression checks.

---

## 🧱 Tech stack

| Layer    | Choice |
| -------- | ------ |
| Framework | Next.js 16 (App Router, React 19, Turbopack, React Compiler) |
| Language  | TypeScript |
| Styling   | Tailwind CSS v4, custom shadcn-style components, Framer Motion |
| Auth      | Clerk |
| Database  | PostgreSQL + Prisma 6 |
| AI        | OpenAI (provider isolated in `src/lib/openai.ts`) |
| Parsing   | `unpdf` (PDF), `mammoth` (DOCX) |

---

## 🚀 Getting started

### 1. Install
```bash
npm install
```

### 2. Configure environment
Copy the example and fill in your keys:
```bash
cp .env.example .env.local
```
You'll need:
- **`DATABASE_URL`** — a PostgreSQL connection string (local, or Neon/Supabase/Railway).
  Also put this in **`.env`** (the Prisma CLI reads `.env`, Next reads `.env.local`).
- **Clerk keys** — from the [Clerk dashboard](https://dashboard.clerk.com).
- **`OPENAI_API_KEY`** — from the [OpenAI dashboard](https://platform.openai.com).
- The Job Finder uses Greenhouse's public Job Board API and needs no job API
  credentials. It searches participating Greenhouse employers configured in
  `src/lib/jobs/sources.ts`; this does not cover every employer or job board.

> The app boots without keys (the public landing page renders), but auth, the
> dashboard, and AI features require the keys above.

### 3. Set up the database
```bash
npm run db:migrate      # create tables from prisma/schema.prisma
# or, against an existing DB without migrations:
# npm run db:push
```

### 4. Run
```bash
npm run dev
```
Visit http://localhost:3000.

### Deployment region

`vercel.json` places server functions in Singapore (`sin1`), close to the
project's configured Supabase database in AWS `ap-southeast-1`. Before deploying,
confirm the production database uses that same region. If the database moves,
update the function region to match it. Static assets continue to use Vercel's
global CDN. Region changes take effect on a new deployment.

### 5. (Optional) Clerk → DB sync webhook
In the Clerk dashboard add a webhook to `/api/webhooks/clerk` for the
`user.created`, `user.updated`, `user.deleted` events and set
`CLERK_WEBHOOK_SIGNING_SECRET`. (Users are also synced lazily on first request,
so this is optional for local dev.)

---

## 📜 Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:push` | Push schema without migrations |
| `npm run db:studio` | Open Prisma Studio |

---

## 🗂️ Project structure

```
src/
  app/
    (auth)/                 # Clerk sign-in / sign-up
    dashboard/              # Authenticated app
      interview/            # AI Interview Coach (new, runner, results, list)
      resumes/              # Resume management
      readiness|mentor|startup/   # Readiness, jobs and guided startup planning
    api/
      resume/upload/        # Parse + store a resume
      interview/            # create / [id]/answer / [id]/complete
      webhooks/clerk/       # User sync
    page.tsx                # Landing page
  components/
    ui/                     # shadcn-style primitives
    landing/                # Marketing sections
    dashboard/              # Shell, nav, stat cards, charts
    interview/              # Uploader, wizard, runner, evaluation, results
  lib/
    ai/                     # parse-resume / generate-questions / evaluate-answer / summarize
    openai.ts  prompts.ts  types.ts  resume.ts
    auth.ts  prisma.ts  queries.ts  actions.ts
  config/                   # nav + module definitions
prisma/schema.prisma
```

---

## 🧭 Possible next steps
- Optional, source-backed startup research, clearly separate from the free worksheets.
- Account-based workspace sync for users who need access across devices.
- Reusable resume and interview improvement plans.

---

Built with Next.js, Prisma, Clerk & OpenAI.
