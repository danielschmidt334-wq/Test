import { execSync } from "node:child_process";
import fs from "node:fs";
import { SignJWT } from "jose";
import { createPrismaClient, ensurePrismaReady } from "../src/lib/prisma";

async function main() {
  await ensurePrismaReady();
  const prisma = createPrismaClient();
  const user = await prisma.user.findUnique({
    where: { email: "hr@demo.knauf.local" },
  });
  if (!user) throw new Error("Demo user missing — run npm run db:setup");

  const secret = new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "dev-secret-change-in-production-knauf",
  );

  const scenarios: { email: string; routes: string[] }[] = [
    {
      email: "hr@demo.knauf.local",
      routes: [
        "/dashboard",
        "/schulungen",
        "/mitarbeitende",
        "/audit",
        "/matrix",
        "/zuweisungen",
        "/onboarding",
      ],
    },
    {
      email: "qm@demo.knauf.local",
      routes: ["/dashboard", "/schulungen", "/audit", "/matrix"],
    },
    {
      email: "anna.schmidt@demo.knauf.local",
      routes: ["/dashboard", "/team", "/matrix", "/meine-schulungen"],
    },
    {
      email: "max1.muster@demo.knauf.local",
      routes: ["/dashboard", "/meine-schulungen"],
    },
  ];

  for (const { email, routes } of scenarios) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error(`User missing: ${email}`);
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);
    console.log("\n==", email, "==");
    for (const route of routes) {
    const out = `/tmp/smoke-${route.replace(/\//g, "_")}.html`;
    const code = execSync(
      `curl -s -o ${out} -w '%{http_code}' -H 'Cookie: quali_session=${token}' http://localhost:3000${route}`,
      { encoding: "utf8" },
    );
    const body = fs.readFileSync(out, "utf8");
    const err =
      body.includes("Application error") ||
      body.includes("Unhandled") ||
      body.includes("PrismaClient") ||
      body.includes("digest");
    console.log(route, "HTTP", code.trim(), err ? "FAIL" : "OK");
    if (err) console.log(body.slice(0, 1500));
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
