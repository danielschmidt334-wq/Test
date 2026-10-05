import "dotenv/config";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";
import { PrismaClient } from "@/generated/prisma/client";
import { resolvePgliteDataDir } from "./pglite-data-dir";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pglite: PGlite | undefined;
  pgliteReady: Promise<void> | undefined;
};

function createPglite(): PGlite {
  const dataDir = resolvePgliteDataDir();
  return new PGlite({ dataDir });
}

function createClient(): PrismaClient {
  const pglite = globalForPrisma.pglite ?? createPglite();
  if (!globalForPrisma.pglite) {
    globalForPrisma.pglite = pglite;
    globalForPrisma.pgliteReady = pglite.waitReady;
  }
  const adapter = new PrismaPGlite(pglite);
  return new PrismaClient({ adapter });
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = getPrisma();

export async function ensurePrismaReady() {
  if (!globalForPrisma.pglite) {
    getPrisma();
  }
  if (globalForPrisma.pgliteReady) {
    await globalForPrisma.pgliteReady;
  }
}

/** Immer dieselbe Instanz (wichtig für PGlite-Dateisperre). */
export function createPrismaClient(): PrismaClient {
  return getPrisma();
}
