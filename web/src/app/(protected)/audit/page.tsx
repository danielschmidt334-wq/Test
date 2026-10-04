import { PageHeader, Card } from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { UserRole } from "@/generated/prisma/client";
import { redirect } from "next/navigation";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; trainingId?: string }>;
}) {
  const session = await getSession();
  if (
    !session ||
    (session.role !== UserRole.HR_ADMIN && session.role !== UserRole.QM_READONLY)
  ) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const [departments, trainings] = await Promise.all([
    prisma.employee.findMany({ distinct: ["department"], select: { department: true } }),
    prisma.training.findMany({ orderBy: { title: "asc" } }),
  ]);

  const qs = new URLSearchParams();
  if (params.department) qs.set("department", params.department);
  if (params.trainingId) qs.set("trainingId", params.trainingId);
  const filter = qs.toString();
  const prefix = filter ? `/api/audit/export?${filter}&` : "/api/audit/export?";

  return (
    <div>
      <PageHeader
        title="Audit-Export"
        description="Gefilterter Schulungsstand und Nachweis-Paket für IATF-/Kundenaudit."
      />
      <Card>
        <form className="grid gap-3 sm:grid-cols-2" method="get">
          <label className="text-sm">
            Abteilung
            <select
              name="department"
              defaultValue={params.department ?? ""}
              className="mt-1 block w-full rounded border px-2 py-1"
            >
              <option value="">Alle</option>
              {departments.map((d) => (
                <option key={d.department} value={d.department}>
                  {d.department}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Schulung
            <select
              name="trainingId"
              defaultValue={params.trainingId ?? ""}
              className="mt-1 block w-full rounded border px-2 py-1"
            >
              <option value="">Alle</option>
              {trainings.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="sm:col-span-2 w-fit rounded-lg border border-zinc-300 px-4 py-2 text-sm"
          >
            Filter anwenden
          </button>
        </form>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`${prefix}format=csv`}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
          >
            CSV herunterladen
          </a>
          <a
            href={`${prefix}format=zip`}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium"
          >
            ZIP mit Nachweisen
          </a>
        </div>
      </Card>
    </div>
  );
}
