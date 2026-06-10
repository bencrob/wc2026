import { Score, Verdict } from '../models';

/** Compare un pronostic à un résultat officiel (mode « jeu de pronostics »). */
export class PredictionComparator {
  /**
   * @returns "exact" (score identique, même qualifié si nul KO)
   *        | "outcome" (bon vainqueur/nul, score différent)
   *        | "wrong"   (mauvais résultat)
   *        | null      (pas de pronostic complet)
   */
  verdict(
    pred: Score | undefined,
    off: Score,
    isKnockout: boolean,
  ): Verdict | null {
    if (!pred || !Number.isInteger(pred.home) || !Number.isInteger(pred.away)) {
      return null;
    }
    const exactScore = pred.home === off.home && pred.away === off.away;

    if (isKnockout) {
      if (exactScore && (off.home !== off.away || pred.winner === off.winner)) {
        return 'exact';
      }
      const pAdv = this.advancingSide(pred);
      const oAdv = this.advancingSide(off);
      return pAdv && oAdv && pAdv === oAdv ? 'outcome' : 'wrong';
    }

    if (exactScore) return 'exact';
    return Math.sign(pred.home - pred.away) === Math.sign(off.home - off.away)
      ? 'outcome'
      : 'wrong';
  }

  /** Côté qualifié : meilleur score, sinon le vainqueur aux tirs au but. */
  private advancingSide(s: Score): 'home' | 'away' | null {
    if (s.home > s.away) return 'home';
    if (s.away > s.home) return 'away';
    return s.winner ?? null;
  }
}
