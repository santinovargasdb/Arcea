import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { signOut } from "@/actions/auth";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function AccountPage() {
  const user = await getSessionUser();
  // El layout ya garantiza user != null; este guard es por tipos.
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-xl px-5 py-12 sm:py-16">
      <header className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-green-mid">
          Mi cuenta
        </span>
        <h1 className="mt-3 font-heading text-4xl font-medium text-green">
          Hola{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="mt-2 text-sm text-ink/60">{user.email}</p>
      </header>

      <ProfileForm
        defaultValues={{
          fullName: profile?.full_name ?? "",
          phone: profile?.phone ?? "",
        }}
      />

      <form action={signOut} className="mt-8 border-t border-beige pt-6">
        <button
          type="submit"
          className="text-sm font-medium uppercase tracking-wider text-burgundy hover:underline"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
