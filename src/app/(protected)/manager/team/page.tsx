import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { refreshOverdueStatuses } from "@/lib/training-service";
import { displayName, formatDate, statusLabels } from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ManagerTeamPage() {
  const session = await getSession();
  if (!session) return null;
  if (session.role !== "MANAGER" && session.role !== "HR_ADMIN") {
    return <p className="text-red-600">Kein Zugriff.</p>;
  }

  await refreshOverdueStatuses();

  const managerId = session.role === "MANAGER" ? session.userId : undefined;
  const team = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
      ...(managerId ? { managerId } : { role: { in: ["EMPLOYEE", "MANAGER"] } }),
    },
    include: {
      department: true,
      assignments: {
        where: { status: { in: ["OPEN", "OVERDUE", "IN_PROGRESS"] } },
        include: { training: true },
        orderBy: { dueDate: "asc" },
        take: 3,
      },
    },
    orderBy: { lastName: "asc" },
    take: session.role === "MANAGER" ? 50 : 15,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Team-Ansicht</h1>
        <p className="text-zinc-600">Offene und überfällige Schulungen Ihrer Mitarbeitenden</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Mitarbeitende ({team.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Abteilung</TableHead>
                <TableHead>Offene Schulungen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{displayName(member.firstName, member.lastName)}</TableCell>
                  <TableCell>{member.department?.name ?? "—"}</TableCell>
                  <TableCell>
                    {member.assignments.length === 0 ? (
                      <span className="text-zinc-500">Keine offenen</span>
                    ) : (
                      <ul className="space-y-1 text-sm">
                        {member.assignments.map((a) => (
                          <li key={a.id} className="flex flex-wrap items-center gap-2">
                            <span>{a.training.title}</span>
                            <Badge status={a.status}>{statusLabels[a.status]}</Badge>
                            <span className="text-xs text-zinc-500">bis {formatDate(a.dueDate)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
