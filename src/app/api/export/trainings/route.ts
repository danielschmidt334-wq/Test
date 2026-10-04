import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { categoryLabels, formatDate, statusLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

function csvEscape(value: string) {
  if (value.includes('"') || value.includes(";") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const session = await requireSession(["HR_ADMIN", "MANAGER"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assignments = await prisma.trainingAssignment.findMany({
    include: { user: true, training: true, proof: true },
    orderBy: [{ user: { lastName: "asc" } }, { dueDate: "asc" }],
  });

  const header = [
    "Nachname",
    "Vorname",
    "E-Mail",
    "Schulung",
    "Kategorie",
    "Pflicht",
    "Frist",
    "Status",
    "Abgeschlossen am",
    "Gültig bis",
    "Nachweis-Datei",
  ].join(";");

  const lines = assignments.map((a) =>
    [
      a.user.lastName,
      a.user.firstName,
      a.user.email,
      a.training.title,
      categoryLabels[a.training.category],
      a.training.isMandatory ? "Ja" : "Nein",
      formatDate(a.dueDate),
      statusLabels[a.status],
      formatDate(a.completedAt),
      formatDate(a.validUntil),
      a.proof?.fileName ?? "",
    ]
      .map((c) => csvEscape(String(c)))
      .join(";")
  );

  const body = "\uFEFF" + [header, ...lines].join("\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="schulungsstand-export.csv"',
    },
  });
}
