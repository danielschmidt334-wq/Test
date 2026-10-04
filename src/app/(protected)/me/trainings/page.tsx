import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { refreshOverdueStatuses } from "@/lib/training-service";
import { categoryLabels, formatDate, statusLabels } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { completeTrainingWithProof } from "@/lib/actions/training";

export const dynamic = "force-dynamic";

export default async function MyTrainingsPage() {
  const session = await getSession();
  if (!session) return null;
  await refreshOverdueStatuses();

  const assignments = await prisma.trainingAssignment.findMany({
    where: { userId: session.userId },
    include: { training: true, proof: true },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Meine Schulungen</h1>
        <p className="text-zinc-600">Pflichtunterweisungen, Fristen und Nachweise</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zuweisungen</CardTitle>
          <CardDescription>{assignments.length} Einträge</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Schulung</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Frist</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Nachweis</TableHead>
                <TableHead>Aktion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.training.title}</TableCell>
                  <TableCell>{categoryLabels[a.training.category]}</TableCell>
                  <TableCell>{formatDate(a.dueDate)}</TableCell>
                  <TableCell>
                    <Badge status={a.status}>{statusLabels[a.status]}</Badge>
                  </TableCell>
                  <TableCell>{a.proof ? a.proof.fileName : "—"}</TableCell>
                  <TableCell>
                    {a.status !== "COMPLETED" && a.status !== "EXEMPT" ? (
                      <form action={completeTrainingWithProof} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input type="hidden" name="assignmentId" value={a.id} />
                        <input
                          name="proof"
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="max-w-[180px] text-xs"
                        />
                        <Button type="submit" size="sm">
                          Abschließen
                        </Button>
                      </form>
                    ) : (
                      <span className="text-xs text-zinc-500">
                        {a.validUntil ? `Gültig bis ${formatDate(a.validUntil)}` : "Erledigt"}
                      </span>
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
