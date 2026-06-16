import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanupExpired,
  createSnippet,
  deleteSnippet,
  getSnippet,
  listActiveSnippets,
} from "./snippet-store";

describe("snippet-store", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-16T00:00:00.000Z"));
    cleanupExpired(Number.POSITIVE_INFINITY);
  });

  it("creates a snippet", () => {
    const snippet = createSnippet({
      content: "TOKEN=abc123",
      ttlSeconds: 300,
      burnAfterRead: false,
    });

    expect(snippet.id).toMatch(/[0-9a-f-]{36}/i);
    expect(snippet.content).toBe("TOKEN=abc123");
    expect(snippet.createdAt).toBe(Date.now());
    expect(snippet.expiresAt).toBe(Date.now() + 300_000);
    expect(listActiveSnippets()).toEqual([snippet]);
  });

  it("rejects empty content", () => {
    expect(() =>
      createSnippet({ content: "   ", ttlSeconds: 300, burnAfterRead: false })
    ).toThrow("Snippet content is required.");
  });

  it("rejects content over 20 KiB", () => {
    const content = "a".repeat(20 * 1024 + 1);

    expect(() =>
      createSnippet({ content, ttlSeconds: 300, burnAfterRead: false })
    ).toThrow("Snippet content must be 20 KiB or smaller.");
  });

  it("hides and removes expired snippets", () => {
    const snippet = createSnippet({
      content: "short lived",
      ttlSeconds: 300,
      burnAfterRead: false,
    });

    vi.setSystemTime(snippet.expiresAt + 1);

    expect(listActiveSnippets()).toEqual([]);
    expect(getSnippet(snippet.id)).toBeNull();
  });

  it("orders active snippets newest first", () => {
    const first = createSnippet({
      content: "first",
      ttlSeconds: 3600,
      burnAfterRead: false,
    });
    vi.setSystemTime(Date.now() + 1_000);
    const second = createSnippet({
      content: "second",
      ttlSeconds: 3600,
      burnAfterRead: false,
    });

    expect(listActiveSnippets().map((snippet) => snippet.id)).toEqual([
      second.id,
      first.id,
    ]);
  });

  it("deletes snippets", () => {
    const snippet = createSnippet({
      content: "delete me",
      ttlSeconds: 3600,
      burnAfterRead: false,
    });

    expect(deleteSnippet(snippet.id)).toBe(true);
    expect(deleteSnippet(snippet.id)).toBe(false);
    expect(listActiveSnippets()).toEqual([]);
  });

  it("burns after the first get", () => {
    const snippet = createSnippet({
      content: "one time",
      ttlSeconds: 3600,
      burnAfterRead: true,
    });

    expect(getSnippet(snippet.id)).toEqual(snippet);
    expect(getSnippet(snippet.id)).toBeNull();
  });
});
