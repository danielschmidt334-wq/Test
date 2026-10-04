import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { markOnboardingStep } from "@/lib/actions/training";

export const dynamic = "force-dynamic";

export default async function MyOnboardingPage() {
  const session = await getSession();
  if (!session) return null;

  const instance = await prisma.onboardingInstance.findFirst({
    where: { userId: session.userId },
    include: {
      template: true,
      stepProgress: { include: { step: true }, orderBy: { step: { sortOrder: "asc" } } },
    },
    orderBy: { startedAt: "desc" },
  });

  if (!instance) {
    return <p className="text-zinc-600">Kein aktives Onboarding zugewiesen.</p>;
  }

  const done = instance.stepProgress.filter((s) => s.done).length;
  const total = instance.stepProgress.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mein Onboarding</h1>
        <p className="text-zinc-600">
          {instance.template.name} · Fortschritt {pct}% ({done}/{total})
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Checkliste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {instance.stepProgress.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{p.step.title}</p>
                <p className="text-xs text-zinc-500">
                  {p.done ? `Erledigt am ${formatDate(p.doneAt)}` : "Offen"}
                </p>
              </div>
              {!p.done ? (
                <form action={markOnboardingStep}>
                  <input type="hidden" name="progressId" value={p.id} />
                  <Button size="sm" type="submit">
                    Als erledigt markieren
                  </Button>
                </form>
              ) : (
                <span className="text-sm text-emerald-700">✓</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
