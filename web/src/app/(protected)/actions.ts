"use server";

import { revalidatePath } from "next/cache";
import Papa from "papaparse";
import { AssignmentStatus, UserRole } from "@/generated/prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireHr() {
  const session = await getSession();
  if (!session || session.role !== UserRole.HR_ADMIN) {
    throw new Error("Keine Berechtigung");
  }
  return session;
}

export async function importEmployeesCsv(formData: FormData) {
  await requireHr();
  const file = formData.get("file");
  if (!(file instanceof File)) return;

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  for (const row of parsed.data) {
    const email = (row.email ?? row.Email ?? "").trim().toLowerCase();
    if (!email) continue;
    const firstName = row.firstName ?? row.Vorname ?? "";
    const lastName = row.lastName ?? row.Nachname ?? "";
    const department = row.department ?? row.Abteilung ?? "Allgemein";
    await prisma.employee.upsert({
      where: { email },
      create: {
        email,
        firstName,
        lastName,
        department,
        startDate: new Date(row.startDate ?? row.Eintritt ?? Date.now()),
        location: row.location ?? row.Standort ?? "Werk",
      },
      update: {
        firstName,
        lastName,
        department,
      },
    });
  }

  revalidatePath("/mitarbeitende");
}

export async function bulkAssignTraining(formData: FormData) {
  await requireHr();
  const trainingId = String(formData.get("trainingId"));
  const scope = String(formData.get("scope"));
  const dueDate = new Date(String(formData.get("dueDate")));

  const training = await prisma.training.findUnique({ where: { id: trainingId } });
  if (!training) return;

  let employees = await prisma.employee.findMany({ where: { active: true } });
  if (scope !== "all") {
    employees = employees.filter((e) => e.department === scope);
  }

  for (const emp of employees) {
    await prisma.trainingAssignment.upsert({
      where: {
        trainingId_employeeId: { trainingId, employeeId: emp.id },
      },
      create: {
        trainingId,
        employeeId: emp.id,
        dueDate,
        status: AssignmentStatus.OPEN,
      },
      update: { dueDate, status: AssignmentStatus.OPEN },
    });
  }

  revalidatePath("/zuweisungen");
  revalidatePath("/dashboard");
}

export async function completeAssignment(formData: FormData) {
  const session = await getSession();
  if (!session?.employeeId) throw new Error("Nicht angemeldet");

  const assignmentId = String(formData.get("assignmentId"));
  const assignment = await prisma.trainingAssignment.findUnique({
    where: { id: assignmentId },
  });
  if (!assignment) return;

  const canEdit =
    session.role === UserRole.HR_ADMIN ||
    assignment.employeeId === session.employeeId;
  if (!canEdit) throw new Error("Keine Berechtigung");

  const validUntilRaw = formData.get("validUntil");
  const training = await prisma.training.findUnique({
    where: { id: assignment.trainingId },
  });
  let valid: Date | undefined;
  if (validUntilRaw) {
    valid = new Date(String(validUntilRaw));
  } else if (training?.intervalMonths) {
    valid = new Date();
    valid.setMonth(valid.getMonth() + training.intervalMonths);
  }

  await prisma.trainingAssignment.update({
    where: { id: assignmentId },
    data: {
      status: AssignmentStatus.COMPLETED,
      completedAt: new Date(),
      validUntil: valid,
    },
  });

  revalidatePath("/meine-schulungen");
  revalidatePath("/dashboard");
}

export async function attachProofMetadata(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Nicht angemeldet");

  const assignmentId = String(formData.get("assignmentId"));
  const proofFileName = String(formData.get("proofFileName"));
  const proofStoredName = String(formData.get("proofStoredName"));

  const assignment = await prisma.trainingAssignment.findUnique({
    where: { id: assignmentId },
  });
  if (!assignment) return;

  const canEdit =
    session.role === UserRole.HR_ADMIN ||
    assignment.employeeId === session.employeeId;
  if (!canEdit) throw new Error("Keine Berechtigung");

  await prisma.trainingAssignment.update({
    where: { id: assignmentId },
    data: { proofFileName, proofStoredName },
  });

  revalidatePath("/meine-schulungen");
}

export async function startOnboarding(formData: FormData) {
  await requireHr();
  const employeeId = String(formData.get("employeeId"));
  const templateId = String(formData.get("templateId"));

  const template = await prisma.onboardingTemplate.findUnique({
    where: { id: templateId },
    include: { tasks: true },
  });
  if (!template) return;

  const instance = await prisma.onboardingInstance.create({
    data: { employeeId, templateId },
  });

  for (const task of template.tasks) {
    await prisma.onboardingTaskProgress.create({
      data: { instanceId: instance.id, taskId: task.id },
    });
  }

  revalidatePath("/onboarding");
}

export async function toggleOnboardingTask(formData: FormData) {
  await requireHr();
  const progressId = String(formData.get("progressId"));
  const done = formData.get("done") === "true";

  await prisma.onboardingTaskProgress.update({
    where: { id: progressId },
    data: { done, doneAt: done ? new Date() : null },
  });

  revalidatePath("/onboarding");
}

export async function logoutAction() {
  const { destroySession } = await import("@/lib/auth");
  await destroySession();
}
