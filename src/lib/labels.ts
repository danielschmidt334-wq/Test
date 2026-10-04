import type {
  AssignmentStatus,
  TrainingCategory,
  UserRole,
} from "@prisma/client";

export const roleLabels: Record<UserRole, string> = {
  HR_ADMIN: "HR-Administration",
  MANAGER: "Führungskraft",
  EMPLOYEE: "Mitarbeitende",
};

export const categoryLabels: Record<TrainingCategory, string> = {
  WORK_SAFETY: "Arbeitssicherheit",
  DATA_PROTECTION: "Datenschutz",
  COMPLIANCE: "Compliance",
  QMS: "QMS / IATF",
  OTHER: "Sonstige",
};

export const statusLabels: Record<AssignmentStatus, string> = {
  OPEN: "Offen",
  IN_PROGRESS: "In Bearbeitung",
  COMPLETED: "Abgeschlossen",
  OVERDUE: "Überfällig",
  EXEMPT: "Befreit",
};

export function displayName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`;
}

export function formatDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("de-DE");
}
