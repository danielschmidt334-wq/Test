import { AssignmentStatus, UserRole } from "@/generated/prisma/client";
import { PageHeader, Card } from "@/components/app-shell";
import { runHrMaintenance } from "@/app/(protected)/hr-actions";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function BerichtePage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.HR_ADMIN) redirect("/dashboard");

  const [pendingEmails, byDept] = await Promise.all([
    prisma.emailOutbox.count({ where: { sentAt: null } }),
    prisma.trainingAssignment.groupBy({
    by: ["status"],
    _count: { _all: true },
    where: { status: AssignmentStatus.OVERDUE },
    }),
  ]);

  const deptRows = await prisma.$queryRaw<
    { department: string; overdue: number }[]
  >`
    SELECT e."department" as department, COUNT(*)::int as overdue
    FROM "TrainingAssignment" a
    JOIN "Employee" e ON e."id" = a."employeeId"
    WHERE a."status" = 'OVERDUE'
    GROUP BY e."department"
    ORDER BY overdue DESC
  `;

  return (
    <div>
      <PageHeader
        title="HR-Berichte"
        description="Steuerung, Erinnerungen und Auswertungen für Pflichtschulungen."
        actions={
          <form action={runHrMaintenance}>
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            >
              Wartung ausführen
            </button>
          </form>
        }
      />
      <p className="mb-4 text-sm text-zinc-600">
        Wartung: Erneuerungen, In-App-Erinnerungen und E-Mail-Outbox (Dev:{" "}
        <code>web/storage/emails/</code>). Ausstehende E-Mails: {pendingEmails}.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="text-sm font-semibold">Überfällig (gesamt)</h3>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {byDept.reduce((s, r) => s + r._count._all, 0)}
          </p>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold">Export</h3>
          <a
            href="/api/audit/export?format=csv"
            className="mt-2 inline-block rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            Vollständiger Audit-CSV
          </a>
        </Card>
      </div>
      <Card className="mt-6 overflow-x-auto">
        <h3 className="mb-3 text-sm font-semibold">Überfällig nach Abteilung</h3>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b text-zinc-500">
            <tr>
              <th className="py-2 pr-4">Abteilung</th>
              <th className="py-2">Anzahl</th>
            </tr>
          </thead>
          <tbody>
            {deptRows.map((r) => (
              <tr key={r.department} className="border-b border-zinc-100">
                <td className="py-2 pr-4">{r.department}</td>
                <td className="py-2 tabular-nums">{r.overdue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
