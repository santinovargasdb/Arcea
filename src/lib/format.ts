const ARS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Formatea un precio guardado en CENTAVOS (integer) a moneda ARS.
 * Ej: 4890000 -> "$ 48.900"
 */
export function formatPrice(cents: number): string {
  return ARS.format(Math.round(cents / 100));
}
