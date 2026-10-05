import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { UserRole } from "@/generated/prisma/client";
import { getSession } from "@/lib/auth";
import { ensurePrismaReady, prisma } from "@/lib/prisma";

const storageDir = path.join(process.cwd(), "storage", "proofs");

export async function POST(request: Request) {
  await ensurePrismaReady();
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const assignmentId = String(formData.get("assignmentId"));
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const assignment = await prisma.trainingAssignment.findUnique({
    where: { id: assignmentId },
  });
  if (!assignment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const canEdit =
    session.role === UserRole.HR_ADMIN ||
    assignment.employeeId === session.employeeId;
  if (!canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await fs.mkdir(storageDir, { recursive: true });
  const safeName = `${assignmentId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(storageDir, safeName), buffer);

  await prisma.trainingAssignment.update({
    where: { id: assignmentId },
    data: {
      proofFileName: file.name,
      proofStoredName: safeName,
    },
  });

  return NextResponse.json({ ok: true });
}
