import { mkdir, writeFile } from "fs/promises";
import path from "path";

export function getUploadDir() {
  return process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
}

export async function saveUpload(file: File, subdir: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const dir = path.join(/* turbopackIgnore: true */ getUploadDir(), subdir);
  await mkdir(dir, { recursive: true });
  const stored = `${Date.now()}-${safeName}`;
  const fullPath = path.join(dir, stored);
  await writeFile(fullPath, buffer);
  return {
    fileName: file.name,
    filePath: path.join(subdir, stored),
    mimeType: file.type || undefined,
  };
}
