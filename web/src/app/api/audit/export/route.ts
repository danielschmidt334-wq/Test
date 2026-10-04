import fs from "node:fs";
import path from "node:path";
import { PassThrough } from "node:stream";
import { Readable } from "node:stream";
import { createRequire } from "node:module";
import { NextResponse } from "next/server";
import { UserRole } from "@/generated/prisma/client";
import { getSession } from "@/lib/auth";
import { refreshOverdueStatuses } from "@/lib/assignments";
import { prisma } from "@/lib/prisma";
import { assignmentStatusLabel, csvEscape, formatDate } from "@/lib/utils";

const storageDir = path.join(process.cwd(), "storage", "proofs");
const require = createRequire(import.meta.url);
const archiver = require("archiver") as (
  format: string,
  options?: { zlib?: { level: number } },
) => import("stream").PassThrough & {
  pipe: (dest: NodeJS.WritableStream) => unknown;
  file: (path: string, opts: { name: string }) => void;
  append: (data: string, opts: { name: string }) => void;
  finalize: () => Promise<void>;
  on: (event: string, cb: (err: Error) => void) => void;
};

async function fetchRows(department?: string, trainingId?: string) {
  return prisma.trainingAssignment.findMany({
    where: {
      ...(trainingId ? { trainingId } : {}),
      ...(department ? { employee: { department } } : {}),
    },
    include: { training: true, employee: true },
    orderBy: [{ employee: { lastName: "asc" } }, { training: { title: "asc" } }],
  });
}

export async function GET(request: Request) {
  const session = await getSession();
  if (
    !session ||
    (session.role !== UserRole.HR_ADMIN && session.role !== UserRole.QM_READONLY)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await refreshOverdueStatuses();

  const url = new URL(request.url);
  const department = url.searchParams.get("department") ?? undefined;
  const trainingId = url.searchParams.get("trainingId") ?? undefined;
  const format = url.searchParams.get("format") ?? "csv";

  const rows = await fetchRows(department, trainingId);

  if (format === "csv") {
    const header = [
      "Nachname",
      "Vorname",
      "E-Mail",
      "Abteilung",
      "Schulung",
      "Kategorie",
      "Pflicht",
      "Frist",
      "Status",
      "Abgeschlossen",
      "Gueltig_bis",
      "Nachweis_Datei",
    ].join(";");
    const lines = rows.map((r) =>
      [
        csvEscape(r.employee.lastName),
        csvEscape(r.employee.firstName),
        csvEscape(r.employee.email),
        csvEscape(r.employee.department),
        csvEscape(r.training.title),
        csvEscape(r.training.category),
        r.training.mandatory ? "ja" : "nein",
        csvEscape(formatDate(r.dueDate)),
        csvEscape(assignmentStatusLabel(r.status)),
        csvEscape(formatDate(r.completedAt)),
        csvEscape(formatDate(r.validUntil)),
        csvEscape(r.proofFileName ?? ""),
      ].join(";"),
    );
    const csv = "\uFEFF" + [header, ...lines].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="audit-schulungen.csv"`,
      },
    });
  }

  if (format === "zip") {
    const passthrough = new PassThrough();
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err: Error) => passthrough.destroy(err));
    archive.pipe(passthrough);

    const header = ["Nachname", "Vorname", "Schulung", "Nachweis_Datei"].join(";");
    const csvLines = [header];
    for (const r of rows) {
      csvLines.push(
        [
          csvEscape(r.employee.lastName),
          csvEscape(r.employee.firstName),
          csvEscape(r.training.title),
          csvEscape(r.proofFileName ?? ""),
        ].join(";"),
      );
      if (
        r.proofStoredName &&
        fs.existsSync(path.join(storageDir, r.proofStoredName))
      ) {
        archive.file(path.join(storageDir, r.proofStoredName), {
          name: `nachweise/${r.employee.lastName}_${r.proofStoredName}`,
        });
      }
    }
    archive.append("\uFEFF" + csvLines.join("\n"), { name: "index.csv" });
    void archive.finalize();

    const webStream = Readable.toWeb(passthrough) as ReadableStream;
    return new NextResponse(webStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="audit-paket.zip"`,
      },
    });
  }

  return NextResponse.json({ error: "Unknown format" }, { status: 400 });
}
