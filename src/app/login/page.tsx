"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {});

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
            Whisper
          </h1>
          <p className="text-sm text-zinc-400">
            Enter the password to access your secure clipboard
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-zinc-700 transition duration-150"
            />
          </div>

          {state.error && (
            <p className="text-sm font-medium text-red-400 bg-red-950/35 border border-red-900/50 px-3 py-2 rounded-lg">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-600 font-semibold rounded-lg shadow transition duration-150 cursor-pointer select-none"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
