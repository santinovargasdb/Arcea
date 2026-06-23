import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con SERVICE ROLE: SALTA Row Level Security.
 * Úsalo SOLO en el servidor (webhooks de pago, tareas administrativas que
 * requieran bypass). NUNCA lo importes en componentes de cliente y NUNCA
 * expongas SUPABASE_SERVICE_ROLE_KEY con el prefijo NEXT_PUBLIC_.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
