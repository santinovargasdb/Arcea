import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthNotConfigured } from "@/components/auth/not-configured";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default function ResetPasswordPage() {
  if (!isSupabaseConfigured) return <AuthNotConfigured />;
  return <ResetPasswordForm />;
}
