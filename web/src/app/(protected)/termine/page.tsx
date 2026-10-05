import { PageHeader, Card, Badge } from "@/components/app-shell";
import { createTrainingEvent, enrollInEvent } from "@/app/(protected)/hr-actions";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { UserRole } from "@/generated/prisma/client";
import { redirect } from "next/navigation";

export default async function TerminePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const isHr = session.role === UserRole.HR_ADMIN;
  const now = new Date();

  const [trainings, events] = await Promise.all([
    isHr ? prisma.training.findMany({ orderBy: { title: "asc" } }) : [],
    prisma.trainingEvent.findMany({
      where: { startsAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } },
      include: {
        training: true,
        ...(session.employeeId
          ? { enrollments: { where: { employeeId: session.employeeId } } }
          : {}),
        _count: { select: { enrollments: true } },
      },
      orderBy: { startsAt: "asc" },
      take: 30,
    }),
  ]);

  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() + 14);
  const defaultLocal = defaultStart.toISOString().slice(0, 16);

  return (
    <div>
      <PageHeader
        title="Präsenztermine"
        description="Planung für Unterweisungen vor Ort — Anmeldung für Mitarbeitende."
      />
      {isHr ? (
        <Card className="mb-6">
          <h3 className="mb-3 text-sm font-semibold">Neuer Termin</h3>
          <form action={createTrainingEvent} className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
              Schulung
              <select name="trainingId" required className="mt-1 block w-full rounded border px-2 py-1">
                {trainings.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Beginn
              <input
                type="datetime-local"
                name="startsAt"
                required
                defaultValue={defaultLocal}
                className="mt-1 block w-full rounded border px-2 py-1"
              />
            </label>
            <label className="text-sm">
              Ort
              <input
                name="location"
                defaultValue="Werk — Schulungsraum A"
                className="mt-1 block w-full rounded border px-2 py-1"
              />
            </label>
            <label className="text-sm">
              Plätze (optional)
              <input
                type="number"
                name="capacity"
                min={1}
                className="mt-1 block w-full rounded border px-2 py-1"
              />
            </label>
            <button
              type="submit"
              className="sm:col-span-2 w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            >
              Termin anlegen
            </button>
          </form>
        </Card>
      ) : null}
      <div className="grid gap-3">
        {events.map((ev) => {
          const enrolled = Boolean(
            session.employeeId &&
              "enrollments" in ev &&
              ev.enrollments.length > 0,
          );
          const full =
            ev.capacity != null && ev._count.enrollments >= ev.capacity;
          return (
            <Card key={ev.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{ev.training.title}</h3>
                  <p className="text-sm text-zinc-600">
                    {formatDate(ev.startsAt)} · {ev.location}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {ev._count.enrollments}
                    {ev.capacity ? ` / ${ev.capacity}` : ""} Anmeldungen
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {enrolled ? <Badge tone="ok">Angemeldet</Badge> : null}
                  {full ? <Badge tone="warn">Ausgebucht</Badge> : null}
                  {session.employeeId && !enrolled && !full ? (
                    <form action={enrollInEvent}>
                      <input type="hidden" name="eventId" value={ev.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
                      >
                        Anmelden
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}
        {events.length === 0 ? (
          <Card className="text-sm text-zinc-600">Keine Termine geplant.</Card>
        ) : null}
      </div>
    </div>
  );
}
