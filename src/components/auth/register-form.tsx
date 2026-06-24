"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { signUp } from "@/actions/auth";
import { TextField } from "./text-field";

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterInput) {
    const res = await signUp(values);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("¡Cuenta creada! Revisá tu email para confirmarla.");
    reset();
  }

  if (isSubmitSuccessful) {
    return (
      <div className="space-y-3 text-center">
        <h1 className="font-heading text-2xl text-green">Revisá tu email</h1>
        <p className="text-sm text-ink/70">
          Te enviamos un link para confirmar tu cuenta.
        </p>
        <Link
          href="/login"
          className="inline-block text-xs uppercase tracking-wider text-green-mid hover:text-burgundy"
        >
          Volver a ingresar
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h1 className="font-heading text-2xl text-green">Crear cuenta</h1>
      <TextField
        id="fullName"
        label="Nombre"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
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
        {isSubmitting ? "Creando…" : "Crear cuenta"}
      </button>
      <p className="text-center text-xs text-green-mid">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="hover:text-burgundy">
          Ingresá
        </Link>
      </p>
    </form>
  );
}
