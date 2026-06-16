import crypto from "crypto";

export type SnippetTtlSeconds = 300 | 900 | 3600 | 21600 | 86400;

export type Snippet = {
  id: string;
  content: string;
  createdAt: number;
  expiresAt: number;
  burnAfterRead: boolean;
};

export type CreateSnippetInput = {
  content: string;
  ttlSeconds: SnippetTtlSeconds;
  burnAfterRead: boolean;
};

const snippets = new Map<string, Snippet>();

export function createSnippet(input: CreateSnippetInput): Snippet {
  if (!input.content || input.content.trim().length === 0) {
    throw new Error("Snippet content is required.");
  }

  const byteLength = new TextEncoder().encode(input.content).length;
  if (byteLength > 20 * 1024) {
    throw new Error("Snippet content must be 20 KiB or smaller.");
  }

  const now = Date.now();
  const snippet: Snippet = {
    id: crypto.randomUUID(),
    content: input.content,
    createdAt: now,
    expiresAt: now + input.ttlSeconds * 1000,
    burnAfterRead: input.burnAfterRead,
  };

  snippets.set(snippet.id, snippet);
  return snippet;
}

export function listActiveSnippets(now?: number): Snippet[] {
  cleanupExpired(now);
  return Array.from(snippets.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function getSnippet(id: string, now?: number): Snippet | null {
  cleanupExpired(now);
  const snippet = snippets.get(id);
  if (!snippet) {
    return null;
  }
  if (snippet.burnAfterRead) {
    snippets.delete(id);
  }
  return snippet;
}

export function deleteSnippet(id: string): boolean {
  return snippets.delete(id);
}

export function cleanupExpired(now?: number): void {
  const current = now ?? Date.now();
  for (const [id, snippet] of snippets.entries()) {
    if (snippet.expiresAt <= current) {
      snippets.delete(id);
    }
  }
}
