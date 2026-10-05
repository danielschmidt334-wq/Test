import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";
import { PrismaClient } from "@/generated/prisma/client";
import { resolvePgliteDataDir } from "./pglite-data-dir";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  pglite: PGlite;
  pgliteReady: Promise<void> | undefined;
};

function createPglite(): PGlite {
  const dataDir = resolvePgliteDataDir();
  return new PGlite({ dataDir });
}

function createClient() {
  const pglite = globalForPrisma.pglite ?? createPglite();
  if (!globalForPrisma.pglite) {
    globalForPrisma.pglite = pglite;
    globalForPrisma.pgliteReady = pglite.waitReady;
  }
  const adapter = new PrismaPGlite(pglite);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function ensurePrismaReady() {
  if (globalForPrisma.pgliteReady) {
    await globalForPrisma.pgliteReady;
  }
}

export { createClient as createPrismaClient };
