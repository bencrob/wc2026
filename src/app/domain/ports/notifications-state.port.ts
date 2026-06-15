import { MatchId } from '../models';

/**
 * Persistance de l'état des notifications in-app (par appareil).
 *
 * Sert à détecter les NOUVEAUX résultats officiels depuis la dernière visite :
 * on mémorise les ids de matchs déjà « vus ». `null` = jamais enregistré
 * (première visite) → on pose une référence sans notifier.
 */
export interface NotificationsStatePort {
  loadSeenOfficial(): readonly MatchId[] | null;
  saveSeenOfficial(ids: readonly MatchId[]): void;
}
