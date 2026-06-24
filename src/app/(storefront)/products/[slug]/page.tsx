import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getProductBySlug } from "@/lib/db/queries";
import { formatPrice } from "@/lib/format";
import { AddToCart } from "@/components/cart/add-to-cart";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-green-mid transition-colors hover:text-burgundy"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a la colección
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
        {/* Galería */}
        <div className="grid gap-3">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-beige-soft">
            {product.image && (
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {product.images.slice(1, 4).map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-xl bg-beige-soft"
                >
                  <Image
                    src={src}
                    alt={`${product.name} ${i + 2}`}
                    fill
                    sizes="33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:py-4">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-green-mid">
            {product.categoryName}
          </span>
          <h1 className="mt-3 font-heading text-4xl font-medium text-green sm:text-5xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-medium text-green">
              {formatPrice(product.basePrice)}
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-ink/50 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="mt-6 max-w-prose leading-relaxed text-ink/80">
            {product.description}
          </p>

          {/* Stock */}
          <p className="mt-6 text-sm">
            {lowStock ? (
              <span className="font-medium text-burgundy">¡Últimas unidades!</span>
            ) : (
              <span className="text-green-mid">En stock</span>
            )}
          </p>

          {/* Selección de variante + agregar al carrito */}
          <div className="mt-6">
            <AddToCart
              slug={product.slug}
              name={product.name}
              image={product.image}
              basePrice={product.basePrice}
              sizes={product.sizes}
              colors={product.colors}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
