import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { refreshOverdueStatuses } from "@/lib/training-service";
import { roleLabels } from "@/lib/labels";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  await refreshOverdueStatuses();

  if (session.role === "HR_ADMIN") {
    const [totalUsers, overdue, completed, openCount] = await Promise.all([
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.trainingAssignment.count({ where: { status: "OVERDUE" } }),
      prisma.trainingAssignment.count({ where: { status: "COMPLETED" } }),
      prisma.trainingAssignment.count({ where: { status: "OPEN" } }),
    ]);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Willkommen, {session.name}</h1>
          <p className="text-zinc-600">{roleLabels[session.role]} — zentraler Überblick</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Aktive Mitarbeitende" value={totalUsers} />
          <StatCard title="Offene Zuweisungen" value={openCount} />
          <StatCard title="Überfällig" value={overdue} highlight={overdue > 0} />
          <StatCard title="Abgeschlossen (gesamt)" value={completed} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Schnellzugriff</CardTitle>
            <CardDescription>Typische HR-Aufgaben in der Demo</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/hr/zuweisungen">Sammelzuweisung</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/hr/qualimatrix">Qualimatrix-Lücken</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/api/export/trainings">CSV-Export Schulungen</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session.role === "MANAGER") {
    const team = await prisma.user.findMany({
      where: { managerId: session.userId, status: "ACTIVE" },
      select: { id: true },
    });
    const teamIds = team.map((t) => t.id);
    const overdue =
      teamIds.length === 0
        ? 0
        : await prisma.trainingAssignment.count({
            where: { userId: { in: teamIds }, status: "OVERDUE" },
          });

    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Team-Übersicht</h1>
        <p className="text-zinc-600">
          {team.length} direkte Mitarbeitende · {overdue} überfällige Schulungen im Team
        </p>
        <Button asChild>
          <Link href="/manager/team">Zur Team-Ansicht</Link>
        </Button>
      </div>
    );
  }

  const myOpen = await prisma.trainingAssignment.count({
    where: { userId: session.userId, status: { in: ["OPEN", "OVERDUE", "IN_PROGRESS"] } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Hallo, {session.name}</h1>
      <p className="text-zinc-600">Sie haben {myOpen} offene oder überfällige Schulungen.</p>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/me/trainings">Meine Schulungen</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/me/onboarding">Onboarding</Link>
        </Button>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  highlight,
}: {
  title: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-red-300" : undefined}>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
