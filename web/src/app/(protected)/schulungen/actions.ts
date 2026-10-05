"use server";

import { revalidatePath } from "next/cache";
import { TrainingType } from "@/generated/prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";

export async function createTraining(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== UserRole.HR_ADMIN) throw new Error("Forbidden");

  await prisma.training.create({
    data: {
      title: String(formData.get("title")),
      category: String(formData.get("category")),
      mandatory: formData.get("mandatory") === "on",
      intervalMonths: Number(formData.get("intervalMonths") || 12),
      tags: String(formData.get("tags") ?? ""),
      trainingType: TrainingType.INTERNAL,
    },
  });

  revalidatePath("/schulungen");
}

export async function updateTraining(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== UserRole.HR_ADMIN) throw new Error("Forbidden");

  const id = String(formData.get("id"));
  if (!id) throw new Error("Fehlende Schulungs-ID");

  await prisma.training.update({
    where: { id },
    data: {
      title: String(formData.get("title")),
      category: String(formData.get("category")),
      mandatory: formData.get("mandatory") === "on",
      intervalMonths: Number(formData.get("intervalMonths") || 12),
      tags: String(formData.get("tags") ?? ""),
    },
  });

  revalidatePath("/schulungen");
}
