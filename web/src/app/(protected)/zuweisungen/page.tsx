import { PageHeader, Card, Badge } from "@/components/app-shell";
import { bulkAssignTraining, importTrainingHistoryCsv } from "@/app/(protected)/actions";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { UserRole } from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import { assignmentStatusLabel, formatDate } from "@/lib/utils";
import { listAssignmentsForScope } from "@/lib/assignments";

export default async function ZuweisungenPage({
  searchParams,
}: {
  searchParams: Promise<{ historyImported?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== UserRole.HR_ADMIN) redirect("/dashboard");
  const params = await searchParams;

  const [trainings, departments, assignments] = await Promise.all([
    prisma.training.findMany({ orderBy: { title: "asc" } }),
    prisma.employee.findMany({
      distinct: ["department"],
      select: { department: true },
    }),
    listAssignmentsForScope("all"),
  ]);

  const defaultDue = new Date();
  defaultDue.setMonth(defaultDue.getMonth() + 1);
  const dueStr = defaultDue.toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader
        title="Zuweisungen"
        description="Sammelzuweisung für Jahresunterweisungen (~80 MA)."
      />
      {params.historyImported != null ? (
        <Card className="mb-4 border-emerald-200 bg-emerald-50 text-sm text-emerald-900">
          Historien-Import: {params.historyImported} Abschlüsse übernommen.
        </Card>
      ) : null}
      <Card className="mb-6">
        <h3 className="mb-3 text-sm font-semibold">Excel-Migration: Schulungshistorie (CSV)</h3>
        <p className="mb-2 text-xs text-zinc-600">
          Spalten: <code>E-Mail</code>, <code>Schulung</code> (Titel), optional{" "}
          <code>abgeschlossen</code>, <code>gueltigBis</code>
        </p>
        <form action={importTrainingHistoryCsv} className="flex flex-wrap items-end gap-3">
          <input type="file" name="file" accept=".csv" required className="text-sm" />
          <button type="submit" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            Historie importieren
          </button>
          <a href="/samples/historie-schulungen.csv" className="text-sm text-zinc-600 underline">
            Beispiel-CSV
          </a>
        </form>
      </Card>
      <Card className="mb-6">
        <h3 className="mb-3 text-sm font-semibold">Sammelzuweisung</h3>
        <form action={bulkAssignTraining} className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            Schulung
            <select name="trainingId" required className="mt-1 block rounded border px-2 py-1">
              {trainings.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Bereich
            <select name="scope" className="mt-1 block rounded border px-2 py-1">
              <option value="all">Alle aktiven MA</option>
              {departments.map((d) => (
                <option key={d.department} value={d.department}>
                  Abteilung {d.department}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Frist
            <input
              type="date"
              name="dueDate"
              defaultValue={dueStr}
              required
              className="mt-1 block rounded border px-2 py-1"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
          >
            Zuweisen
          </button>
        </form>
      </Card>
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
            {assignments.slice(0, 50).map((a) => (
              <tr key={a.id} className="border-b border-zinc-100">
                <td className="py-2 pr-4">
                  {a.employee.lastName}, {a.employee.firstName}
                </td>
                <td className="py-2 pr-4">{a.training.title}</td>
                <td className="py-2 pr-4 tabular-nums">{formatDate(a.dueDate)}</td>
                <td className="py-2">
                  <Badge tone={a.status === "OVERDUE" ? "bad" : "neutral"}>
                    {assignmentStatusLabel(a.status)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {assignments.length > 50 ? (
          <p className="mt-2 text-xs text-zinc-500">
            Zeigt 50 von {assignments.length} Zuweisungen — Export über Audit.
          </p>
        ) : null}
      </Card>
    </div>
  );
}
