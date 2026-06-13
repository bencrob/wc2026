import { Injectable, inject, signal } from '@angular/core';
import { AuthPort, AuthUser } from '../domain/ports/auth.port';
import { Result, err, ok } from '../domain/validation/result';
import { SupabaseClientProvider } from './supabase.client';

/**
 * Auth Google via Supabase (GoTrue), chargé paresseusement.
 *
 * `currentUser()` reste synchrone (instantané du dernier état de session connu).
 * La restauration de session + l'abonnement `onAuthStateChange` sont déclenchés
 * à la première souscription (`onChange`), ce qui charge le client Supabase à la
 * demande (hors bundle initial). Cloud non configuré → reste anonyme.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseAuthAdapter implements AuthPort {
  private readonly supabase = inject(SupabaseClientProvider);
  private readonly _user = signal<AuthUser | null>(null);
  private readonly listeners = new Set<(user: AuthUser | null) => void>();
  private initialized = false;

  /** Signal de session exposé à l'UI (lecture seule). */
  readonly user = this._user.asReadonly();

  currentUser(): AuthUser | null {
    return this._user();
  }

  async signInWithGoogle(): Promise<void> {
    const client = await this.supabase.getClient();
    if (!client) throw new Error('Synchronisation cloud non configurée.');
    await this.init(); // s'assure que l'écoute de session est branchée
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  }

  async requestEmailCode(email: string): Promise<Result<void>> {
    const client = await this.supabase.getClient();
    if (!client) return err('Synchronisation cloud non configurée.');
    await this.init(); // l'OTP n'implique aucune redirection → init explicite ici
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    return error ? err(error.message) : ok(undefined);
  }

  async verifyEmailCode(email: string, code: string): Promise<Result<void>> {
    const client = await this.supabase.getClient();
    if (!client) return err('Synchronisation cloud non configurée.');
    const { error } = await client.auth.verifyOtp({ email, token: code.trim(), type: 'email' });
    return error ? err(error.message) : ok(undefined);
  }

  async signOut(): Promise<void> {
    const client = await this.supabase.getClient();
    await client?.auth.signOut();
  }

  onChange(cb: (user: AuthUser | null) => void): () => void {
    this.listeners.add(cb);
    cb(this._user()); // émet l'état courant (gère l'abonnement tardif)
    // Perf : ne charge Supabase (≈209 kB) que s'il y a une session à restaurer
    // ou un retour OAuth à traiter. Un visiteur anonyme ne le télécharge jamais.
    if (hasStoredSession() || isOAuthRedirect()) void this.init();
    return () => {
      this.listeners.delete(cb);
    };
  }

  /** Charge le client (lazy) et s'abonne aux changements de session — une seule fois. */
  private async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    const client = await this.supabase.getClient();
    if (!client) return;
    client.auth.onAuthStateChange((_event, session) => {
      const user = toUser(session?.user ?? null);
      this._user.set(user);
      for (const cb of this.listeners) cb(user);
    });
  }
}

function toUser(user: { id: string; email?: string } | null): AuthUser | null {
  if (!user) return null;
  return { id: user.id, email: user.email ?? '' };
}

/** Une session Supabase est-elle déjà stockée localement ? (clé `sb-<ref>-auth-token`) */
function hasStoredSession(): boolean {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('sb-') && key.endsWith('-auth-token')) return true;
    }
  } catch {
    /* localStorage indisponible */
  }
  return false;
}

/** L'URL courante est-elle un retour de redirection OAuth à traiter ? */
function isOAuthRedirect(): boolean {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash;
  if (hash.includes('access_token=') || hash.includes('error=')) return true;
  return new URLSearchParams(window.location.search).has('code');
}
