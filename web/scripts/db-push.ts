import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

function dataDir() {
  const raw = process.env.PGLITE_DATA_DIR ?? ".pglite";
  return path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw);
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
  const dir = dataDir();
  const reset = process.env.DB_RESET === "1";

  if (reset) {
    await fs.rm(dir, { recursive: true, force: true });
  }

  const db = new PGlite(dir);
  if (!reset && (await hasSchema(db))) {
    console.log(
      "Datenbankschema in .pglite ist bereits vorhanden. Für Neuaufbau: DB_RESET=1 npm run db:push",
    );
    await db.close();
    return;
  }

  const sql = execSync(
    "npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script",
    { encoding: "utf-8", cwd: process.cwd() },
  );

  await db.exec(sql);
  await db.close();
  console.log("Schema nach PGlite geschrieben:", dir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
