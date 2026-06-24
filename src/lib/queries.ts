import { prisma } from "@/lib/prisma";

export async function getInterviewsForUser(userId: string) {
  return prisma.interview.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      resume: { select: { fileName: true } },
      _count: { select: { questions: true } },
    },
  });
}

export async function getDashboardStats(userId: string) {
  const interviews = await prisma.interview.findMany({
    where: { userId },
    select: {
      status: true,
      overallScore: true,
      createdAt: true,
      completedAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const completed = interviews.filter(
    (i) => i.status === "COMPLETED" && i.overallScore != null,
  );
  const scores = completed.map((i) => i.overallScore as number);
  const avg = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;
  const best = scores.length ? Math.max(...scores) : null;

  // Improvement = latest score vs first score
  const trend =
    scores.length >= 2 ? scores[scores.length - 1] - scores[0] : null;

  return {
    total: interviews.length,
    completedCount: completed.length,
    avg,
    best,
    trend,
    series: completed.map((i, idx) => ({
      name: `#${idx + 1}`,
      score: i.overallScore as number,
    })),
  };
}

export async function getPrimaryResume(userId: string) {
  return prisma.resume.findFirst({
    where: { userId },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
  });
}

export async function getResumesForUser(userId: string) {
  return prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { interviews: true } } },
  });
}

export async function getInterviewDetail(interviewId: string, userId: string) {
  return prisma.interview.findFirst({
    where: { id: interviewId, userId },
    include: {
      resume: { select: { fileName: true } },
      questions: {
        orderBy: { order: "asc" },
        include: { answer: { include: { evaluation: true } } },
      },
    },
  });
}
