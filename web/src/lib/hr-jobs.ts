import { AssignmentStatus } from "@/generated/prisma/client";
import { queueEmail } from "./email-outbox";
import { prisma } from "./prisma";

/** Abgelaufene Pflichtschulungen erneut öffnen (gleiche Zuweisung, neues Fristdatum). */
export async function renewExpiredMandatoryTrainings() {
  const now = new Date();
  const expired = await prisma.trainingAssignment.findMany({
    where: {
      status: AssignmentStatus.COMPLETED,
      validUntil: { lt: now },
      training: { mandatory: true },
    },
    include: { training: true },
  });

  let renewed = 0;
  for (const row of expired) {
    const due = new Date();
    due.setDate(due.getDate() + 30);
    await prisma.trainingAssignment.update({
      where: { id: row.id },
      data: {
        status: AssignmentStatus.OPEN,
        completedAt: null,
        validUntil: null,
        proofFileName: null,
        proofStoredName: null,
        dueDate: due,
        notes: row.notes
          ? `${row.notes}\n[Auto] Erneuerung nach Ablauf ${row.validUntil?.toISOString().slice(0, 10)}`
          : `[Auto] Erneuerung nach Ablauf ${row.validUntil?.toISOString().slice(0, 10)}`,
      },
    });
    renewed += 1;
  }
  return renewed;
}

/** In-App-Hinweise für überfällige und bald fällige Schulungen (14 Tage). */
export async function syncDueNotifications() {
  const now = new Date();
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 14);

  const assignments = await prisma.trainingAssignment.findMany({
    where: {
      status: {
        in: [
          AssignmentStatus.OPEN,
          AssignmentStatus.IN_PROGRESS,
          AssignmentStatus.OVERDUE,
        ],
      },
      OR: [{ dueDate: { lte: horizon } }, { status: AssignmentStatus.OVERDUE }],
    },
    include: { training: true, employee: { include: { user: true } } },
  });

  let created = 0;
  for (const a of assignments) {
    const userId = a.employee.user?.id;
    if (!userId) continue;

    const overdue = a.status === AssignmentStatus.OVERDUE || a.dueDate < now;
    const title = overdue ? "Überfällige Schulung" : "Schulung bald fällig";
    const message = `${a.training.title} — Frist ${a.dueDate.toLocaleDateString("de-DE")}`;
    const link = "/meine-schulungen";

    const existing = await prisma.appNotification.findFirst({
      where: {
        userId,
        title,
        message,
        readAt: null,
        createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      },
    });
    if (existing) continue;

    await prisma.appNotification.create({
      data: { userId, title, message, link },
    });
    if (a.employee.email) {
      await queueEmail(
        a.employee.email,
        `[Knauf Schulungen] ${title}`,
        `${message}\n\nBitte im Tool unter „Meine Schulungen“ abschließen.`,
      );
    }
    created += 1;

    if (overdue && a.employee.managerId) {
      const manager = await prisma.employee.findUnique({
        where: { id: a.employee.managerId },
        include: { user: true },
      });
      if (manager?.user?.id) {
        await prisma.appNotification.create({
          data: {
            userId: manager.user.id,
            title: "Team: überfällige Schulung",
            message: `${a.employee.lastName}, ${a.employee.firstName}: ${a.training.title}`,
            link: "/team",
          },
        });
        created += 1;
      }
    }
  }
  return created;
}
