/**
 * Calcul PUR du classement : (pronostics par joueur, résultats officiels) →
 * lignes de classement triées. Réutilise le moteur de tournoi (même barème que
 * l'app : 3 pts/score exact, 1 pt/bon résultat). Aucune I/O ici → testable.
 */
import { TournamentEngine } from '../../src/app/domain/engines/tournament.engine';
import { DraftScoreMap, ScoreMap } from '../../src/app/domain/models';

export interface PlayerPrediction {
  readonly userId: string;
  readonly pseudo: string;
  readonly scores: DraftScoreMap;
}

export interface LeaderboardEntry {
  readonly user_id: string;
  readonly pseudo: string;
  readonly points: number;
  readonly exact: number;
  readonly outcome: number;
}

export function computeLeaderboard(
  players: readonly PlayerPrediction[],
  official: ScoreMap,
): LeaderboardEntry[] {
  const engine = new TournamentEngine();
  const entries = players.map((player) => {
    const summary = engine.recompute(player.scores, official).comparisonSummary;
    return {
      user_id: player.userId,
      pseudo: player.pseudo,
      points: summary.points,
      exact: summary.exact,
      outcome: summary.outcome,
    };
  });
  // Tri stable : points décroissants, puis scores exacts, puis pseudo.
  return entries.sort(
    (a, b) => b.points - a.points || b.exact - a.exact || a.pseudo.localeCompare(b.pseudo),
  );
}
