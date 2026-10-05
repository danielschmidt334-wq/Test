import { PageHeader, Card, Badge } from "@/components/app-shell";
import { startOnboarding, toggleOnboardingTask } from "@/app/(protected)/actions";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { UserRole } from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.HR_ADMIN) redirect("/dashboard");

  const [templates, employees, instances] = await Promise.all([
    prisma.onboardingTemplate.findMany({ include: { jobRole: true } }),
    prisma.employee.findMany({ where: { active: true }, orderBy: { lastName: "asc" } }),
    prisma.onboardingInstance.findMany({
      include: {
        employee: true,
        template: true,
        progress: { include: { task: true } },
      },
      orderBy: { startedAt: "desc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Onboarding"
        description="Checklisten für Neueinstellungen in Produktion und Verwaltung."
      />
      <Card className="mb-6">
        <h3 className="mb-3 text-sm font-semibold">Onboarding starten</h3>
        <form action={startOnboarding} className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            Mitarbeitende/r
            <select name="employeeId" className="mt-1 block rounded border px-2 py-1">
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.lastName}, {e.firstName}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Vorlage
            <select name="templateId" className="mt-1 block rounded border px-2 py-1">
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
          >
            Starten
          </button>
        </form>
      </Card>
      <div className="space-y-4">
        {instances.map((inst) => {
          const done = inst.progress.filter((p) => p.done).length;
          const total = inst.progress.length;
          return (
            <Card key={inst.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">
                    {inst.employee.lastName}, {inst.employee.firstName}
                  </h3>
                  <p className="text-sm text-zinc-600">
                    {inst.template.name} · gestartet {formatDate(inst.startedAt)}
                  </p>
                </div>
                <Badge tone={done === total ? "ok" : "neutral"}>
                  {done}/{total} erledigt
                </Badge>
              </div>
              <ul className="mt-3 space-y-2">
                {inst.progress
                  .sort((a, b) => a.task.sortOrder - b.task.sortOrder)
                  .map((p) => (
                    <li key={p.id} className="flex items-center gap-2 text-sm">
                      <form action={toggleOnboardingTask}>
                        <input type="hidden" name="progressId" value={p.id} />
                        <input type="hidden" name="done" value={p.done ? "false" : "true"} />
                        <button
                          type="submit"
                          className={`h-5 w-5 rounded border ${p.done ? "bg-emerald-600 border-emerald-600" : "border-zinc-300"}`}
                          aria-label="Toggle"
                        />
                      </form>
                      <span className={p.done ? "line-through text-zinc-500" : ""}>
                        {p.task.title}
                      </span>
                    </li>
                  ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
