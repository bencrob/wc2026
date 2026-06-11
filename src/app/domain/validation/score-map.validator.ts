import { KO_ID_SET } from '../data/knockout-structure';
import { Score, ScoreMap } from '../models';
import { err, ok, Result } from './result';

export const SCHEMA_VERSION = 1;

const ID_RE = /^M([1-9]|[1-9]\d|10[0-4])$/; // M1..M104
const isInt = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0;
const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

interface CleanOptions {
  readonly requireWinnerOnKoDraw?: boolean;
}

/**
 * Validateur PUR des tables de scores importées (pronostics ou résultats officiels).
 * Ne lève jamais : renvoie un Result.
 */
export class ScoreMapValidator {
  /** Nettoie/valide une table { matchId → {home,away,winner?} }. */
  cleanScoreMap(map: unknown, opts: CleanOptions = {}): Result<ScoreMap> {
    if (!isObject(map)) return err('table de scores manquante ou invalide.');
    const clean: Record<string, Score> = {};

    for (const [id, raw] of Object.entries(map)) {
      if (!ID_RE.test(id)) return err(`Identifiant de match invalide : ${id}.`);
      if (!isObject(raw)) return err(`Score invalide pour ${id}.`);
      const home = raw['home'];
      const away = raw['away'];
      if (!isInt(home) || !isInt(away)) {
        return err(`Score non entier ≥ 0 pour ${id}.`);
      }
      const isKo = KO_ID_SET.has(id);
      const entry: { home: number; away: number; winner?: 'home' | 'away' } = {
        home,
        away,
      };
      const winner = raw['winner'];
      if (winner !== undefined) {
        if (!isKo) return err(`« winner » interdit pour un match de poule (${id}).`);
        if (winner !== 'home' && winner !== 'away') {
          return err(`« winner » invalide pour ${id} (home|away attendu).`);
        }
        entry.winner = winner;
      }
      if (opts.requireWinnerOnKoDraw && isKo && home === away && entry.winner === undefined) {
        return err(
          `Match à élimination nul (${id}) : précisez le vainqueur aux tirs au but (« winner »).`,
        );
      }
      clean[id] = entry;
    }
    return ok(clean);
  }

  /** Valide des pronostics importés (objet { version, scores }). */
  validatePredictions(data: unknown): Result<ScoreMap> {
    if (!isObject(data)) return err('Le JSON doit être un objet.');
    if (data['version'] !== SCHEMA_VERSION) {
      return err(`Version inattendue (attendu ${SCHEMA_VERSION}).`);
    }
    if (!isObject(data['scores'])) {
      return err('Champ « scores » manquant ou invalide.');
    }
    return this.cleanScoreMap(data['scores']);
  }

  /**
   * Valide des résultats officiels (serveur ou import). Accepte { results } ou { scores }.
   * `version` optionnelle. Exige un vainqueur sur tout match KO nul.
   */
  validateOfficial(data: unknown): Result<ScoreMap> {
    if (!isObject(data)) return err('Le JSON doit être un objet.');
    if (data['version'] !== undefined && data['version'] !== SCHEMA_VERSION) {
      return err(`Version inattendue (attendu ${SCHEMA_VERSION}).`);
    }
    const map = data['results'] ?? data['scores'];
    if (!isObject(map)) return err('Champ « results » manquant ou invalide.');
    return this.cleanScoreMap(map, { requireWinnerOnKoDraw: true });
  }
}
