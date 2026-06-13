import { Injectable } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

/**
 * Fournit le client Supabase (singleton), chargé **paresseusement**.
 *
 * `@supabase/supabase-js` est importé dynamiquement (chunk séparé) à la première
 * utilisation : il ne pèse donc PAS sur le bundle initial, et n'est même jamais
 * téléchargé si le cloud n'est pas configuré (URL / clé anon vides) → l'app reste
 * en local pur (offline-first) sans surcoût.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseClientProvider {
  private clientPromise: Promise<SupabaseClient | null> | null = null;

  /** `true` si le cloud est configuré (sans charger la lib). */
  get configured(): boolean {
    const { url, anonKey } = environment.supabase;
    return Boolean(url && anonKey);
  }

  /** Client Supabase (créé à la demande), ou `null` si non configuré. */
  getClient(): Promise<SupabaseClient | null> {
    if (this.clientPromise) return this.clientPromise;
    if (!this.configured) return Promise.resolve(null);
    this.clientPromise = this.create();
    return this.clientPromise;
  }

  private async create(): Promise<SupabaseClient | null> {
    const { url, anonKey } = environment.supabase;
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
}
