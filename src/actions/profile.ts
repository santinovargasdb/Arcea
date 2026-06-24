"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { profileSchema, type ProfileInput } from "@/lib/validations/auth";
import type { ActionResult } from "@/actions/auth";

export async function updateProfile(values: ProfileInput): Promise<ActionResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "La cuenta se habilita al conectar Supabase." };
  }
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
    })
    .eq("id", user.id);
  if (error) return { ok: false, error: "No pudimos guardar los cambios." };

  revalidatePath("/account");
  return { ok: true };
}
