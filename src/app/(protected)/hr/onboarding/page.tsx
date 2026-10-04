import { prisma } from "@/lib/db";
import { hrAssignOnboarding } from "@/lib/actions/training";
import { displayName, formatDate } from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function HrOnboardingPage() {
  const [templates, users, instances] = await Promise.all([
    prisma.onboardingTemplate.findMany({ include: { jobProfile: true } }),
    prisma.user.findMany({
      where: { status: "ACTIVE", role: "EMPLOYEE" },
      orderBy: { lastName: "asc" },
    }),
    prisma.onboardingInstance.findMany({
      include: {
        user: true,
        template: true,
        stepProgress: true,
      },
      orderBy: { startedAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Onboarding</h1>
        <p className="text-zinc-600">Vorlagen zuweisen und Fortschritt verfolgen</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vorlage zuweisen</CardTitle>
          <CardDescription>Startet Checkliste inkl. verknüpfter Schulungen</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={hrAssignOnboarding} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="templateId">Vorlage</Label>
              <select
                id="templateId"
                name="templateId"
                required
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.jobProfile ? ` (${t.jobProfile.name})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId">Mitarbeitende</Label>
              <select
                id="userId"
                name="userId"
                required
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {displayName(u.firstName, u.lastName)}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="md:col-span-2 w-fit">
              Onboarding starten
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Laufende Onboardings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mitarbeitende</TableHead>
                <TableHead>Vorlage</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>Fortschritt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instances.map((i) => {
                const done = i.stepProgress.filter((s) => s.done).length;
                const total = i.stepProgress.length;
                return (
                  <TableRow key={i.id}>
                    <TableCell>{displayName(i.user.firstName, i.user.lastName)}</TableCell>
                    <TableCell>{i.template.name}</TableCell>
                    <TableCell>{formatDate(i.startedAt)}</TableCell>
                    <TableCell>
                      {total ? Math.round((done / total) * 100) : 0}% ({done}/{total})
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
