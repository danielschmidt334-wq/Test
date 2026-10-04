import { PageHeader, Card, Badge } from "@/components/app-shell";
import { getEmployeeScope, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UserRole } from "@/generated/prisma/client";

export default async function MatrixPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === UserRole.EMPLOYEE) redirect("/meine-schulungen");

  const scope = await getEmployeeScope(session);
  const employees = await prisma.employee.findMany({
    where: {
      active: true,
      ...(scope.all ? {} : { id: { in: scope.employeeIds } }),
      jobRoleId: { not: null },
    },
    include: {
      jobRole: {
        include: {
          competencyReqs: { include: { competency: true } },
        },
      },
      competencies: { include: { competency: true } },
    },
    orderBy: { lastName: "asc" },
  });

  type Gap = {
    employee: string;
    role: string;
    competency: string;
    target: number;
    actual: number;
  };
  const gaps: Gap[] = [];

  for (const emp of employees) {
    if (!emp.jobRole) continue;
    for (const req of emp.jobRole.competencyReqs) {
      const ist = emp.competencies.find((c) => c.competencyId === req.competencyId);
      const actual = ist?.actualLevel ?? 0;
      if (actual < req.targetLevel) {
        gaps.push({
          employee: `${emp.lastName}, ${emp.firstName}`,
          role: emp.jobRole.name,
          competency: req.competency.name,
          target: req.targetLevel,
          actual,
        });
      }
    }
  }

  return (
    <div>
      <PageHeader
        title="Qualimatrix"
        description="Soll/Ist-Kompetenzen pro Rolle — Lücken für IATF 7.2 sichtbar."
      />
      <Card className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="py-2 pr-4">Mitarbeitende/r</th>
              <th className="py-2 pr-4">Rolle</th>
              <th className="py-2 pr-4">Kompetenz</th>
              <th className="py-2 pr-4">Soll</th>
              <th className="py-2">Ist</th>
            </tr>
          </thead>
          <tbody>
            {gaps.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-zinc-500">
                  Keine Lücken in der aktuellen Auswahl.
                </td>
              </tr>
            ) : (
              gaps.map((g, i) => (
                <tr key={i} className="border-b border-zinc-100">
                  <td className="py-2 pr-4">{g.employee}</td>
                  <td className="py-2 pr-4">{g.role}</td>
                  <td className="py-2 pr-4">{g.competency}</td>
                  <td className="py-2 pr-4 tabular-nums">{g.target}</td>
                  <td className="py-2">
                    <Badge tone="warn">{g.actual}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
