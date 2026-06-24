"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ page, pageCount }: { page: number; pageCount: number }) {
  const pathname = usePathname();
  const params = useSearchParams();

  if (pageCount <= 1) return null;

  const href = (p: number) => {
    const q = new URLSearchParams(params.toString());
    q.set("page", String(p));
    return `${pathname}?${q.toString()}`;
  };

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <nav className="mt-14 flex items-center justify-center gap-2">
      <Link
        href={href(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`grid h-10 w-10 place-items-center rounded-full border border-beige ${
          page === 1 ? "pointer-events-none opacity-40" : "hover:border-green hover:text-green"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          className={`grid h-10 w-10 place-items-center rounded-full text-sm font-medium ${
            p === page
              ? "bg-green text-cream"
              : "border border-beige text-ink hover:border-green hover:text-green"
          }`}
        >
          {p}
        </Link>
      ))}

      <Link
        href={href(Math.min(pageCount, page + 1))}
        aria-disabled={page === pageCount}
        className={`grid h-10 w-10 place-items-center rounded-full border border-beige ${
          page === pageCount ? "pointer-events-none opacity-40" : "hover:border-green hover:text-green"
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
