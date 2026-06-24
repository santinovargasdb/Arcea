"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { signIn } from "@/actions/auth";
import { TextField } from "./text-field";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    const res = await signIn(values);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("¡Hola de nuevo!");
    router.push(params.get("next") ?? "/account");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h1 className="font-heading text-2xl text-green">Ingresar</h1>
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
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-green px-6 py-3 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-burgundy disabled:opacity-60"
      >
        {isSubmitting ? "Ingresando…" : "Ingresar"}
      </button>
      <div className="flex items-center justify-between text-xs text-green-mid">
        <Link href="/forgot-password" className="hover:text-burgundy">
          Olvidé mi contraseña
        </Link>
        <Link href="/register" className="hover:text-burgundy">
          Crear cuenta
        </Link>
      </div>
    </form>
  );
}
