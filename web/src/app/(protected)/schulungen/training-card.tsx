"use client";

import { useState } from "react";
import { Badge, Card } from "@/components/app-shell";
import { updateTraining } from "./actions";

type TrainingRow = {
  id: string;
  title: string;
  category: string;
  mandatory: boolean;
  intervalMonths: number | null;
  tags: string;
};

export function TrainingCard({
  training,
  canEdit,
}: {
  training: TrainingRow;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (!canEdit) {
    return (
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{training.title}</h3>
          {training.mandatory ? <Badge tone="warn">Pflicht</Badge> : null}
          <Badge>{training.category}</Badge>
        </div>
        <p className="mt-1 text-sm text-zinc-600">
          Intervall: {training.intervalMonths ?? "—"} Monate · Tags: {training.tags || "—"}
        </p>
      </Card>
    );
  }

  return (
    <Card>
      {!editing ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{training.title}</h3>
              {training.mandatory ? <Badge tone="warn">Pflicht</Badge> : null}
              <Badge>{training.category}</Badge>
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-md border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-50"
            >
              Bearbeiten
            </button>
          </div>
          <p className="mt-1 text-sm text-zinc-600">
            Intervall: {training.intervalMonths ?? "—"} Monate · Tags: {training.tags || "—"}
          </p>
        </>
      ) : (
        <form
          action={async (fd) => {
            await updateTraining(fd);
            setEditing(false);
          }}
          className="grid gap-3 sm:grid-cols-2"
        >
          <input type="hidden" name="id" value={training.id} />
          <label className="text-sm sm:col-span-2">
            Titel
            <input
              name="title"
              required
              defaultValue={training.title}
              className="mt-1 w-full rounded border px-2 py-1"
            />
          </label>
          <label className="text-sm">
            Kategorie
            <input
              name="category"
              required
              defaultValue={training.category}
              className="mt-1 w-full rounded border px-2 py-1"
            />
          </label>
          <label className="text-sm">
            Tags
            <input
              name="tags"
              defaultValue={training.tags}
              className="mt-1 w-full rounded border px-2 py-1"
            />
          </label>
          <label className="text-sm">
            Intervall (Monate)
            <input
              name="intervalMonths"
              type="number"
              defaultValue={training.intervalMonths ?? 12}
              className="mt-1 w-full rounded border px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input name="mandatory" type="checkbox" defaultChecked={training.mandatory} />
            Pflichtschulung
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            >
              Speichern
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}
    </Card>
  );
}
