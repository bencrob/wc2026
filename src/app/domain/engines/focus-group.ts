import { GROUP_FIXTURES } from '../data/fixtures';
import { kickoffMsOf } from '../data/schedule';
import { GroupId, MatchId } from '../models';

/**
 * Durée pendant laquelle un match reste considéré « en cours » à partir du coup
 * d'envoi : 90' réglementaires + mi-temps + arrêts de jeu + marge. Au-delà, le
 * match est traité comme terminé.
 */
const MATCH_DURATION_MS = 2 * 60 * 60 * 1000;

interface Candidate {
  readonly id: MatchId;
  readonly group: GroupId;
  readonly kickoff: number;
}

/**
 * Poule à mettre en avant à l'ouverture de la vue :
 *  1. celle d'un match de poule **en cours** (coup d'envoi le plus récent, donc
 *     le plus proche de `now`) ;
 *  2. sinon celle du **prochain** match de poule à venir (coup d'envoi le plus tôt) ;
 *  3. sinon `null` — aucun match de poule daté n'est en cours ni à venir (phase
 *     de groupes terminée). L'appelant choisit alors un repli (groupe A).
 *
 * Pure : ne dépend que du calendrier figé (`GROUP_FIXTURES` + `kickoffMsOf`) et
 * de l'instant `now` (ms epoch). Les matchs sans coup d'envoi daté sont ignorés.
 */
export function selectFocusGroup(now: number): GroupId | null {
  let live: Candidate | null = null;
  let next: Candidate | null = null;

  for (const f of GROUP_FIXTURES) {
    const kickoff = kickoffMsOf(f.id);
    if (kickoff === undefined) continue;

    if (now >= kickoff && now < kickoff + MATCH_DURATION_MS) {
      // En cours : on garde le coup d'envoi le plus récent (le plus proche de now).
      if (live === null || kickoff > live.kickoff || (kickoff === live.kickoff && f.id < live.id)) {
        live = { id: f.id, group: f.groupId, kickoff };
      }
    } else if (kickoff > now) {
      // À venir : on garde le coup d'envoi le plus tôt.
      if (next === null || kickoff < next.kickoff || (kickoff === next.kickoff && f.id < next.id)) {
        next = { id: f.id, group: f.groupId, kickoff };
      }
    }
  }

  return (live ?? next)?.group ?? null;
}
