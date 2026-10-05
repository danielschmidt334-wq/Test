import Link from "next/link";
import type { SessionUser } from "@/lib/auth";
import { roleLabel } from "@/lib/roles";

const navForRole = (session: SessionUser) => {
  const common = [
    { href: "/dashboard", label: "Übersicht" },
    { href: "/benachrichtigungen", label: "Mitteilungen" },
  ];
  if (session.role === "EMPLOYEE") {
    return [
      ...common,
      { href: "/meine-schulungen", label: "Meine Schulungen" },
      { href: "/termine", label: "Termine" },
    ];
  }
  if (session.role === "MANAGER") {
    return [
      ...common,
      { href: "/team", label: "Mein Team" },
      { href: "/meine-schulungen", label: "Meine Schulungen" },
      { href: "/termine", label: "Termine" },
      { href: "/matrix", label: "Qualimatrix" },
    ];
  }
  if (session.role === "QM_READONLY") {
    return [
      ...common,
      { href: "/schulungen", label: "Schulungen" },
      { href: "/matrix", label: "Qualimatrix" },
      { href: "/audit", label: "Audit-Export" },
      { href: "/protokoll", label: "Protokoll" },
    ];
  }
  return [
    ...common,
    { href: "/berichte", label: "Berichte" },
    { href: "/mitarbeitende", label: "Mitarbeitende" },
    { href: "/schulungen", label: "Schulungen" },
    { href: "/termine", label: "Termine" },
    { href: "/zuweisungen", label: "Zuweisungen" },
    { href: "/matrix", label: "Qualimatrix" },
    { href: "/onboarding", label: "Onboarding" },
    { href: "/audit", label: "Audit-Export" },
    { href: "/protokoll", label: "Protokoll" },
  ];
};

export function AppShell({
  session,
  children,
}: {
  session: SessionUser;
  children: React.ReactNode;
}) {
  const nav = navForRole(session);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Knauf Industries · MVP
            </p>
            <h1 className="text-lg font-semibold text-zinc-900">
              Qualimatrix Schulungen
            </h1>
          </div>
          <div className="text-right text-sm">
            <p className="font-medium">{session.email}</p>
            <p className="text-zinc-500">{roleLabel(session.role)}</p>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            >
              {item.label}
            </Link>
          ))}
          <form action="/api/auth/logout" method="post" className="ml-auto">
            <button
              type="submit"
              className="rounded-md px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100"
            >
              Abmelden
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-zinc-600">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-zinc-200 bg-white p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </Card>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "ok" | "warn" | "bad";
  children: React.ReactNode;
}) {
  const tones = {
    neutral: "bg-zinc-100 text-zinc-700",
    ok: "bg-emerald-50 text-emerald-800",
    warn: "bg-amber-50 text-amber-900",
    bad: "bg-red-50 text-red-800",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
