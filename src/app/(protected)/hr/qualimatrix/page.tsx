import { prisma } from "@/lib/db";
import { displayName } from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type GapRow = {
  userId: string;
  name: string;
  department: string;
  competency: string;
  target: number;
  actual: number;
  gap: number;
};

export default async function QualimatrixPage() {
  const users = await prisma.user.findMany({
    where: { status: "ACTIVE", jobProfileId: { not: null } },
    include: {
      department: true,
      jobProfile: {
        include: {
          competencies: { include: { competency: true } },
        },
      },
      competencies: true,
    },
  });

  const gaps: GapRow[] = [];
  for (const user of users) {
    if (!user.jobProfile) continue;
    for (const req of user.jobProfile.competencies) {
      const actual =
        user.competencies.find((c) => c.competencyId === req.competencyId)?.actualLevel ?? 0;
      if (actual < req.targetLevel) {
        gaps.push({
          userId: user.id,
          name: displayName(user.firstName, user.lastName),
          department: user.department?.name ?? "—",
          competency: req.competency.name,
          target: req.targetLevel,
          actual,
          gap: req.targetLevel - actual,
        });
      }
    }
  }

  gaps.sort((a, b) => b.gap - a.gap);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Qualimatrix — Lücken</h1>
        <p className="text-zinc-600">Soll (Job-Profil) vs. Ist (Kompetenz-Level pro Person)</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Offene Lücken ({gaps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {gaps.length === 0 ? (
            <p className="text-zinc-600">Keine Lücken — alle Profile erfüllt (Demo).</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mitarbeitende</TableHead>
                  <TableHead>Abteilung</TableHead>
                  <TableHead>Kompetenz</TableHead>
                  <TableHead>Soll</TableHead>
                  <TableHead>Ist</TableHead>
                  <TableHead>Lücke</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gaps.map((g) => (
                  <TableRow key={`${g.userId}-${g.competency}`}>
                    <TableCell>{g.name}</TableCell>
                    <TableCell>{g.department}</TableCell>
                    <TableCell>{g.competency}</TableCell>
                    <TableCell>{g.target}</TableCell>
                    <TableCell>{g.actual}</TableCell>
                    <TableCell>
                      <Badge className="bg-amber-100 text-amber-900">−{g.gap}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
