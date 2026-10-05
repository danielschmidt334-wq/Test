import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  pglite: PGlite;
};

function dataDir() {
  const raw = process.env.PGLITE_DATA_DIR ?? ".pglite";
  return path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw);
}

function createClient() {
  const pglite = globalForPrisma.pglite ?? new PGlite(dataDir());
  if (process.env.NODE_ENV !== "production") globalForPrisma.pglite = pglite;
  const adapter = new PrismaPGlite(pglite);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { createClient as createPrismaClient };
