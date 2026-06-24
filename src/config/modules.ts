import {
  MessagesSquare,
  Gauge,
  Compass,
  Rocket,
  type LucideIcon,
} from "lucide-react";

export interface ModuleDef {
  key: string;
  title: string;
  tagline: string;
  description: string;
  href: string;
  icon: LucideIcon;
  status: "live" | "soon";
  accent: string; // tailwind text color token
}

export const MODULES: ModuleDef[] = [
  {
    key: "interview",
    title: "AI Interview Coach",
    tagline: "Practice that adapts to you",
    description:
      "Resume-aware mock interviews with instant scoring across correctness, communication and depth.",
    href: "/dashboard/interview",
    icon: MessagesSquare,
    status: "live",
    accent: "text-chart-1",
  },
  {
    key: "readiness",
    title: "Career Readiness Analyzer",
    tagline: "Know where you stand",
    description:
      "Benchmark your skills against your target role, surface gaps and get a personalized learning roadmap.",
    href: "/dashboard/readiness",
    icon: Gauge,
    status: "soon",
    accent: "text-chart-2",
  },
  {
    key: "mentor",
    title: "AI Career Mentor",
    tagline: "Answers for every crossroad",
    description:
      "Ask anything — “Am I ready for Google?”, “What should I learn next?” — and get grounded guidance.",
    href: "/dashboard/mentor",
    icon: Compass,
    status: "soon",
    accent: "text-chart-3",
  },
  {
    key: "startup",
    title: "AI Startup Builder",
    tagline: "From idea to roadmap",
    description:
      "Multi-agent workspace — business, finance, product, architecture and marketing — that turns ideas into plans.",
    href: "/dashboard/startup",
    icon: Rocket,
    status: "soon",
    accent: "text-chart-5",
  },
];
