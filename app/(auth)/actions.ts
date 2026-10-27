"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";

const origin = () => process.env.NEXT_PUBLIC_SITE_URL || headers().get("origin") || "http://localhost:3000";
const emailOk = (e: string) => /^\S+@\S+\.\S+$/.test(e);

export async function signup(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  const name = String(fd.get("name") ?? "").trim().slice(0, 60);
  const timezone = String(fd.get("timezone") ?? "UTC");
  if (!emailOk(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Use at least 8 characters for your password." };
  const { data, error } = await createClient().auth.signUp({
    email, password,
    options: { emailRedirectTo: `${origin()}/auth/callback`, data: { display_name: name, timezone } },
  });
  if (error) return { error: error.message };
  if (data.session) redirect("/dashboard");
  return { ok: "Check your email to confirm your account, then log in." };
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  if (!emailOk(email) || !password) return { error: "Enter your email and password." };
  const { error } = await createClient().auth.signInWithPassword({ email, password });
  if (error) return { error: "That email and password don't match. Try again or reset your password." };
  redirect("/dashboard");
}

export async function logout() {
  await createClient().auth.signOut();
  redirect("/login");
}

export async function forgotPassword(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim();
  if (!emailOk(email)) return { error: "Enter a valid email address." };
  await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${origin()}/auth/callback?next=/reset-password` });
  return { ok: "If an account exists for that email, a reset link is on its way." };
}

export async function resetPassword(_: FormState, fd: FormData): Promise<FormState> {
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { error: "Use at least 8 characters for your password." };
  const { error } = await createClient().auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/dashboard");
}
