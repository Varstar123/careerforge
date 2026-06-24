import Link from "next/link";
import {
  Plus,
  Trophy,
  Target,
  ListChecks,
  TrendingUp,
  ArrowUpRight,
  MessagesSquare,
} from "lucide-react";
import { getOrCreateUser } from "@/lib/auth";
import {
  getDashboardStats,
  getInterviewsForUser,
  getPrimaryResume,
} from "@/lib/queries";
import { MODULES } from "@/config/modules";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { ScoreTrend } from "@/components/dashboard/score-trend";
import { EmptyState } from "@/components/dashboard/empty-state";
import { InterviewListItem } from "@/components/interview/interview-list-item";

export const metadata = { title: "Overview" };

export default async function DashboardPage() {
  const user = await getOrCreateUser();
  if (!user) return null;

  const [stats, interviews, resume] = await Promise.all([
    getDashboardStats(user.id),
    getInterviewsForUser(user.id),
    getPrimaryResume(user.id),
  ]);

  const recent = interviews.slice(0, 5);
  const firstName = user.firstName ?? "there";

  return (
    <div className="mx-auto max-w-6xl">
      {/* Greeting */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {resume
              ? "Ready for another round? Your progress is looking good."
              : "Upload your resume to start your first personalized interview."}
          </p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/dashboard/interview/new">
            <Plus className="size-4" /> New interview
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Interviews"
          value={stats.total}
          icon={ListChecks}
          hint={`${stats.completedCount} completed`}
        />
        <StatCard
          label="Average score"
          value={stats.avg != null ? `${stats.avg}` : "—"}
          icon={Target}
          hint="across completed interviews"
        />
        <StatCard
          label="Best score"
          value={stats.best != null ? `${stats.best}` : "—"}
          icon={Trophy}
          hint="your personal best"
        />
        <StatCard
          label="Improvement"
          value={
            stats.trend != null
              ? `${stats.trend >= 0 ? "+" : ""}${stats.trend}`
              : "—"
          }
          icon={TrendingUp}
          hint="first vs latest"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Trend + recent */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Score trend</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.series.length >= 2 ? (
                <ScoreTrend data={stats.series} />
              ) : (
                <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                  Complete at least two interviews to see your trend.
                </div>
              )}
            </CardContent>
          </Card>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Recent interviews</h2>
              {interviews.length > 0 && (
                <Link
                  href="/dashboard/interview"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  View all <ArrowUpRight className="size-3.5" />
                </Link>
              )}
            </div>
            {recent.length > 0 ? (
              <div className="space-y-3">
                {recent.map((i) => (
                  <InterviewListItem
                    key={i.id}
                    item={{
                      id: i.id,
                      title: i.title,
                      targetRole: i.targetRole,
                      status: i.status,
                      overallScore: i.overallScore,
                      createdAt: i.createdAt,
                      questionCount: i._count.questions,
                      resumeName: i.resume?.fileName,
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={MessagesSquare}
                title="No interviews yet"
                description="Start your first AI mock interview tailored to your resume and target role."
                action={
                  <Button asChild>
                    <Link href="/dashboard/interview/new">
                      <Plus className="size-4" /> Start an interview
                    </Link>
                  </Button>
                }
              />
            )}
          </div>
        </div>

        {/* Modules quick access */}
        <div className="space-y-3">
          <h2 className="font-semibold">Explore modules</h2>
          {MODULES.map((m) => (
            <Link
              key={m.key}
              href={m.href}
              className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <span className={`mt-0.5 ${m.accent}`}>
                <m.icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{m.title}</p>
                  {m.status === "soon" && (
                    <Badge variant="secondary" className="text-[10px]">
                      Soon
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {m.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
