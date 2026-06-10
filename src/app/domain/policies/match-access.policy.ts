import { MatchId, ScoreMap } from '../models';

/**
 * Règle d'accès en écriture à un match (PURE).
 *
 * Principe : dès qu'un résultat officiel (serveur) existe pour un match,
 * celui-ci est en LECTURE SEULE — l'utilisateur ne peut plus saisir son score.
 */
export class MatchAccessPolicy {
  isEditable(id: MatchId, official: ScoreMap): boolean {
    return official[id] === undefined;
  }

  isLocked(id: MatchId, official: ScoreMap): boolean {
    return !this.isEditable(id, official);
  }
}
