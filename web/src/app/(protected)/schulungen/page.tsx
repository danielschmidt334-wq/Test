import { PageHeader, Card, Badge } from "@/components/app-shell";
import { createTraining } from "./actions";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { UserRole } from "@/generated/prisma/client";
import { redirect } from "next/navigation";

export default async function SchulungenPage() {
  const session = await getSession();
  if (
    !session ||
    (session.role !== UserRole.HR_ADMIN && session.role !== UserRole.QM_READONLY)
  ) {
    redirect("/dashboard");
  }

  const trainings = await prisma.training.findMany({ orderBy: { title: "asc" } });
  const isHr = session.role === UserRole.HR_ADMIN;

  return (
    <div>
      <PageHeader
        title="Schulungskatalog"
        description="Pflichtunterweisungen Arbeitsschutz, Datenschutz, Compliance, QMS/IATF."
      />
      {isHr ? (
        <Card className="mb-6">
          <h3 className="mb-3 text-sm font-semibold">Neue Schulung</h3>
          <form action={createTraining} className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Titel
              <input name="title" required className="mt-1 w-full rounded border px-2 py-1" />
            </label>
            <label className="text-sm">
              Kategorie
              <input
                name="category"
                required
                placeholder="Arbeitsschutz"
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </label>
            <label className="text-sm">
              Tags
              <input name="tags" className="mt-1 w-full rounded border px-2 py-1" />
            </label>
            <label className="text-sm">
              Intervall (Monate)
              <input
                name="intervalMonths"
                type="number"
                defaultValue={12}
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </label>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input name="mandatory" type="checkbox" defaultChecked />
              Pflichtschulung
            </label>
            <button
              type="submit"
              className="sm:col-span-2 w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            >
              Anlegen
            </button>
          </form>
        </Card>
      ) : null}
      <div className="grid gap-3">
        {trainings.map((t) => (
          <Card key={t.id}>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{t.title}</h3>
              {t.mandatory ? <Badge tone="warn">Pflicht</Badge> : null}
              <Badge>{t.category}</Badge>
            </div>
            <p className="mt-1 text-sm text-zinc-600">
              Intervall: {t.intervalMonths ?? "—"} Monate · Tags: {t.tags || "—"}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
