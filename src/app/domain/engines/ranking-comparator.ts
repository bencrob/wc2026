import { TeamId } from '../models';

/** Champs minimaux nécessaires au départage (ISP). */
export interface RankableRow {
  readonly teamId: TeamId;
  readonly points: number;
  readonly gd: number;
  readonly gf: number;
}

/**
 * Stratégie de départage du classement (OCP).
 * Permet d'ajouter une règle (ex. confrontation directe) sans toucher au moteur.
 */
export interface RankingComparator {
  compare(a: RankableRow, b: RankableRow): number;
}

/**
 * Départage par défaut (spec simplifiée) :
 * points → diff. de buts → buts marqués → id (départage déterministe, signalé en UI).
 */
export class DefaultRankingComparator implements RankingComparator {
  compare(a: RankableRow, b: RankableRow): number {
    return (
      b.points - a.points ||
      b.gd - a.gd ||
      b.gf - a.gf ||
      a.teamId.localeCompare(b.teamId)
    );
  }
}
