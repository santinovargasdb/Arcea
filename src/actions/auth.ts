"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

const NOT_CONFIGURED = "La autenticación se habilita al conectar Supabase.";
const fail = (error: string): ActionResult => ({ ok: false, error });

/** Base URL del sitio para los emailRedirectTo/redirectTo del callback. */
async function siteUrl(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function signIn(values: LoginInput): Promise<ActionResult> {
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return fail("Datos inválidos.");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return fail("Email o contraseña incorrectos.");
  return { ok: true };
}

export async function signUp(values: RegisterInput): Promise<ActionResult> {
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) return fail("Datos inválidos.");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${await siteUrl()}/auth/callback?next=/account`,
    },
  });
  if (error) return fail("No pudimos crear la cuenta. Probá con otro email.");
  return { ok: true };
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function requestPasswordReset(
  values: ForgotPasswordInput,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) return fail("Ingresá un email válido.");

  const supabase = await createClient();
  // No revelamos si el email existe: siempre devolvemos ok.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await siteUrl()}/auth/callback?next=/reset-password`,
  });
  return { ok: true };
}

export async function updatePassword(
  values: ResetPasswordInput,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) return fail("Datos inválidos.");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return fail("No pudimos actualizar la contraseña. Reintentá el link.");
  return { ok: true };
}
