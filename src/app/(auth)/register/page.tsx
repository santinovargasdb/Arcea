import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth/session";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthNotConfigured } from "@/components/auth/not-configured";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegisterPage() {
  if (!isSupabaseConfigured) return <AuthNotConfigured />;
  if (await getSessionUser()) redirect("/account");
  return <RegisterForm />;
}
