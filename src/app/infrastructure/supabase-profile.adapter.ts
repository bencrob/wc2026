import { Injectable, inject } from '@angular/core';
import { LeaderboardRow, ProfilePort } from '../domain/ports/profile.port';
import { Result, err, ok } from '../domain/validation/result';
import { SupabaseClientProvider } from './supabase.client';

const UNIQUE_VIOLATION = '23505';

/**
 * Profil public (pseudo, unique) + lecture du classement.
 * La table `leaderboard` est dénormalisée (pseudo inclus) et alimentée par le
 * job serveur ; ici, simple lecture publique triée par points.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseProfileAdapter implements ProfilePort {
  private readonly supabase = inject(SupabaseClientProvider);

  async get(userId: string): Promise<{ pseudo: string } | null> {
    const client = this.supabase.client;
    if (!client) return null;
    const { data, error } = await client
      .from('profiles')
      .select('pseudo')
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data) return null;
    return { pseudo: data.pseudo };
  }

  async setPseudo(userId: string, pseudo: string): Promise<Result<void>> {
    const client = this.supabase.client;
    if (!client) return err('Synchronisation cloud non configurée.');
    const trimmed = pseudo.trim();
    if (trimmed.length < 2 || trimmed.length > 24) {
      return err('Le pseudo doit faire entre 2 et 24 caractères.');
    }
    const { error } = await client
      .from('profiles')
      .upsert({ user_id: userId, pseudo: trimmed }, { onConflict: 'user_id' });
    if (error) {
      return err(error.code === UNIQUE_VIOLATION ? 'Ce pseudo est déjà pris.' : error.message);
    }
    return ok(undefined);
  }

  async leaderboard(): Promise<readonly LeaderboardRow[]> {
    const client = this.supabase.client;
    if (!client) return [];
    const { data, error } = await client
      .from('leaderboard')
      .select('pseudo, points, exact, outcome')
      .order('points', { ascending: false });
    if (error || !data) return [];
    return data.map((r) => ({
      pseudo: r.pseudo,
      points: r.points,
      exact: r.exact,
      outcome: r.outcome,
    }));
  }
}
