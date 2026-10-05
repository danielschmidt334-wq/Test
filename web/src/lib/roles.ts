import { UserRole } from "@/generated/prisma/client";

export function roleLabel(role: UserRole) {
  const map: Record<UserRole, string> = {
    EMPLOYEE: "Mitarbeitende/r",
    MANAGER: "Führungskraft",
    HR_ADMIN: "HR-Admin",
    QM_READONLY: "QM (Lesen)",
  };
  return map[role];
}
