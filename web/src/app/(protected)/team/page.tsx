import { PageHeader, Card, Badge } from "@/components/app-shell";
import { getEmployeeScope, getSession } from "@/lib/auth";
import { listAssignmentsForScope } from "@/lib/assignments";
import { assignmentStatusLabel, formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";
import { UserRole } from "@/generated/prisma/client";
import { AssignmentStatus } from "@/generated/prisma/client";

export default async function TeamPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.MANAGER) redirect("/dashboard");

  const scope = await getEmployeeScope(session);
  const assignments = await listAssignmentsForScope(
    scope.all ? [] : scope.employeeIds,
  );

  return (
    <div>
      <PageHeader
        title="Mein Team"
        description="Schulungsstand der unterstellten Mitarbeitenden."
      />
      <Card className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="py-2 pr-4">Person</th>
              <th className="py-2 pr-4">Schulung</th>
              <th className="py-2 pr-4">Frist</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.id} className="border-b border-zinc-100">
                <td className="py-2 pr-4">
                  {a.employee.lastName}, {a.employee.firstName}
                </td>
                <td className="py-2 pr-4">{a.training.title}</td>
                <td className="py-2 pr-4 tabular-nums">{formatDate(a.dueDate)}</td>
                <td className="py-2">
                  <Badge
                    tone={
                      a.status === AssignmentStatus.OVERDUE
                        ? "bad"
                        : a.status === AssignmentStatus.COMPLETED
                          ? "ok"
                          : "neutral"
                    }
                  >
                    {assignmentStatusLabel(a.status)}
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
