"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { profileSchema, type ProfileInput } from "@/lib/validations/auth";
import { updateProfile } from "@/actions/profile";
import { TextField } from "@/components/auth/text-field";

export function ProfileForm({ defaultValues }: { defaultValues: ProfileInput }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  async function onSubmit(values: ProfileInput) {
    const res = await updateProfile(values);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Datos guardados.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TextField
        id="fullName"
        label="Nombre"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <TextField
        id="phone"
        label="Teléfono (opcional)"
        autoComplete="tel"
        error={errors.phone?.message}
        {...register("phone")}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-green px-6 py-3 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-burgundy disabled:opacity-60"
      >
        {isSubmitting ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
