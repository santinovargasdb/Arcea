"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";
import { requestPasswordReset } from "@/actions/auth";
import { TextField } from "./text-field";

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    const res = await requestPasswordReset(values);
    if (!res.ok) toast.error(res.error);
  }

  if (isSubmitSuccessful) {
    return (
      <div className="space-y-3 text-center">
        <h1 className="font-heading text-2xl text-green">Revisá tu email</h1>
        <p className="text-sm text-ink/70">
          Si el email está registrado, te enviamos un link para restablecer la contraseña.
        </p>
        <Link
          href="/login"
          className="inline-block text-xs uppercase tracking-wider text-green-mid hover:text-burgundy"
        >
          Volver
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h1 className="font-heading text-2xl text-green">Recuperar contraseña</h1>
      <p className="text-sm text-ink/70">Te enviamos un link a tu email.</p>
      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-green px-6 py-3 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-burgundy disabled:opacity-60"
      >
        {isSubmitting ? "Enviando…" : "Enviar link"}
      </button>
    </form>
  );
}
