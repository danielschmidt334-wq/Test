import path from "node:path";
import { fileURLToPath } from "node:url";

/** Absoluter Pfad als String (Windows-sicher, kein URL-Objekt). */
export function resolvePgliteDataDir(): string {
  const raw = process.env.PGLITE_DATA_DIR ?? ".pglite";
  if (raw.startsWith("file:")) {
    return fileURLToPath(raw);
  }
  if (path.isAbsolute(raw)) {
    return path.normalize(raw);
  }
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), raw);
}
