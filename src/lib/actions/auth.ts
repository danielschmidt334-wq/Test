"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { displayName } from "@/lib/labels";

export async function loginFormAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  return loginAction(formData);
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.status !== "ACTIVE") {
    return { error: "Anmeldung fehlgeschlagen." };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { error: "Anmeldung fehlgeschlagen." };

  await createSession({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: displayName(user.firstName, user.lastName),
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
