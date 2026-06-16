import crypto from "crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createSessionToken,
  getSessionSecret,
  requireWhisperPassword,
  verifySessionToken,
} from "./auth";

const SESSION_SECRET = "0123456789abcdef0123456789abcdef";
const PASSWORD = "dev-password";

function signPayload(payload: object, secret = SESSION_SECRET): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

describe("auth", () => {
  const originalPassword = process.env.WHISPER_PASSWORD;
  const originalSessionSecret = process.env.WHISPER_SESSION_SECRET;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-16T00:00:00.000Z"));
    process.env.WHISPER_PASSWORD = PASSWORD;
    process.env.WHISPER_SESSION_SECRET = SESSION_SECRET;
  });

  afterEach(() => {
    vi.useRealTimers();
    if (originalPassword === undefined) {
      delete process.env.WHISPER_PASSWORD;
    } else {
      process.env.WHISPER_PASSWORD = originalPassword;
    }

    if (originalSessionSecret === undefined) {
      delete process.env.WHISPER_SESSION_SECRET;
    } else {
      process.env.WHISPER_SESSION_SECRET = originalSessionSecret;
    }
  });

  it("throws when the password is missing", () => {
    delete process.env.WHISPER_PASSWORD;

    expect(() => requireWhisperPassword()).toThrow("WHISPER_PASSWORD is required.");
  });

  it("throws when the session secret is short", () => {
    process.env.WHISPER_SESSION_SECRET = "too-short";

    expect(() => getSessionSecret()).toThrow(
      "WHISPER_SESSION_SECRET must be at least 32 characters."
    );
  });

  it("verifies a generated session token", async () => {
    const token = await createSessionToken();

    await expect(verifySessionToken(token)).resolves.toBe(true);
  });

  it("rejects malformed tokens", async () => {
    await expect(verifySessionToken("not-a-token")).resolves.toBe(false);
  });

  it("rejects expired tokens", async () => {
    const issuedAt = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60 - 1;
    const token = signPayload({ v: 1, iat: issuedAt });

    await expect(verifySessionToken(token)).resolves.toBe(false);
  });

  it("rejects bad signatures", async () => {
    const issuedAt = Math.floor(Date.now() / 1000);
    const token = signPayload({ v: 1, iat: issuedAt }, "wrong-secret-with-enough-length-12345");

    await expect(verifySessionToken(token)).resolves.toBe(false);
  });
});
