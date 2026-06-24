import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthNotConfigured } from "@/components/auth/not-configured";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function ForgotPasswordPage() {
  if (!isSupabaseConfigured) return <AuthNotConfigured />;
  return <ForgotPasswordForm />;
}
