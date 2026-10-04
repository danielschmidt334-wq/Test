import { prisma } from "@/lib/db";
import { hrBulkAssign } from "@/lib/actions/training";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { displayName, formatDate, statusLabels } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ZuweisungenPage() {
  const [trainings, departments, recent] = await Promise.all([
    prisma.training.findMany({ orderBy: { title: "asc" } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.trainingAssignment.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { user: true, training: true },
    }),
  ]);

  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 30);
  const dueDefault = defaultDue.toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Zuweisungen</h1>
        <p className="text-zinc-600">Sammelzuweisung für Jahresunterweisungen (HR)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sammelzuweisung</CardTitle>
          <CardDescription>Weist dieselbe Schulung an viele Mitarbeitende zu</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={hrBulkAssign} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="trainingId">Schulung</Label>
              <select
                id="trainingId"
                name="trainingId"
                required
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm"
              >
                {trainings.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Frist</Label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                required
                defaultValue={dueDefault}
                className="flex h-10 w-full rounded-md border border-zinc-200 px-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departmentId">Abteilung (optional)</Label>
              <select
                id="departmentId"
                name="departmentId"
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm"
              >
                <option value="">— alle aktiven MA —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="allActive" />
                Alle aktiven Mitarbeitenden (ignoriert Abteilung)
              </label>
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Zuweisen</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Letzte Zuweisungen</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mitarbeitende</TableHead>
                <TableHead>Schulung</TableHead>
                <TableHead>Frist</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{displayName(a.user.firstName, a.user.lastName)}</TableCell>
                  <TableCell>{a.training.title}</TableCell>
                  <TableCell>{formatDate(a.dueDate)}</TableCell>
                  <TableCell>
                    <Badge status={a.status}>{statusLabels[a.status]}</Badge>
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
