import { Injectable, inject } from '@angular/core';
import { DraftScoreMap } from '../domain/models';
import { RemotePredictionsPort } from '../domain/ports/remote-predictions.port';
import { SCHEMA_VERSION, ScoreMapValidator } from '../domain/validation/score-map.validator';
import { SupabaseClientProvider } from './supabase.client';

/**
 * Persistance distante des pronostics (table `predictions`, 1 ligne/compte).
 * La RLS garantit qu'un compte ne touche que sa propre ligne ; `userId` est
 * une ceinture-bretelles. Les payloads relus sont TOUJOURS revalidés.
 */
@Injectable({ providedIn: 'root' })
export class SupabasePredictionsAdapter implements RemotePredictionsPort {
  private readonly supabase = inject(SupabaseClientProvider);
  private readonly validator = new ScoreMapValidator();

  async load(userId: string): Promise<DraftScoreMap | null> {
    const client = await this.supabase.getClient();
    if (!client) return null;
    const { data, error } = await client
      .from('predictions')
      .select('scores, version')
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data) return null;
    const res = this.validator.validatePredictions({
      version: data.version,
      scores: data.scores,
    });
    return res.ok ? res.value : null;
  }

  async save(userId: string, map: DraftScoreMap): Promise<void> {
    const client = await this.supabase.getClient();
    if (!client) return;
    const { error } = await client.from('predictions').upsert(
      { user_id: userId, scores: map, version: SCHEMA_VERSION },
      { onConflict: 'user_id' },
    );
    if (error) throw error;
  }
}
