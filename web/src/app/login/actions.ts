"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
  });

  redirect(next.startsWith("/") ? next : "/dashboard");
}
