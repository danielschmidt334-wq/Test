import { AssignmentStatus, UserRole } from "@/generated/prisma/client";
import { Badge, Card, PageHeader, Stat } from "@/components/app-shell";
import { getEmployeeScope, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assignmentStatusLabel, formatDate } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const scope = await getEmployeeScope(session);
  const employeeFilter = scope.all ? {} : { employeeId: { in: scope.employeeIds } };

  const [open, overdue, completed, recent] = await Promise.all([
    prisma.trainingAssignment.count({
      where: {
        ...employeeFilter,
        status: { in: [AssignmentStatus.OPEN, AssignmentStatus.IN_PROGRESS] },
      },
    }),
    prisma.trainingAssignment.count({
      where: { ...employeeFilter, status: AssignmentStatus.OVERDUE },
    }),
    prisma.trainingAssignment.count({
      where: { ...employeeFilter, status: AssignmentStatus.COMPLETED },
    }),
    prisma.trainingAssignment.findMany({
      where: employeeFilter,
      include: {
        training: true,
        employee: true,
      },
      orderBy: { dueDate: "asc" },
      take: 8,
    }),
  ]);

  const canAudit =
    session.role === UserRole.HR_ADMIN || session.role === UserRole.QM_READONLY;

  return (
    <div>
      <PageHeader
        title="Übersicht"
        description="Schulungsstand und offene Pflichtunterweisungen — IATF-taugliche Nachverfolgung."
        actions={
          canAudit ? (
            <Link
              href="/audit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            >
              Audit-Export
            </Link>
          ) : null
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Offen / in Bearbeitung" value={open} />
        <Stat label="Überfällig" value={overdue} hint="Sofort nachsteuern" />
        <Stat label="Abgeschlossen" value={completed} />
      </div>
      <Card className="mt-6 overflow-x-auto">
        <h3 className="mb-3 text-sm font-semibold text-zinc-800">
          Nächste Fälligkeiten
        </h3>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              {scope.all || session.role === UserRole.MANAGER ? (
                <th className="py-2 pr-4 font-medium">Person</th>
              ) : null}
              <th className="py-2 pr-4 font-medium">Schulung</th>
              <th className="py-2 pr-4 font-medium">Frist</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((row) => (
              <tr key={row.id} className="border-b border-zinc-100">
                {scope.all || session.role === UserRole.MANAGER ? (
                  <td className="py-2 pr-4">
                    {row.employee.lastName}, {row.employee.firstName}
                  </td>
                ) : null}
                <td className="py-2 pr-4">{row.training.title}</td>
                <td className="py-2 pr-4 tabular-nums">{formatDate(row.dueDate)}</td>
                <td className="py-2">
                  <Badge
                    tone={
                      row.status === AssignmentStatus.OVERDUE
                        ? "bad"
                        : row.status === AssignmentStatus.COMPLETED
                          ? "ok"
                          : "neutral"
                    }
                  >
                    {assignmentStatusLabel(row.status)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
