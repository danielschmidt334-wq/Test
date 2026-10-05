import { PageHeader, Card } from "@/components/app-shell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { UserRole } from "@/generated/prisma/client";
import { redirect } from "next/navigation";

export default async function ProtokollPage() {
  const session = await getSession();
  if (
    !session ||
    (session.role !== UserRole.HR_ADMIN && session.role !== UserRole.QM_READONLY)
  ) {
    redirect("/dashboard");
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Änderungsprotokoll"
        description="RR-04-light: nachvollziehbare Änderungen am Katalog und Stammdaten."
      />
      <Card className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b text-zinc-500">
            <tr>
              <th className="py-2 pr-4">Zeit</th>
              <th className="py-2 pr-4">Nutzer</th>
              <th className="py-2 pr-4">Aktion</th>
              <th className="py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-zinc-100">
                <td className="py-2 pr-4 whitespace-nowrap tabular-nums">
                  {formatDate(l.createdAt)}
                </td>
                <td className="py-2 pr-4">{l.actorEmail}</td>
                <td className="py-2 pr-4 font-mono text-xs">{l.action}</td>
                <td className="py-2">{l.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 ? (
          <p className="py-4 text-sm text-zinc-500">Noch keine Einträge.</p>
        ) : null}
      </Card>
    </div>
  );
}
