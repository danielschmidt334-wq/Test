import { prisma } from "@/lib/db";
import { categoryLabels } from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function KatalogPage() {
  const trainings = await prisma.training.findMany({ orderBy: { title: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Schulungskatalog</h1>
        <p className="text-zinc-600">Pflichtflag, Intervall und Kategorie (IATF-relevant)</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Schulungen ({trainings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Pflicht</TableHead>
                <TableHead>Intervall (Monate)</TableHead>
                <TableHead>Dauer (Min.)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainings.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{t.title}</p>
                      {t.description ? (
                        <p className="text-xs text-zinc-500">{t.description}</p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>{categoryLabels[t.category]}</TableCell>
                  <TableCell>{t.isMandatory ? <Badge>Pflicht</Badge> : "Optional"}</TableCell>
                  <TableCell>{t.intervalMonths ?? "—"}</TableCell>
                  <TableCell>{t.durationMinutes ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
