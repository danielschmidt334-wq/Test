import { AssignmentStatus } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import { computeAssignmentStatus } from "./utils";

export async function refreshOverdueStatuses() {
  const open = await prisma.trainingAssignment.findMany({
    where: {
      status: {
        in: [
          AssignmentStatus.OPEN,
          AssignmentStatus.IN_PROGRESS,
          AssignmentStatus.OVERDUE,
        ],
      },
    },
  });
  const now = new Date();
  for (const a of open) {
    const next = computeAssignmentStatus(a.status, a.dueDate, a.completedAt);
    if (next !== a.status) {
      await prisma.trainingAssignment.update({
        where: { id: a.id },
        data: { status: next },
      });
    }
  }
}

export async function listAssignmentsForScope(employeeIds: string[] | "all") {
  await refreshOverdueStatuses();
  return prisma.trainingAssignment.findMany({
    where: employeeIds === "all" ? {} : { employeeId: { in: employeeIds } },
    include: { training: true, employee: true },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });
}
