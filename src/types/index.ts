/**
 * Tipos compartidos del dominio.
 *
 * Los tipos de la base de datos se generarán con:
 *   supabase gen types typescript --linked > src/types/database.types.ts
 * (a partir de la Fase 1, cuando existan las migraciones).
 */

export type UserRole = "customer" | "admin";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export {};
