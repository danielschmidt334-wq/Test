"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { saveUpload } from "@/lib/uploads";
import { completeAssignment, bulkAssignTraining, assignOnboarding } from "@/lib/training-service";

export async function completeTrainingWithProof(formData: FormData) {
  const session = await requireSession(["EMPLOYEE", "MANAGER", "HR_ADMIN"]);
  if (!session) throw new Error("Nicht autorisiert");

  const assignmentId = String(formData.get("assignmentId"));
  const file = formData.get("proof") as File | null;

  let proof;
  if (file && file.size > 0) {
    proof = await saveUpload(file, session.userId);
  }

  await completeAssignment(assignmentId, session.userId, proof);
  revalidatePath("/me/trainings");
}

export async function hrBulkAssign(formData: FormData) {
  const session = await requireSession(["HR_ADMIN"]);
  if (!session) throw new Error("Nicht autorisiert");

  const trainingId = String(formData.get("trainingId"));
  const dueDate = new Date(String(formData.get("dueDate")));
  const departmentId = String(formData.get("departmentId") || "");
  const allActive = formData.get("allActive") === "on";

  const { prisma } = await import("@/lib/db");
  const users = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
      role: { in: ["EMPLOYEE", "MANAGER"] },
      ...(allActive
        ? {}
        : departmentId
          ? { departmentId }
          : {}),
    },
    select: { id: true },
  });

  await bulkAssignTraining({
    trainingId,
    userIds: users.map((u) => u.id),
    dueDate,
    assignedById: session.userId,
  });

  revalidatePath("/hr/zuweisungen");
  revalidatePath("/hr");
}

export async function hrAssignOnboarding(formData: FormData) {
  const session = await requireSession(["HR_ADMIN"]);
  if (!session) throw new Error("Nicht autorisiert");

  const templateId = String(formData.get("templateId"));
  const userId = String(formData.get("userId"));
  await assignOnboarding(templateId, userId);
  revalidatePath("/hr/onboarding");
}

export async function markOnboardingStep(formData: FormData) {
  const session = await requireSession(["HR_ADMIN", "MANAGER", "EMPLOYEE"]);
  if (!session) throw new Error("Nicht autorisiert");

  const progressId = String(formData.get("progressId"));
  const { prisma } = await import("@/lib/db");
  const progress = await prisma.onboardingStepProgress.findUnique({
    where: { id: progressId },
    include: { instance: true },
  });
  if (!progress || progress.instance.userId !== session.userId) {
    if (session.role !== "HR_ADMIN") throw new Error("Nicht autorisiert");
  }

  await prisma.onboardingStepProgress.update({
    where: { id: progressId },
    data: { done: true, doneAt: new Date() },
  });
  revalidatePath("/me/onboarding");
  revalidatePath("/hr/onboarding");
}
