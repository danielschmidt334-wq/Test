import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Knauf Industries
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Anmelden</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Demo: <code className="text-xs">hr@demo.knauf.local</code> /{" "}
          <code className="text-xs">demo1234</code>
        </p>
        {params.error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            E-Mail oder Passwort ungültig.
          </p>
        ) : null}
        <form action={loginAction} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />
          <label className="block text-sm font-medium">
            E-Mail
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="hr@demo.knauf.local"
            />
          </label>
          <label className="block text-sm font-medium">
            Passwort
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Anmelden
          </button>
        </form>
      </div>
    </div>
  );
}
