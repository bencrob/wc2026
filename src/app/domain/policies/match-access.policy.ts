import { MatchId, ScoreMap } from '../models';

/**
 * Règle d'accès en écriture à un match (PURE).
 *
 * Un match passe en LECTURE SEULE dès qu'une des conditions est vraie :
 *  1. un résultat officiel (serveur) existe pour ce match ;
 *  2. le coup d'envoi est passé (l'instant courant a atteint l'heure de début).
 *
 * Le temps est reçu en paramètre (`now`, ms epoch) — la policy ne lit jamais l'horloge.
 */
export class MatchAccessPolicy {
  isEditable(
    id: MatchId,
    official: ScoreMap,
    kickoffMs: number | undefined,
    now: number,
  ): boolean {
    if (official[id] !== undefined) return false;
    if (kickoffMs !== undefined && now >= kickoffMs) return false;
    return true;
  }

  isLocked(id: MatchId, official: ScoreMap, kickoffMs: number | undefined, now: number): boolean {
    return !this.isEditable(id, official, kickoffMs, now);
  }
}
