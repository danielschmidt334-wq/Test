import { prisma } from "@/lib/db";
import type { AssignmentStatus } from "@prisma/client";

export async function refreshOverdueStatuses() {
  const now = new Date();
  await prisma.trainingAssignment.updateMany({
    where: {
      status: { in: ["OPEN", "IN_PROGRESS"] },
      dueDate: { lt: now },
    },
    data: { status: "OVERDUE" },
  });
}

export function computeCompletionValidUntil(trainingIntervalMonths: number | null, completedAt: Date) {
  if (!trainingIntervalMonths) return null;
  const d = new Date(completedAt);
  d.setMonth(d.getMonth() + trainingIntervalMonths);
  return d;
}

export async function completeAssignment(
  assignmentId: string,
  userId: string,
  proof?: { fileName: string; filePath: string; mimeType?: string }
) {
  const assignment = await prisma.trainingAssignment.findFirst({
    where: { id: assignmentId, userId },
    include: { training: true },
  });
  if (!assignment) throw new Error("Zuweisung nicht gefunden");

  const completedAt = new Date();
  const validUntil = computeCompletionValidUntil(assignment.training.intervalMonths, completedAt);

  await prisma.trainingAssignment.update({
    where: { id: assignmentId },
    data: {
      status: "COMPLETED" satisfies AssignmentStatus,
      completedAt,
      validUntil,
    },
  });

  if (proof) {
    await prisma.trainingProof.upsert({
      where: { assignmentId },
      create: { assignmentId, ...proof },
      update: { ...proof, uploadedAt: new Date() },
    });
  }
}

export async function bulkAssignTraining(input: {
  trainingId: string;
  userIds: string[];
  dueDate: Date;
  assignedById: string;
}) {
  const { trainingId, userIds, dueDate, assignedById } = input;
  for (const userId of userIds) {
    const exists = await prisma.trainingAssignment.findFirst({
      where: { userId, trainingId, status: { not: "COMPLETED" } },
    });
    if (exists) continue;
    await prisma.trainingAssignment.create({
      data: {
        userId,
        trainingId,
        dueDate,
        assignedById,
        status: "OPEN",
      },
    });
  }
}

export async function assignOnboarding(templateId: string, userId: string) {
  const template = await prisma.onboardingTemplate.findUnique({
    where: { id: templateId },
    include: { steps: true },
  });
  if (!template) throw new Error("Vorlage nicht gefunden");

  const instance = await prisma.onboardingInstance.create({
    data: { userId, templateId },
  });

  await prisma.onboardingStepProgress.createMany({
    data: template.steps.map((step) => ({
      instanceId: instance.id,
      stepId: step.id,
      done: false,
    })),
  });

  return instance.id;
}
