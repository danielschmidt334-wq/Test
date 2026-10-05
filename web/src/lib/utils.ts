import { AssignmentStatus } from "@/generated/prisma/client";

export function assignmentStatusLabel(status: AssignmentStatus) {
  const map: Record<AssignmentStatus, string> = {
    OPEN: "Offen",
    IN_PROGRESS: "In Bearbeitung",
    COMPLETED: "Abgeschlossen",
    OVERDUE: "Überfällig",
    EXEMPT: "Befreit",
  };
  return map[status];
}

export function computeAssignmentStatus(
  status: AssignmentStatus,
  dueDate: Date,
  completedAt: Date | null,
): AssignmentStatus {
  if (status === AssignmentStatus.EXEMPT || status === AssignmentStatus.COMPLETED) {
    return status;
  }
  if (completedAt) return AssignmentStatus.COMPLETED;
  if (dueDate < new Date()) return AssignmentStatus.OVERDUE;
  if (status === AssignmentStatus.IN_PROGRESS) return AssignmentStatus.IN_PROGRESS;
  return AssignmentStatus.OPEN;
}

export function formatDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("de-DE");
}

export function csvEscape(value: string | number | null | undefined) {
  const s = value == null ? "" : String(value);
  if (s.includes('"') || s.includes(";") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
