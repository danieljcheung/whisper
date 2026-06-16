"use client";

import { useActionState } from "react";
import { revealSnippetAction } from "@/app/actions";
import CopyButton from "./copy-button";

interface RevealBurnFormProps {
  id: string;
}

export default function RevealBurnForm({ id }: RevealBurnFormProps) {
  const [state, formAction, isPending] = useActionState(revealSnippetAction, {});

  if (state.content) {
    return (
      <div className="flex flex-col gap-3">
        <pre className="font-mono text-sm bg-zinc-950 text-zinc-100 p-3 rounded border border-zinc-800/80 whitespace-pre-wrap break-words select-all max-h-96 overflow-y-auto">
          {state.content}
        </pre>
        <div className="flex justify-between items-center mt-1 pt-2 border-t border-zinc-800/55">
          <CopyButton content={state.content} />
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />

      {state.error && (
        <div className="text-sm text-red-400 bg-red-950/20 border border-red-900/30 p-2.5 rounded">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full px-4 py-2 text-sm font-semibold text-zinc-100 bg-red-900 hover:bg-red-800 disabled:bg-zinc-800 disabled:text-zinc-500 rounded border border-red-800 hover:border-red-700 disabled:border-zinc-700 transition duration-150 cursor-pointer disabled:cursor-not-allowed select-none text-center"
      >
        Reveal and burn
      </button>
    </form>
  );
}
