import { ScoreMap } from '../models';

/**
 * Source des résultats officiels (serveur). LECTURE SEULE.
 * En prod : GET d'un fichier statique déployé (édité à la main au fil des matchs).
 */
export interface OfficialResultsPort {
  fetch(): Promise<ScoreMap>;
}
