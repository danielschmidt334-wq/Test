"use server";

import { revalidatePath } from "next/cache";
import { TrainingType } from "@/generated/prisma/client";
import { getSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";

export async function createTraining(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== UserRole.HR_ADMIN) throw new Error("Forbidden");

  const title = String(formData.get("title"));
  const created = await prisma.training.create({
    data: {
      title,
      category: String(formData.get("category")),
      mandatory: formData.get("mandatory") === "on",
      intervalMonths: Number(formData.get("intervalMonths") || 12),
      tags: String(formData.get("tags") ?? ""),
      trainingType: TrainingType.INTERNAL,
    },
  });
  await writeAuditLog({
    actorEmail: session.email,
    action: "TRAINING_CREATE",
    entity: "Training",
    entityId: created.id,
    summary: title,
  });

  revalidatePath("/schulungen");
  revalidatePath("/protokoll");
}

export async function updateTraining(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== UserRole.HR_ADMIN) throw new Error("Forbidden");

  const id = String(formData.get("id"));
  if (!id) throw new Error("Fehlende Schulungs-ID");

  const title = String(formData.get("title"));
  await prisma.training.update({
    where: { id },
    data: {
      title,
      category: String(formData.get("category")),
      mandatory: formData.get("mandatory") === "on",
      intervalMonths: Number(formData.get("intervalMonths") || 12),
      tags: String(formData.get("tags") ?? ""),
    },
  });
  await writeAuditLog({
    actorEmail: session.email,
    action: "TRAINING_UPDATE",
    entity: "Training",
    entityId: id,
    summary: title,
  });

  revalidatePath("/schulungen");
  revalidatePath("/protokoll");
}
