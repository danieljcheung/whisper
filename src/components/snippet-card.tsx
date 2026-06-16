import type { Snippet } from "@/lib/snippet-store";
import { deleteSnippetAction } from "@/app/actions";
import CopyButton from "./copy-button";

interface SnippetCardProps {
  snippet: Snippet;
}

export default function SnippetCard({ snippet }: SnippetCardProps) {
  const createdDate = new Date(snippet.createdAt).toLocaleString();
  const expiresDate = new Date(snippet.expiresAt).toLocaleString();

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col gap-3 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400 border-b border-zinc-800 pb-2">
        <div className="flex flex-col gap-0.5">
          <div>
            <span className="font-semibold text-zinc-500">Created:</span> {createdDate}
          </div>
          <div>
            <span className="font-semibold text-zinc-500">Expires:</span> {expiresDate}
          </div>
        </div>
        {snippet.burnAfterRead && (
          <span className="px-2 py-0.5 rounded-full text-red-400 bg-red-950/50 border border-red-900/50 text-[10px] uppercase font-bold tracking-wider">
            Burn after read
          </span>
        )}
      </div>

      <pre className="font-mono text-sm bg-zinc-950 text-zinc-100 p-3 rounded border border-zinc-800/80 whitespace-pre-wrap break-words select-all max-h-96 overflow-y-auto">
        {snippet.content}
      </pre>

      <div className="flex justify-between items-center mt-1 pt-2 border-t border-zinc-800/55">
        <CopyButton content={snippet.content} />
        <form action={deleteSnippetAction}>
          <input type="hidden" name="id" value={snippet.id} />
          <button
            type="submit"
            className="px-3 py-1 text-sm font-medium bg-red-950/40 hover:bg-red-900/40 text-red-300 rounded border border-red-900/50 hover:border-red-800 transition duration-150 cursor-pointer select-none"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
