"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  requireWhisperPassword,
  verifySessionToken,
} from "@/lib/auth";
import { createSnippet, deleteSnippet } from "@/lib/snippet-store";
import type { SnippetTtlSeconds } from "@/lib/snippet-store";

export interface ActionState {
  error?: string;
  success?: boolean;
}

function verifySubmittedPassword(password: string): boolean {
  const expected = Buffer.from(requireWhisperPassword(), "utf8");
  const actual = Buffer.from(password, "utf8");

  if (expected.length !== actual.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, actual);
}

export async function loginAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = formData.get("password");

  if (typeof password !== "string") {
    return { error: "Unable to sign in." };
  }

  if (!verifySubmittedPassword(password)) {
    return { error: "Unable to sign in." };
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/");
}

export async function createSnippetAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = await verifySessionToken(token);

  if (!isAuthenticated) {
    redirect("/login");
  }

  const content = formData.get("content");
  const ttlRaw = formData.get("ttlSeconds");
  const burnRaw = formData.get("burnAfterRead");

  if (typeof content !== "string") {
    return { error: "Snippet content is required." };
  }

  const ttlSeconds = Number(ttlRaw) as SnippetTtlSeconds;
  const burnAfterRead = burnRaw === "on";

  try {
    createSnippet({ content, ttlSeconds, burnAfterRead });
  } catch (err) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: "An unknown error occurred." };
  }

  revalidatePath("/");
  return { success: true, error: undefined };
}

export async function deleteSnippetAction(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = await verifySessionToken(token);

  if (!isAuthenticated) {
    redirect("/login");
  }

  const id = formData.get("id");
  if (typeof id === "string") {
    deleteSnippet(id);
    revalidatePath("/");
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
