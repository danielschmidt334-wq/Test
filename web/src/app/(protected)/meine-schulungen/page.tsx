import { AssignmentStatus } from "@/generated/prisma/client";
import { Badge, Card, PageHeader } from "@/components/app-shell";
import { ProofUploadForm } from "@/components/proof-upload-form";
import { completeAssignment } from "@/app/(protected)/actions";
import { getSession } from "@/lib/auth";
import { listAssignmentsForScope } from "@/lib/assignments";
import { assignmentStatusLabel, formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function MeineSchulungenPage() {
  const session = await getSession();
  if (!session?.employeeId) redirect("/dashboard");

  const rows = await listAssignmentsForScope([session.employeeId]);

  return (
    <div>
      <PageHeader
        title="Meine Schulungen"
        description="Pflichtunterweisungen abschließen und Nachweise hochladen."
      />
      <div className="space-y-4">
        {rows.map((row) => (
          <Card key={row.id}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold">{row.training.title}</h3>
                <p className="text-sm text-zinc-600">{row.training.category}</p>
                <p className="mt-2 text-sm">
                  Frist: {formatDate(row.dueDate)} ·{" "}
                  <Badge
                    tone={
                      row.status === AssignmentStatus.OVERDUE
                        ? "bad"
                        : row.status === AssignmentStatus.COMPLETED
                          ? "ok"
                          : "neutral"
                    }
                  >
                    {assignmentStatusLabel(row.status)}
                  </Badge>
                </p>
                {row.proofFileName ? (
                  <p className="mt-1 text-xs text-emerald-700">
                    Nachweis: {row.proofFileName}
                  </p>
                ) : null}
              </div>
              {row.status !== AssignmentStatus.COMPLETED &&
              row.status !== AssignmentStatus.EXEMPT ? (
                <form action={completeAssignment} className="space-y-2">
                  <input type="hidden" name="assignmentId" value={row.id} />
                  <label className="block text-xs text-zinc-600">
                    Gültig bis (optional)
                    <input
                      type="date"
                      name="validUntil"
                      className="mt-1 rounded border border-zinc-300 px-2 py-1 text-sm"
                    />
                  </label>
                  <button
                    type="submit"
                    className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
                  >
                    Als abgeschlossen markieren
                  </button>
                </form>
              ) : null}
            </div>
            {row.status === AssignmentStatus.COMPLETED || row.proofFileName ? (
              <ProofUploadForm assignmentId={row.id} />
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
