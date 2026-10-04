import Link from "next/link";
import { prisma } from "@/lib/db";
import { refreshOverdueStatuses } from "@/lib/training-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function HrDashboardPage() {
  await refreshOverdueStatuses();

  const [overdue, mandatoryCompleted, totalAssignments, users] = await Promise.all([
    prisma.trainingAssignment.count({ where: { status: "OVERDUE" } }),
    prisma.trainingAssignment.count({
      where: { status: "COMPLETED", training: { isMandatory: true } },
    }),
    prisma.trainingAssignment.count(),
    prisma.user.count({ where: { status: "ACTIVE", role: { in: ["EMPLOYEE", "MANAGER"] } } }),
  ]);

  const quota =
    totalAssignments > 0
      ? Math.round(((totalAssignments - overdue) / totalAssignments) * 100)
      : 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">HR-Dashboard</h1>
        <p className="text-zinc-600">Steuerung Pflichtschulungen &amp; IATF-Nachweise (Demo)</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-red-700">{overdue}</CardTitle>
            <p className="text-sm text-zinc-600">Überfällige Zuweisungen</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{quota}%</CardTitle>
            <p className="text-sm text-zinc-600">Erfüllungsquote (nicht überfällig)</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{mandatoryCompleted}</CardTitle>
            <p className="text-sm text-zinc-600">Abgeschlossene Pflichtschulungen</p>
          </CardHeader>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Export &amp; Aktionen</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/api/export/trainings">Schulungsstand CSV</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/hr/zuweisungen">Sammelzuweisung erstellen</Link>
          </Button>
          <p className="w-full text-xs text-zinc-500">
            Aktive Mitarbeitende im System: {users} (Seed-Demo ~10 Nutzer)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
