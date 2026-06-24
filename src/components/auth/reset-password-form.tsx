"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import { updatePassword } from "@/actions/auth";
import { TextField } from "./text-field";

export function ResetPasswordForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordInput) {
    const res = await updatePassword(values);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Contraseña actualizada. Ingresá de nuevo.");
    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h1 className="font-heading text-2xl text-green">Nueva contraseña</h1>
      <TextField
        id="password"
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <TextField
        id="confirmPassword"
        label="Repetir contraseña"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-green px-6 py-3 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-burgundy disabled:opacity-60"
      >
        {isSubmitting ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
