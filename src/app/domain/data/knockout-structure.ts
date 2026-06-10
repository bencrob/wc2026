import {
  BracketLink,
  GroupId,
  KnockoutPhase,
  MatchId,
  R32Slot,
} from '../models';

/** Phases du tableau final (numéros de match → libellé + bornes). */
export const KO_PHASES: readonly KnockoutPhase[] = [
  { key: 'R32', label: '16es de finale', from: 73, to: 88 },
  { key: 'R16', label: '8es de finale', from: 89, to: 96 },
  { key: 'QF', label: 'Quarts de finale', from: 97, to: 100 },
  { key: 'SF', label: 'Demi-finales', from: 101, to: 102 },
  { key: 'P3', label: 'Match pour la 3e place', from: 103, to: 103 },
  { key: 'F', label: 'Finale', from: 104, to: 104 },
];

/** Liste ordonnée des matchs KO (M73..M104). */
export const KO_MATCH_IDS: readonly MatchId[] = Array.from(
  { length: 32 },
  (_, i) => 'M' + (73 + i),
);

export const KO_ID_SET: ReadonlySet<MatchId> = new Set(KO_MATCH_IDS);

/**
 * 8 créneaux « 3e place » → groupes éligibles.
 * L'ordre des clés = ordre fixe d'exploration du backtracking (déterminisme).
 */
export const THIRD_PLACE_SLOTS: Readonly<Record<MatchId, readonly GroupId[]>> = {
  M74: ['A', 'B', 'C', 'D', 'F'],
  M77: ['C', 'D', 'F', 'G', 'H'],
  M79: ['C', 'E', 'F', 'H', 'I'],
  M80: ['E', 'H', 'I', 'J', 'K'],
  M81: ['B', 'E', 'F', 'I', 'J'],
  M82: ['A', 'E', 'H', 'I', 'J'],
  M85: ['E', 'F', 'G', 'I', 'J'],
  M87: ['D', 'E', 'I', 'J', 'L'],
};

/**
 * 16 matchs des 16es de finale (#73..88) : source de chaque côté.
 * Appariement officiel FIFA (croisé).
 */
export const R32_SLOTS: readonly R32Slot[] = [
  { id: 'M73', home: { kind: 'runnerUp', group: 'A' }, away: { kind: 'runnerUp', group: 'B' } },
  { id: 'M74', home: { kind: 'winner', group: 'E' }, away: { kind: 'third', slot: 'M74' } },
  { id: 'M75', home: { kind: 'winner', group: 'F' }, away: { kind: 'runnerUp', group: 'C' } },
  { id: 'M76', home: { kind: 'winner', group: 'C' }, away: { kind: 'runnerUp', group: 'F' } },
  { id: 'M77', home: { kind: 'winner', group: 'I' }, away: { kind: 'third', slot: 'M77' } },
  { id: 'M78', home: { kind: 'runnerUp', group: 'E' }, away: { kind: 'runnerUp', group: 'I' } },
  { id: 'M79', home: { kind: 'winner', group: 'A' }, away: { kind: 'third', slot: 'M79' } },
  { id: 'M80', home: { kind: 'winner', group: 'L' }, away: { kind: 'third', slot: 'M80' } },
  { id: 'M81', home: { kind: 'winner', group: 'D' }, away: { kind: 'third', slot: 'M81' } },
  { id: 'M82', home: { kind: 'winner', group: 'G' }, away: { kind: 'third', slot: 'M82' } },
  { id: 'M83', home: { kind: 'runnerUp', group: 'K' }, away: { kind: 'runnerUp', group: 'L' } },
  { id: 'M84', home: { kind: 'winner', group: 'H' }, away: { kind: 'runnerUp', group: 'J' } },
  { id: 'M85', home: { kind: 'winner', group: 'B' }, away: { kind: 'third', slot: 'M85' } },
  { id: 'M86', home: { kind: 'winner', group: 'J' }, away: { kind: 'runnerUp', group: 'H' } },
  { id: 'M87', home: { kind: 'winner', group: 'K' }, away: { kind: 'third', slot: 'M87' } },
  { id: 'M88', home: { kind: 'runnerUp', group: 'D' }, away: { kind: 'runnerUp', group: 'G' } },
];

/**
 * Liens du bracket : winnerTo (+ loserTo sur les demies → 3e place M103).
 * Appariement OFFICIEL FIFA (croisé).
 */
export const BRACKET_LINKS: readonly BracketLink[] = [
  // 16es → 8es
  { match: 'M73', winnerTo: { match: 'M90', side: 'home' } },
  { match: 'M74', winnerTo: { match: 'M89', side: 'home' } },
  { match: 'M75', winnerTo: { match: 'M90', side: 'away' } },
  { match: 'M76', winnerTo: { match: 'M91', side: 'home' } },
  { match: 'M77', winnerTo: { match: 'M89', side: 'away' } },
  { match: 'M78', winnerTo: { match: 'M91', side: 'away' } },
  { match: 'M79', winnerTo: { match: 'M92', side: 'home' } },
  { match: 'M80', winnerTo: { match: 'M92', side: 'away' } },
  { match: 'M81', winnerTo: { match: 'M94', side: 'home' } },
  { match: 'M82', winnerTo: { match: 'M94', side: 'away' } },
  { match: 'M83', winnerTo: { match: 'M93', side: 'home' } },
  { match: 'M84', winnerTo: { match: 'M93', side: 'away' } },
  { match: 'M85', winnerTo: { match: 'M96', side: 'home' } },
  { match: 'M86', winnerTo: { match: 'M95', side: 'home' } },
  { match: 'M87', winnerTo: { match: 'M96', side: 'away' } },
  { match: 'M88', winnerTo: { match: 'M95', side: 'away' } },
  // 8es → quarts
  { match: 'M89', winnerTo: { match: 'M97', side: 'home' } },
  { match: 'M90', winnerTo: { match: 'M97', side: 'away' } },
  { match: 'M91', winnerTo: { match: 'M99', side: 'home' } },
  { match: 'M92', winnerTo: { match: 'M99', side: 'away' } },
  { match: 'M93', winnerTo: { match: 'M98', side: 'home' } },
  { match: 'M94', winnerTo: { match: 'M98', side: 'away' } },
  { match: 'M95', winnerTo: { match: 'M100', side: 'home' } },
  { match: 'M96', winnerTo: { match: 'M100', side: 'away' } },
  // quarts → demies
  { match: 'M97', winnerTo: { match: 'M101', side: 'home' } },
  { match: 'M98', winnerTo: { match: 'M101', side: 'away' } },
  { match: 'M99', winnerTo: { match: 'M102', side: 'home' } },
  { match: 'M100', winnerTo: { match: 'M102', side: 'away' } },
  // demies → finale + 3e place (perdants)
  { match: 'M101', winnerTo: { match: 'M104', side: 'home' }, loserTo: { match: 'M103', side: 'home' } },
  { match: 'M102', winnerTo: { match: 'M104', side: 'away' }, loserTo: { match: 'M103', side: 'away' } },
];

/** Index des liens par match source (accès O(1)). */
export const BRACKET_LINK_BY_MATCH: ReadonlyMap<MatchId, BracketLink> = new Map(
  BRACKET_LINKS.map((l) => [l.match, l]),
);
