import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/login-form";
import { AuthNotConfigured } from "@/components/auth/not-configured";

export const metadata: Metadata = { title: "Ingresar" };

export default async function LoginPage() {
  if (!isSupabaseConfigured) return <AuthNotConfigured />;
  if (await getSessionUser()) redirect("/account");
  return <LoginForm />;
}
