import { Rocket } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export const metadata = { title: "AI Startup Builder" };

export default function StartupPage() {
  return (
    <ComingSoon
      icon={Rocket}
      title="AI Startup Builder"
      tagline="From idea to actionable roadmap"
      description="Enter an idea and watch a team of specialized AI agents collaborate — business, finance, product, architecture and marketing — to produce a complete plan."
      bullets={[
        "Business agent: market & competitor research",
        "Finance agent: costs, revenue & break-even",
        "Product agent: MVP features & roadmap",
        "Architect agent: system & database design",
        "Marketing agent: branding & acquisition",
        "Export the full plan to PDF",
      ]}
    />
  );
}
