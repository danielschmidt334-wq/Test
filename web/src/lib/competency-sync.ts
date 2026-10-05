import { prisma } from "./prisma";

const CATEGORY_COMPETENCY: Record<string, string> = {
  Arbeitsschutz: "Arbeitssicherheit",
  QMS: "Qualitätsbewusstsein",
  Datenschutz: "Qualitätsbewusstsein",
};

/** Nach Schulungsabschluss Ist-Level in der Qualimatrix anheben (max. Soll der Rolle). */
export async function bumpCompetencyAfterTraining(
  employeeId: string,
  training: { competencyId: string | null; category: string; title: string },
) {
  let competencyId = training.competencyId;
  if (!competencyId) {
    const name = CATEGORY_COMPETENCY[training.category];
    if (!name) return;
    const comp = await prisma.competency.findFirst({ where: { name } });
    competencyId = comp?.id ?? null;
  }
  if (!competencyId) return;

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      jobRole: { include: { competencyReqs: true } },
    },
  });
  if (!employee) return;

  const req = employee.jobRole?.competencyReqs.find(
    (r) => r.competencyId === competencyId,
  );
  const target = req?.targetLevel ?? 2;

  const existing = await prisma.employeeCompetency.findUnique({
    where: { employeeId_competencyId: { employeeId, competencyId } },
  });

  const nextLevel = Math.min(target, (existing?.actualLevel ?? 0) + 1);

  await prisma.employeeCompetency.upsert({
    where: { employeeId_competencyId: { employeeId, competencyId } },
    create: {
      employeeId,
      competencyId,
      actualLevel: nextLevel,
      confirmedAt: new Date(),
    },
    update: {
      actualLevel: nextLevel,
      confirmedAt: new Date(),
    },
  });
}
