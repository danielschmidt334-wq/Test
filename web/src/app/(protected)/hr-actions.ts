"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/audit-log";
import { flushEmailOutbox } from "@/lib/email-outbox";
import { renewExpiredMandatoryTrainings, syncDueNotifications } from "@/lib/hr-jobs";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireHrAdmin() {
  const session = await getSession();
  if (!session || session.role !== UserRole.HR_ADMIN) {
    throw new Error("Keine Berechtigung");
  }
  return session;
}

export async function runHrMaintenance() {
  const session = await requireHrAdmin();
  const renewed = await renewExpiredMandatoryTrainings();
  const notifications = await syncDueNotifications();
  const emailsSent = await flushEmailOutbox();
  await writeAuditLog({
    actorEmail: session.email,
    action: "HR_MAINTENANCE",
    entity: "System",
    summary: `${renewed} Erneuerungen, ${notifications} Mitteilungen, ${emailsSent} E-Mails (Outbox)`,
  });
  revalidatePath("/dashboard");
  revalidatePath("/berichte");
  revalidatePath("/benachrichtigungen");
}

export async function markNotificationRead(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Nicht angemeldet");
  const id = String(formData.get("id"));
  await prisma.appNotification.updateMany({
    where: { id, userId: session.userId },
    data: { readAt: new Date() },
  });
  revalidatePath("/benachrichtigungen");
}

export async function markAllNotificationsRead() {
  const session = await getSession();
  if (!session) throw new Error("Nicht angemeldet");
  await prisma.appNotification.updateMany({
    where: { userId: session.userId, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/benachrichtigungen");
}

export async function updateEmployee(formData: FormData) {
  const session = await requireHrAdmin();
  const id = String(formData.get("id"));
  const firstName = String(formData.get("firstName")).trim();
  const lastName = String(formData.get("lastName")).trim();
  const department = String(formData.get("department")).trim();
  const active = formData.get("active") === "on";

  await prisma.employee.update({
    where: { id },
    data: { firstName, lastName, department, active },
  });
  await writeAuditLog({
    actorEmail: session.email,
    action: "EMPLOYEE_UPDATE",
    entity: "Employee",
    entityId: id,
    summary: `${lastName}, ${firstName} (${department})${active ? "" : " — deaktiviert"}`,
  });
  revalidatePath("/mitarbeitende");
}

export async function createTrainingEvent(formData: FormData) {
  const session = await requireHrAdmin();
  const trainingId = String(formData.get("trainingId"));
  const startsAt = new Date(String(formData.get("startsAt")));
  const location = String(formData.get("location") ?? "Werk — Schulungsraum");
  const capacityRaw = formData.get("capacity");
  const capacity = capacityRaw ? Number(capacityRaw) : null;

  const event = await prisma.trainingEvent.create({
    data: { trainingId, startsAt, location, capacity },
    include: { training: true },
  });
  await writeAuditLog({
    actorEmail: session.email,
    action: "EVENT_CREATE",
    entity: "TrainingEvent",
    entityId: event.id,
    summary: `${event.training.title} am ${startsAt.toLocaleDateString("de-DE")}`,
  });
  revalidatePath("/termine");
}

export async function enrollInEvent(formData: FormData) {
  const session = await getSession();
  if (!session?.employeeId) throw new Error("Nicht angemeldet");
  const eventId = String(formData.get("eventId"));

  const event = await prisma.trainingEvent.findUnique({
    where: { id: eventId },
    include: { _count: { select: { enrollments: true } } },
  });
  if (!event) return;
  if (event.capacity && event._count.enrollments >= event.capacity) {
    throw new Error("Termin ausgebucht");
  }

  await prisma.trainingEventEnrollment.upsert({
    where: {
      eventId_employeeId: { eventId, employeeId: session.employeeId },
    },
    create: { eventId, employeeId: session.employeeId },
    update: {},
  });
  revalidatePath("/termine");
}
