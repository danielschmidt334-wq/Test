import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

function databaseUrl() {
  const raw = process.env.DATABASE_URL?.replace(/^file:/, "") ?? "dev.db";
  if (path.isAbsolute(raw)) return `file:${raw}`;
  return `file:${path.join(/* turbopackIgnore: true */ process.cwd(), raw)}`;
}

function createClient() {
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl() });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { createClient as createPrismaClient };
