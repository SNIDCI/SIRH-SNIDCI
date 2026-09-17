import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * ⚠️ Ce client utilise la clé "service_role", qui contourne toutes les règles
 * de sécurité (Row Level Security). Il ne doit JAMAIS être importé dans un
 * composant "use client", ni exposé au navigateur. Utilisation strictement
 * réservée aux Server Actions, après vérification manuelle que l'appelant
 * a bien le rôle admin (voir lib/actions/users.ts).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
