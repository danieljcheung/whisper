import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { listActiveSnippets } from "@/lib/snippet-store";
import SnippetForm from "@/components/snippet-form";
import SnippetCard from "@/components/snippet-card";
import { logoutAction } from "./actions";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = await verifySessionToken(token);

  if (!isAuthenticated) {
    redirect("/login");
  }

  const snippets = listActiveSnippets();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center py-8 px-4 font-sans antialiased">
      <div className="w-full max-w-2xl space-y-8">
        <header className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50">
              Whisper
            </h1>
            <p className="text-sm text-zinc-400">
              Short-lived clipboard for trusted devices.
            </p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition duration-150 cursor-pointer select-none"
            >
              Sign out
            </button>
          </form>
        </header>

        <section className="space-y-4">
          <SnippetForm />
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest px-1">
            Active Whispers
          </h2>

          {snippets.length === 0 ? (
            <div className="bg-zinc-900/30 border border-zinc-900/60 rounded-xl p-8 text-center text-zinc-500 text-sm">
              No active whispers. Paste something above to bridge it to another device.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {snippets.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
