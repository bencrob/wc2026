import {
  BRACKET_LINK_BY_MATCH,
  KO_MATCH_IDS,
  R32_SLOTS,
} from '../data/knockout-structure';
import {
  KnockoutBracket,
  MatchId,
  Qualifiers,
  ScoreMap,
  SlotSource,
  TeamId,
} from '../models';

/** Seed des 16es + propagation des vainqueurs (et perdants des demies → 3e place). PUR. */
export class KnockoutStageEngine {
  buildAndPropagate(
    qualifiers: Qualifiers,
    thirdAssignment: Record<MatchId, TeamId>,
    scores: ScoreMap,
  ): KnockoutBracket {
    const ko: KnockoutBracket = {};
    for (const id of KO_MATCH_IDS) {
      ko[id] = {
        id,
        home: null,
        away: null,
        homeScore: null,
        awayScore: null,
        winner: null,
        loser: null,
        decided: false,
        needsAttention: false,
      };
    }

    // 1. Seed des 16es (M73..M88)
    const resolveSide = (src: SlotSource): TeamId | null => {
      if (src.kind === 'winner') return qualifiers.winners[src.group] ?? null;
      if (src.kind === 'runnerUp') return qualifiers.runnersUp[src.group] ?? null;
      return thirdAssignment[src.slot] ?? null;
    };
    for (const slot of R32_SLOTS) {
      const m = ko[slot.id];
      if (!m) continue;
      m.home = resolveSide(slot.home);
      m.away = resolveSide(slot.away);
    }

    // 2. Passe linéaire M73 → M104 (ordre topologique : tout match
    //    alimentant un autre porte un numéro inférieur).
    for (const id of KO_MATCH_IDS) {
      const m = ko[id];
      if (!m) continue;
      const sc = scores[id];
      if (m.home === null || m.away === null) continue;
      if (!sc || !Number.isInteger(sc.home) || !Number.isInteger(sc.away)) continue;

      m.homeScore = sc.home;
      m.awayScore = sc.away;
      let winSide: 'home' | 'away';
      if (sc.home > sc.away) winSide = 'home';
      else if (sc.away > sc.home) winSide = 'away';
      else if (sc.winner === 'home' || sc.winner === 'away') winSide = sc.winner;
      else {
        m.needsAttention = true; // nul sans TAB → propagation bloquée
        continue;
      }

      m.decided = true;
      m.winner = winSide === 'home' ? m.home : m.away;
      m.loser = winSide === 'home' ? m.away : m.home;

      const link = BRACKET_LINK_BY_MATCH.get(id);
      if (!link) continue;
      if (link.winnerTo) {
        const target = ko[link.winnerTo.match];
        if (target) target[link.winnerTo.side] = m.winner;
      }
      if (link.loserTo) {
        const target = ko[link.loserTo.match];
        if (target) target[link.loserTo.side] = m.loser;
      }
    }
    return ko;
  }
}

/** Compte les matchs entièrement renseignés parmi `ids`. */
export function countEntered(scores: ScoreMap, ids: readonly MatchId[]): number {
  let n = 0;
  for (const id of ids) {
    const sc = scores[id];
    if (sc && Number.isInteger(sc.home) && Number.isInteger(sc.away)) n++;
  }
  return n;
}
