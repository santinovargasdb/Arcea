"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";

const NAV = [
  { label: "Inicio", href: "/" },
  { label: "Colección", href: "/products" },
  { label: "Sweaters", href: "/products?category=sweaters" },
  { label: "Abrigos", href: "/products?category=abrigos" },
  { label: "Tejidos", href: "/products?category=tejidos" },
  { label: "Casual", href: "/products?category=casual" },
];

export function Header({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-green/10 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="font-heading text-2xl font-semibold leading-none text-green">
          Arcea
          <span className="ml-1 align-middle text-[0.55rem] uppercase tracking-[0.4em] text-green-mid">
            Estudio
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium uppercase tracking-wider text-ink transition-colors hover:text-burgundy"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-ink">
          <Link href="/products" aria-label="Buscar" className="transition-colors hover:text-burgundy">
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href={isAuthenticated ? "/account" : "/login"}
            aria-label={isAuthenticated ? "Mi cuenta" : "Ingresar"}
            className="transition-colors hover:text-burgundy"
          >
            <User className="h-5 w-5" />
          </Link>
          <button aria-label="Carrito" className="relative transition-colors hover:text-burgundy">
            <ShoppingBag className="h-5 w-5" />
          </button>
          <button
            aria-label="Menú"
            className="lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Menú mobile */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-green px-6 py-6 text-cream lg:hidden">
          <button
            aria-label="Cerrar"
            className="self-end"
            onClick={() => setOpen(false)}
          >
            <X className="h-7 w-7" />
          </button>
          <nav className="mt-8 flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-cream/15 py-4 font-heading text-3xl"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="mt-8 text-sm tracking-wider text-green-pale">@arcea.estudio</p>
        </div>
      )}
    </header>
  );
}
