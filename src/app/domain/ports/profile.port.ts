import { Result } from '../validation/result';

/** Ligne de classement (lecture publique, agrégée par le job serveur). */
export interface LeaderboardRow {
  readonly pseudo: string;
  readonly points: number;
  readonly exact: number;
  readonly outcome: number;
}

/**
 * Profil public (pseudo) + lecture du classement entre joueurs.
 *
 * Le pseudo est unique : `setPseudo` renvoie une erreur si déjà pris.
 */
export interface ProfilePort {
  /** Profil du compte ; `null` si le pseudo n'a pas encore été choisi. */
  get(userId: string): Promise<{ pseudo: string } | null>;
  /** Enregistre le pseudo (échec si déjà utilisé par un autre compte). */
  setPseudo(userId: string, pseudo: string): Promise<Result<void>>;
  /** Classement complet, trié par points décroissants. */
  leaderboard(): Promise<readonly LeaderboardRow[]>;
}
