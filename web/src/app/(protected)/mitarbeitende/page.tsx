import { PageHeader, Card } from "@/components/app-shell";
import { importEmployeesCsv } from "@/app/(protected)/actions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { UserRole } from "@/generated/prisma/client";

export default async function MitarbeitendePage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string; updated?: string; skipped?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== UserRole.HR_ADMIN) redirect("/dashboard");

  const params = await searchParams;
  const importMsg =
    params.imported != null
      ? `${params.imported} neu, ${params.updated ?? "0"} aktualisiert${
          params.skipped && Number(params.skipped) > 0
            ? `, ${params.skipped} Zeilen übersprungen`
            : ""
        }`
      : null;

  const employees = await prisma.employee.findMany({
    include: { jobRole: true, manager: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Mitarbeitende"
        description="Stammdaten für ~80 MA — CSV aus Excel (Spalten: E-Mail, Vorname, Nachname, Abteilung; optional FK E-Mail, Eintritt, Standort)."
        actions={
          <a
            href="/samples/mitarbeitende.csv"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            Beispiel-CSV
          </a>
        }
      />
      {importMsg ? (
        <Card className="mb-4 border-emerald-200 bg-emerald-50 text-sm text-emerald-900">
          Import abgeschlossen: {importMsg}.
        </Card>
      ) : null}
      <Card className="mb-6">
        <p className="mb-3 text-xs text-zinc-600">
          Unterstützte Spaltennamen (DE/EN): <code>email</code> / <code>E-Mail</code>,{" "}
          <code>Vorname</code>, <code>Nachname</code>, <code>Abteilung</code>, optional{" "}
          <code>FK E-Mail</code> / <code>managerEmail</code>.
        </p>
        <form action={importEmployeesCsv} className="flex flex-wrap items-end gap-3">
          <label className="text-sm font-medium">
            CSV-Import
            <input
              type="file"
              name="file"
              accept=".csv,text/csv"
              required
              className="mt-1 block text-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
          >
            Importieren
          </button>
        </form>
      </Card>
      <Card className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Abteilung</th>
              <th className="py-2 pr-4">Rolle</th>
              <th className="py-2 pr-4">FK</th>
              <th className="py-2">Eintritt</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-b border-zinc-100">
                <td className="py-2 pr-4">
                  {e.lastName}, {e.firstName}
                  <div className="text-xs text-zinc-500">{e.email}</div>
                </td>
                <td className="py-2 pr-4">{e.department}</td>
                <td className="py-2 pr-4">{e.jobRole?.name ?? "—"}</td>
                <td className="py-2 pr-4">
                  {e.manager
                    ? `${e.manager.lastName}, ${e.manager.firstName}`
                    : "—"}
                </td>
                <td className="py-2 tabular-nums">{formatDate(e.startDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
