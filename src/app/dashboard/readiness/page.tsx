import { Gauge } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export const metadata = { title: "Career Readiness Analyzer" };

export default function ReadinessPage() {
  return (
    <ComingSoon
      icon={Gauge}
      title="Career Readiness Analyzer"
      tagline="Know exactly where you stand"
      description="We'll benchmark your skills, resume quality and project portfolio against your target role, then surface the gaps that matter most."
      bullets={[
        "Skill-gap analysis vs. target role",
        "Resume quality score & fixes",
        "Recommended certifications",
        "Personalized learning roadmap",
        "Project ideas to boost employability",
        "Industry-readiness scoring",
      ]}
    />
  );
}
