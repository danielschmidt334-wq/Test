import { PageHeader, Card, Badge } from "@/components/app-shell";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/(protected)/hr-actions";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function BenachrichtigungenPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const items = await prisma.appNotification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <PageHeader
        title="Benachrichtigungen"
        description="Erinnerungen zu Fristen und Eskalationen an Führungskräfte."
        actions={
          <form action={markAllNotificationsRead}>
            <button type="submit" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
              Alle als gelesen
            </button>
          </form>
        }
      />
      <div className="grid gap-2">
        {items.length === 0 ? (
          <Card className="text-sm text-zinc-600">Keine Benachrichtigungen.</Card>
        ) : (
          items.map((n) => (
            <Card key={n.id} className={n.readAt ? "opacity-70" : ""}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{n.title}</h3>
                    {!n.readAt ? <Badge tone="warn">Neu</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-zinc-600">{n.message}</p>
                  <p className="mt-1 text-xs text-zinc-500">{formatDate(n.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  {n.link ? (
                    <Link href={n.link} className="text-sm text-zinc-800 underline">
                      Öffnen
                    </Link>
                  ) : null}
                  {!n.readAt ? (
                    <form action={markNotificationRead}>
                      <input type="hidden" name="id" value={n.id} />
                      <button type="submit" className="text-sm text-zinc-500">
                        Gelesen
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
