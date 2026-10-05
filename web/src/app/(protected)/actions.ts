"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Papa from "papaparse";
import { AssignmentStatus, UserRole } from "@/generated/prisma/client";
import { bumpCompetencyAfterTraining } from "@/lib/competency-sync";
import { writeAuditLog } from "@/lib/audit-log";
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

  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of parsed.data) {
    const email = (row.email ?? row.Email ?? row["E-Mail"] ?? "").trim().toLowerCase();
    if (!email) {
      skipped += 1;
      continue;
    }
    const firstName = (row.firstName ?? row.Vorname ?? "").trim();
    const lastName = (row.lastName ?? row.Nachname ?? "").trim();
    const department = (row.department ?? row.Abteilung ?? "Allgemein").trim();
    const managerEmail = (
      row.managerEmail ??
      row.ManagerEmail ??
      row.fkEmail ??
      row["FK E-Mail"] ??
      ""
    )
      .trim()
      .toLowerCase();

    let managerId: string | undefined;
    if (managerEmail) {
      const manager = await prisma.employee.findUnique({
        where: { email: managerEmail },
        select: { id: true },
      });
      managerId = manager?.id;
    }

    const existing = await prisma.employee.findUnique({ where: { email } });
    await prisma.employee.upsert({
      where: { email },
      create: {
        email,
        firstName,
        lastName,
        department,
        startDate: new Date(row.startDate ?? row.Eintritt ?? Date.now()),
        location: row.location ?? row.Standort ?? "Werk",
        managerId,
      },
      update: {
        firstName,
        lastName,
        department,
        ...(managerId ? { managerId } : {}),
      },
    });
    if (existing) updated += 1;
    else imported += 1;
  }

  revalidatePath("/mitarbeitende");
  redirect(
    `/mitarbeitende?imported=${imported}&updated=${updated}&skipped=${skipped}`,
  );
}

export async function importTrainingHistoryCsv(formData: FormData) {
  await requireHr();
  const file = formData.get("file");
  if (!(file instanceof File)) return;

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  let imported = 0;
  for (const row of parsed.data) {
    const email = (row.email ?? row.Email ?? row["E-Mail"] ?? "").trim().toLowerCase();
    const trainingTitle = (row.training ?? row.schulung ?? row.Schulung ?? row.title ?? "").trim();
    if (!email || !trainingTitle) continue;

    const employee = await prisma.employee.findUnique({ where: { email } });
    const training = await prisma.training.findFirst({
      where: { title: { equals: trainingTitle, mode: "insensitive" } },
    });
    if (!employee || !training) continue;

    const completedAt = new Date(row.completedAt ?? row.abgeschlossen ?? row.Datum ?? Date.now());
    let validUntil: Date | undefined;
    if (row.validUntil ?? row.gueltigBis) {
      validUntil = new Date(String(row.validUntil ?? row.gueltigBis));
    } else if (training.intervalMonths) {
      validUntil = new Date(completedAt);
      validUntil.setMonth(validUntil.getMonth() + training.intervalMonths);
    }

    await prisma.trainingAssignment.upsert({
      where: {
        trainingId_employeeId: { trainingId: training.id, employeeId: employee.id },
      },
      create: {
        trainingId: training.id,
        employeeId: employee.id,
        dueDate: completedAt,
        status: AssignmentStatus.COMPLETED,
        completedAt,
        validUntil,
      },
      update: {
        status: AssignmentStatus.COMPLETED,
        completedAt,
        validUntil,
      },
    });
    await bumpCompetencyAfterTraining(employee.id, training);
    imported += 1;
  }

  revalidatePath("/zuweisungen");
  revalidatePath("/dashboard");
  revalidatePath("/matrix");
  redirect(`/zuweisungen?historyImported=${imported}`);
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
  if (!training) return;
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

  if (session.email) {
    await writeAuditLog({
      actorEmail: session.email,
      action: "ASSIGNMENT_COMPLETE",
      entity: "TrainingAssignment",
      entityId: assignmentId,
      summary: training.title,
    });
  }

  await bumpCompetencyAfterTraining(assignment.employeeId, training);

  revalidatePath("/meine-schulungen");
  revalidatePath("/matrix");
  revalidatePath("/dashboard");
  revalidatePath("/protokoll");
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
