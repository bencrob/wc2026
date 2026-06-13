import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

/**
 * Fournit le client Supabase (singleton) à partir de la config publique.
 *
 * Si l'URL / la clé anon ne sont pas renseignées, `client` vaut `null` :
 * tous les adaptateurs cloud passent alors en mode « désactivé » et l'app
 * reste en local pur (offline-first), sans erreur.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseClientProvider {
  readonly client: SupabaseClient | null = createIfConfigured();

  /** `true` si le cloud (auth + base) est configuré et disponible. */
  get configured(): boolean {
    return this.client !== null;
  }
}

function createIfConfigured(): SupabaseClient | null {
  const { url, anonKey } = environment.supabase;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
}
