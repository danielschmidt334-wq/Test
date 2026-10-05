"use client";

import { useRouter } from "next/navigation";

export function ProofUploadForm({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) return;

    const body = new FormData();
    body.set("assignmentId", assignmentId);
    body.set("file", file);

    const res = await fetch("/api/proofs/upload", { method: "POST", body });
    if (!res.ok) {
      alert("Upload fehlgeschlagen");
      return;
    }
    router.refresh();
    form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="mt-2 flex flex-wrap items-end gap-2">
      <label className="text-xs text-zinc-600">
        Nachweis (PDF/Bild)
        <input
          name="file"
          type="file"
          accept=".pdf,image/*"
          className="mt-1 block w-full text-xs"
          required
        />
      </label>
      <button
        type="submit"
        className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium hover:bg-zinc-50"
      >
        Hochladen
      </button>
    </form>
  );
}
