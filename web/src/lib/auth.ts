import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole } from "@/generated/prisma/client";
import { ensurePrismaReady, prisma } from "./prisma";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-change-in-production-knauf",
);

export type SessionUser = {
  userId: string;
  email: string;
  role: UserRole;
  employeeId: string | null;
};

const COOKIE = "quali_session";

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    userId: user.userId,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      employeeId: (payload.employeeId as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

export async function requireSession(roles?: UserRole[]) {
  const session = await getSession();
  if (!session) return null;
  if (roles && !roles.includes(session.role)) return null;
  return session;
}

export async function getEmployeeScope(session: SessionUser) {
  await ensurePrismaReady();
  if (session.role === UserRole.HR_ADMIN || session.role === UserRole.QM_READONLY) {
    return { all: true as const };
  }
  if (session.role === UserRole.MANAGER && session.employeeId) {
    const reports = await prisma.employee.findMany({
      where: { managerId: session.employeeId, active: true },
      select: { id: true },
    });
    const ids = [session.employeeId, ...reports.map((r) => r.id)];
    return { all: false as const, employeeIds: ids };
  }
  if (session.employeeId) {
    return { all: false as const, employeeIds: [session.employeeId] };
  }
  return { all: false as const, employeeIds: [] as string[] };
}

export { roleLabel } from "./roles";
