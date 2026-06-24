import Link from "next/link";
import { Logo } from "@/components/logo";

interface FooterLink {
  label: string;
  href: string;
}

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Interview Coach", href: "/dashboard/interview" },
      { label: "Readiness", href: "/dashboard/readiness" },
      { label: "Mentor", href: "/dashboard/mentor" },
      { label: "Startup Builder", href: "/dashboard/startup" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Modules", href: "/#modules" },
      { label: "How it works", href: "/#how" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Create account", href: "/sign-up" },
      { label: "Sign in", href: "/sign-in" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">
              Your AI-powered career mentor and co-founder. Prepare, grow, and
              build with confidence.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <FooterCol key={col.title} title={col.title} links={col.links} />
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} CareerForge AI. All rights reserved.</p>
          <p>Built with Next.js, Prisma &amp; OpenAI.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
