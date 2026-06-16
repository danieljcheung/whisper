import crypto from "crypto";

export const SESSION_COOKIE_NAME = "whisper_session";

export function requireWhisperPassword(): string {
  const password = process.env.WHISPER_PASSWORD;
  if (password === undefined || password === null || password === "") {
    throw new Error("WHISPER_PASSWORD is required.");
  }
  return password;
}

export function getSessionSecret(): string {
  const secret = process.env.WHISPER_SESSION_SECRET;
  if (secret === undefined || secret === null || secret.length < 32) {
    throw new Error("WHISPER_SESSION_SECRET must be at least 32 characters.");
  }
  return secret;
}

export async function createSessionToken(): Promise<string> {
  const secret = getSessionSecret();
  const payloadObj = {
    v: 1,
    iat: Math.floor(Date.now() / 1000),
  };
  const payloadStr = JSON.stringify(payloadObj);
  const payloadB64 = Buffer.from(payloadStr).toString("base64url");
  const hmac = crypto.createHmac("sha256", secret).update(payloadB64).digest();
  const hmacB64 = hmac.toString("base64url");
  return `${payloadB64}.${hmacB64}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  const secret = getSessionSecret();
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, hmacB64] = parts;

  try {
    const expectedHmac = crypto.createHmac("sha256", secret).update(payloadB64).digest();
    const actualHmac = Buffer.from(hmacB64, "base64url");

    if (expectedHmac.length !== actualHmac.length) {
      return false;
    }
    if (!crypto.timingSafeEqual(expectedHmac, actualHmac)) {
      return false;
    }

    const payloadStr = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload = JSON.parse(payloadStr);

    if (typeof payload !== "object" || payload === null) return false;
    if (payload.v !== 1 || typeof payload.iat !== "number") return false;

    const nowSeconds = Math.floor(Date.now() / 1000);
    const ageSeconds = nowSeconds - payload.iat;
    const maxAgeSeconds = 7 * 24 * 60 * 60; // 7 days

    if (ageSeconds > maxAgeSeconds || ageSeconds < -60) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

