"use client";

import { useActionState, useEffect, useRef } from "react";
import { createSnippetAction } from "@/app/actions";

export default function SnippetForm() {
  const [state, formAction, isPending] = useActionState(createSnippetAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl"
    >
      <div className="space-y-1">
        <label
          htmlFor="content"
          className="block text-xs font-semibold uppercase tracking-wider text-zinc-400"
        >
          Snippet Content
        </label>
        <textarea
          id="content"
          name="content"
          autoFocus
          required
          placeholder="Paste a token, link, command, env block, or note…"
          className="h-36 w-full resize-y rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 placeholder-zinc-700 transition duration-150 focus:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-800"
        />
      </div>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="ttlSeconds"
              className="text-[10px] font-bold uppercase tracking-wider text-zinc-500"
            >
              Expiration
            </label>
            <select
              id="ttlSeconds"
              name="ttlSeconds"
              defaultValue="3600"
              className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-700"
            >
              <option value="300">5 minutes</option>
              <option value="900">15 minutes</option>
              <option value="3600">1 hour</option>
              <option value="21600">6 hours</option>
              <option value="86400">1 day</option>
            </select>
          </div>

          <div className="mt-4 flex items-center gap-2 sm:mt-0">
            <input
              id="burnAfterRead"
              name="burnAfterRead"
              type="checkbox"
              className="h-4 w-4 cursor-pointer rounded border border-zinc-800 bg-zinc-950 accent-zinc-50 focus:ring-0 focus:ring-offset-0"
            />
            <label
              htmlFor="burnAfterRead"
              className="cursor-pointer select-none text-sm font-medium text-zinc-300"
            >
              Burn after read
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 w-full cursor-pointer select-none rounded-lg bg-zinc-100 px-5 py-2 text-center font-semibold text-zinc-950 shadow transition duration-150 hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 sm:mt-0 sm:w-auto"
        >
          {isPending ? "Saving..." : "Save whisper"}
        </button>
      </div>

      {state.error && (
        <p className="rounded-lg border border-red-900/50 bg-red-950/35 px-3 py-2 text-sm font-medium text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
