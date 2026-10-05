import { prisma } from "./prisma";

export async function writeAuditLog(input: {
  actorEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  summary: string;
}) {
  await prisma.auditLog.create({ data: input });
}
