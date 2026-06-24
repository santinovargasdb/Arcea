/**
 * ¿Hay Supabase configurado? Permite que la app corra sin backend:
 * el catálogo cae a datos seed y la auth se desactiva con un aviso
 * mientras no exista .env.local.
 */
export const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
