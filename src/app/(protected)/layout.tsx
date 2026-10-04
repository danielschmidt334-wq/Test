import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppNav } from "@/components/app-nav";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <>
      <AppNav session={session} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </>
  );
}
