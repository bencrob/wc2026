import { DraftScore, Score, Side, Verdict } from '../models';

/** Compare un pronostic à un résultat officiel (mode « jeu de pronostics »). */
export class PredictionComparator {
  /**
   * @returns "exact" (score identique, même qualifié si nul KO)
   *        | "outcome" (bon vainqueur/nul, score différent)
   *        | "wrong"   (mauvais résultat)
   *        | null      (pas de pronostic complet)
   */
  verdict(pred: DraftScore | undefined, off: Score, isKnockout: boolean): Verdict | null {
    const ph = pred?.home;
    const pa = pred?.away;
    if (typeof ph !== 'number' || typeof pa !== 'number') return null;
    const exactScore = ph === off.home && pa === off.away;

    if (isKnockout) {
      if (exactScore && (off.home !== off.away || pred?.winner === off.winner)) {
        return 'exact';
      }
      const pAdv = this.advancingSide(ph, pa, pred?.winner);
      const oAdv = this.advancingSide(off.home, off.away, off.winner);
      return pAdv && oAdv && pAdv === oAdv ? 'outcome' : 'wrong';
    }

    if (exactScore) return 'exact';
    return Math.sign(ph - pa) === Math.sign(off.home - off.away) ? 'outcome' : 'wrong';
  }

  /** Côté qualifié : meilleur score, sinon le vainqueur aux tirs au but. */
  private advancingSide(home: number, away: number, winner: Side | undefined): Side | null {
    if (home > away) return 'home';
    if (away > home) return 'away';
    return winner ?? null;
  }
}
