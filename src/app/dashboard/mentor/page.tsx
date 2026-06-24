import { Compass } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export const metadata = { title: "AI Career Mentor" };

export default function MentorPage() {
  return (
    <ComingSoon
      icon={Compass}
      title="AI Career Mentor"
      tagline="Guidance for every crossroad"
      description="A conversational mentor that knows your resume and goals — ask anything from “Am I ready for Google?” to “Should I focus on AI or Cloud?”"
      bullets={[
        "Resume-aware career advice",
        "Personalized next-skill recommendations",
        "Role & company fit guidance",
        "Resume improvement suggestions",
        "Career-path comparisons",
        "Always-on, grounded answers",
      ]}
    />
  );
}
