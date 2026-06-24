import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { getSessionUser } from "@/lib/auth/session";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  return (
    <>
      <Header isAuthenticated={!!user} />
      <main className="flex-1 bg-cream text-ink">{children}</main>
      <Footer />
    </>
  );
}
