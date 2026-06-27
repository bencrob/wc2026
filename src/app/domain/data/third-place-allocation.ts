import { GroupId, MatchId } from '../models';
import { THIRD_PLACE_ALLOCATION } from './third-place-allocation.data';

/** Ré-exporté pour les invariants de données (intégrité de la table). */
export { THIRD_PLACE_ALLOCATION };

/**
 * Clé d'une combinaison de 8 groupes 3es qualifiés : leurs lettres TRIÉES et
 * concaténées (ex. `['F','A',…] → "ABCDEF…"`). Unique source du format de clé.
 */
export function thirdPlaceComboKey(groups: readonly GroupId[]): string {
  return [...groups].sort().join('');
}

/**
 * Affectation officielle FIFA 2026 (Annexe C) des 8 meilleurs 3es aux créneaux R32,
 * pour la combinaison des 8 groupes qualifiés.
 *
 * @returns créneau (matchId) → groupe dont le 3e y est placé, ou `null` si la
 *          combinaison est inconnue (jamais pour une vraie combinaison de 8 groupes :
 *          les 495 sont couvertes — cf. data-invariants.spec).
 */
export function officialThirdPlaceAllocation(
  qualifiedGroups: readonly GroupId[],
): Readonly<Record<MatchId, GroupId>> | null {
  return THIRD_PLACE_ALLOCATION[thirdPlaceComboKey(qualifiedGroups)] ?? null;
}
