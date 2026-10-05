import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "./prisma";

const outDir = () => path.join(process.cwd(), "storage", "emails");

export async function queueEmail(toEmail: string, subject: string, body: string) {
  await prisma.emailOutbox.create({
    data: { toEmail, subject, body },
  });
}

/** Versendet ausstehende E-Mails (Dev: Datei in storage/emails; Produktion: SMTP vorbereitet). */
export async function flushEmailOutbox() {
  await fs.mkdir(outDir(), { recursive: true });
  const pending = await prisma.emailOutbox.findMany({
    where: { sentAt: null },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  let sent = 0;
  for (const msg of pending) {
    try {
      if (process.env.SMTP_HOST) {
        // Platzhalter für SMTP/Graph — bis IT freigibt
        await prisma.emailOutbox.update({
          where: { id: msg.id },
          data: {
            sentAt: new Date(),
            error: "SMTP_HOST gesetzt — Versand-Connector noch nicht implementiert",
          },
        });
      } else {
        const file = path.join(outDir(), `${msg.id}.eml.txt`);
        await fs.writeFile(
          file,
          `To: ${msg.toEmail}\nSubject: ${msg.subject}\n\n${msg.body}\n`,
          "utf8",
        );
        await prisma.emailOutbox.update({
          where: { id: msg.id },
          data: { sentAt: new Date() },
        });
        sent += 1;
      }
    } catch (e) {
      await prisma.emailOutbox.update({
        where: { id: msg.id },
        data: { error: String(e) },
      });
    }
  }
  return sent;
}
