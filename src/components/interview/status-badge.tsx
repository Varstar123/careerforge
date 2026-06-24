import { Badge } from "@/components/ui/badge";
import type { InterviewStatus } from "@prisma/client";

export function StatusBadge({ status }: { status: InterviewStatus }) {
  switch (status) {
    case "COMPLETED":
      return <Badge variant="success">Completed</Badge>;
    case "IN_PROGRESS":
      return <Badge variant="warning">In progress</Badge>;
    default:
      return <Badge variant="secondary">Draft</Badge>;
  }
}
