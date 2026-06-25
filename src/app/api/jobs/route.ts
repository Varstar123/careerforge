import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { getUserJobs } from "@/lib/jobs/service";
import { handleApiError } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);

    const jobs = await getUserJobs(user.id, {
      jobType: searchParams.get("type") ?? undefined,
      remoteOnly: searchParams.get("remote") === "true",
      location: searchParams.get("location") ?? undefined,
    });

    return NextResponse.json({ jobs });
  } catch (err) {
    return handleApiError(err);
  }
}
