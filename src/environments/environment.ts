/**
 * Configuration applicative publique (embarquée dans le bundle).
 *
 * `supabase.url` / `supabase.anonKey` sont des valeurs PUBLIQUES par conception
 * (la clé « anon » est destinée au client) : la sécurité repose sur les
 * politiques Row Level Security côté Supabase, jamais sur le secret de cette clé.
 *
 * Tant que `url`/`anonKey` sont vides, la synchronisation cloud + l'auth Google
 * sont DÉSACTIVÉES et l'app fonctionne exactement comme avant (localStorage seul,
 * offline-first). Renseignez ces deux champs pour activer le cloud.
 *
 * La clé `service_role` (secrète) n'apparaît JAMAIS ici — elle est réservée au
 * job CI de calcul du classement (secret GitHub).
 */
export const environment = {
  production: false,
  supabase: {
    url: '',
    anonKey: '',
  },
} as const;
