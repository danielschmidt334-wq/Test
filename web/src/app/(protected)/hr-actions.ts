"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/audit-log";
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
  await writeAuditLog({
    actorEmail: session.email,
    action: "HR_MAINTENANCE",
    entity: "System",
    summary: `${renewed} Erneuerungen, ${notifications} Benachrichtigungen erzeugt`,
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
