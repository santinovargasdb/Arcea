import { redirect } from "next/navigation";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth/session";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defensa en profundidad: el Proxy también gatea /account (Task 9).
  if (!isSupabaseConfigured) redirect("/login");
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");

  return (
    <>
      <Header isAuthenticated />
      <main className="flex-1 bg-cream text-ink">{children}</main>
      <Footer />
    </>
  );
}
