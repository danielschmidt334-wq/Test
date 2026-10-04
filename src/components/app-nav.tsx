"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionPayload } from "@/lib/auth";
import { roleLabels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavItem = { href: string; label: string; roles?: SessionPayload["role"][] };

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Übersicht" },
  { href: "/me/trainings", label: "Meine Schulungen", roles: ["EMPLOYEE", "MANAGER", "HR_ADMIN"] },
  { href: "/manager/team", label: "Mein Team", roles: ["MANAGER", "HR_ADMIN"] },
  { href: "/hr", label: "HR-Dashboard", roles: ["HR_ADMIN"] },
  { href: "/hr/stammdaten", label: "Stammdaten", roles: ["HR_ADMIN"] },
  { href: "/hr/katalog", label: "Schulungskatalog", roles: ["HR_ADMIN"] },
  { href: "/hr/zuweisungen", label: "Zuweisungen", roles: ["HR_ADMIN"] },
  { href: "/hr/qualimatrix", label: "Qualimatrix", roles: ["HR_ADMIN"] },
  { href: "/hr/onboarding", label: "Onboarding", roles: ["HR_ADMIN"] },
];

export function AppNav({ session }: { session: SessionPayload }) {
  const pathname = usePathname();
  const visible = navItems.filter(
    (item) => !item.roles || item.roles.includes(session.role)
  );

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Knauf Industries — Schulungen & Qualimatrix
          </p>
          <p className="text-sm text-zinc-700">
            {session.name} · {roleLabels[session.role]}
          </p>
        </div>
        <nav className="flex flex-wrap gap-1">
          {visible.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/api/auth/logout" method="post">
          <Button type="submit" variant="outline" size="sm">
            Abmelden
          </Button>
        </form>
      </div>
    </header>
  );
}
