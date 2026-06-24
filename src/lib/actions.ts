"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function deleteResume(resumeId: string) {
  const user = await requireUser();
  await prisma.resume.deleteMany({
    where: { id: resumeId, userId: user.id },
  });
  revalidatePath("/dashboard/resumes");
  revalidatePath("/dashboard");
}

export async function setPrimaryResume(resumeId: string) {
  const user = await requireUser();
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId: user.id },
  });
  if (!resume) return;
  await prisma.$transaction([
    prisma.resume.updateMany({
      where: { userId: user.id },
      data: { isPrimary: false },
    }),
    prisma.resume.update({
      where: { id: resumeId },
      data: { isPrimary: true },
    }),
  ]);
  revalidatePath("/dashboard/resumes");
}

export async function deleteInterview(interviewId: string) {
  const user = await requireUser();
  await prisma.interview.deleteMany({
    where: { id: interviewId, userId: user.id },
  });
  revalidatePath("/dashboard/interview");
  revalidatePath("/dashboard");
}
