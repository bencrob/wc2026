import { Injectable, inject, signal } from '@angular/core';
import { AuthPort, AuthUser } from '../domain/ports/auth.port';
import { SupabaseClientProvider } from './supabase.client';

/**
 * Auth Google via Supabase (GoTrue). Maintient un instantané synchrone de la
 * session (`signal`) alimenté par `onAuthStateChange`, plus un jeu d'écouteurs
 * pour l'orchestration applicative.
 *
 * Cloud non configuré → reste anonyme (`currentUser()` = null, `signIn` refuse).
 */
@Injectable({ providedIn: 'root' })
export class SupabaseAuthAdapter implements AuthPort {
  private readonly supabase = inject(SupabaseClientProvider);
  private readonly _user = signal<AuthUser | null>(null);
  private readonly listeners = new Set<(user: AuthUser | null) => void>();

  /** Signal de session exposé à l'UI (lecture seule). */
  readonly user = this._user.asReadonly();

  constructor() {
    const client = this.supabase.client;
    if (!client) return;
    client.auth.onAuthStateChange((_event, session) => {
      const user = toUser(session?.user ?? null);
      this._user.set(user);
      for (const cb of this.listeners) cb(user);
    });
  }

  currentUser(): AuthUser | null {
    return this._user();
  }

  async signInWithGoogle(): Promise<void> {
    const client = this.supabase.client;
    if (!client) throw new Error('Synchronisation cloud non configurée.');
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    await this.supabase.client?.auth.signOut();
  }

  onChange(cb: (user: AuthUser | null) => void): () => void {
    this.listeners.add(cb);
    cb(this._user()); // émet l'état courant (gère l'abonnement tardif post-restauration)
    return () => {
      this.listeners.delete(cb);
    };
  }
}

function toUser(user: { id: string; email?: string } | null): AuthUser | null {
  if (!user) return null;
  return { id: user.id, email: user.email ?? '' };
}
