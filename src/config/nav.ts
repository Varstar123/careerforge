import {
  LayoutDashboard,
  MessagesSquare,
  Gauge,
  Briefcase,
  Rocket,
  FileText,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: "soon";
}

export const DASHBOARD_NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Interview Coach", href: "/dashboard/interview", icon: MessagesSquare },
  { label: "Resumes", href: "/dashboard/resumes", icon: FileText },
  { label: "Job Finder", href: "/dashboard/mentor", icon: Briefcase },
  { label: "Readiness", href: "/dashboard/readiness", icon: Gauge, badge: "soon" },
  { label: "Startup Builder", href: "/dashboard/startup", icon: Rocket, badge: "soon" },
];
