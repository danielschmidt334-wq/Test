import { prisma } from "@/lib/db";
import { displayName, formatDate, roleLabels } from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function StammdatenPage() {
  const users = await prisma.user.findMany({
    include: { department: true, manager: true, jobProfile: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Stammdaten</h1>
        <p className="text-zinc-600">Mitarbeitende, Abteilungen, Führungskraft-Zuordnung (Demo-Seed)</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Mitarbeitende ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Abteilung</TableHead>
                <TableHead>Job-Profil</TableHead>
                <TableHead>Führungskraft</TableHead>
                <TableHead>Eintritt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{displayName(u.firstName, u.lastName)}</TableCell>
                  <TableCell className="text-xs">{u.email}</TableCell>
                  <TableCell>{roleLabels[u.role]}</TableCell>
                  <TableCell>{u.department?.name ?? "—"}</TableCell>
                  <TableCell>{u.jobProfile?.name ?? "—"}</TableCell>
                  <TableCell>
                    {u.manager ? displayName(u.manager.firstName, u.manager.lastName) : "—"}
                  </TableCell>
                  <TableCell>{formatDate(u.entryDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
