import { execSync } from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { resolvePgliteDataDir } from "../src/lib/pglite-data-dir";

async function applyPatches(db: PGlite) {
  const patchDir = path.join(process.cwd(), "prisma/patches");
  if (!fs.existsSync(patchDir)) return;
  const files = fs.readdirSync(patchDir).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(patchDir, file), "utf8");
    await db.exec(sql);
    console.log("Patch angewendet:", file);
  }
}

async function hasSchema(db: PGlite) {
  const res = await db.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'User'
    ) AS exists`,
  );
  return Boolean(res.rows[0]?.exists);
}

async function main() {
  const dir = resolvePgliteDataDir();
  const reset = process.env.DB_RESET === "1";

  if (reset) {
    await fsp.rm(dir, { recursive: true, force: true });
  }

  const db = new PGlite({ dataDir: dir });
  if (!reset && (await hasSchema(db))) {
    console.log("Bestehendes Schema — wende Patches an (falls neu).");
    await applyPatches(db);
    await db.close();
    return;
  }

  const sql = execSync(
    "npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script",
    { encoding: "utf-8", cwd: process.cwd() },
  );

  await db.exec(sql);
  await applyPatches(db);
  await db.close();
  console.log("Schema nach PGlite geschrieben:", dir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
