import { GROUP_FIXTURES } from '../data/fixtures';
import { THIRD_PLACE_SLOTS } from '../data/knockout-structure';
import { GROUPS, TEAMS_BY_GROUP } from '../data/teams';
import {
  DraftScoreMap,
  GroupId,
  GroupResult,
  MatchId,
  StandingRow,
  ThirdPlaceRow,
  ThirdRanking,
} from '../models';
import { required } from '../util/required';
import { DefaultRankingComparator, RankingComparator } from './ranking-comparator';

const SLOT_ORDER: readonly MatchId[] = Object.keys(THIRD_PLACE_SLOTS);

/** Classements, 3es, affectation des créneaux R32 (PUR). */
export class GroupStageEngine {
  constructor(
    private readonly comparator: RankingComparator = new DefaultRankingComparator(),
  ) {}

  /** Classement d'un groupe à partir des scores effectifs. */
  computeGroupStandings(groupId: GroupId, scores: DraftScoreMap): GroupResult {
    const teamIds = TEAMS_BY_GROUP.get(groupId) ?? [];
    const rows = new Map<string, StandingRow>(
      teamIds.map((id) => [
        id,
        { teamId: id, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0, rank: 0 },
      ]),
    );

    const fixtures = GROUP_FIXTURES.filter((f) => f.groupId === groupId);
    let entered = 0;
    for (const f of fixtures) {
      const sc = scores[f.id];
      const home = sc?.home;
      const away = sc?.away;
      if (typeof home !== 'number' || typeof away !== 'number') continue;
      const h = rows.get(f.home);
      const a = rows.get(f.away);
      if (!h || !a) continue;
      entered++;
      h.played++;
      a.played++;
      h.gf += home;
      h.ga += away;
      a.gf += away;
      a.ga += home;
      if (home > away) {
        h.won++;
        a.lost++;
        h.points += 3;
      } else if (home < away) {
        a.won++;
        h.lost++;
        a.points += 3;
      } else {
        h.drawn++;
        a.drawn++;
        h.points++;
        a.points++;
      }
    }
    for (const row of rows.values()) row.gd = row.gf - row.ga;

    const standings = [...rows.values()].sort((x, y) => this.comparator.compare(x, y));
    standings.forEach((r, i) => (r.rank = i + 1));

    // Égalités non départagées par pts/diff/buts (info UI).
    const tiedRanks = new Set<number>();
    for (let i = 1; i < standings.length; i++) {
      const p = standings[i - 1];
      const c = standings[i];
      if (p && c && p.points === c.points && p.gd === c.gd && p.gf === c.gf) {
        tiedRanks.add(p.rank);
        tiedRanks.add(c.rank);
      }
    }
    return { standings, complete: entered === fixtures.length, tiedRanks };
  }

  /**
   * Classe les 12 troisièmes ; flag « qualified » sur le top 8.
   * Significatif (resolved) seulement si les 12 groupes sont complets.
   */
  rankThirdPlaced(groupResults: ReadonlyMap<GroupId, GroupResult>): ThirdRanking {
    const allComplete = GROUPS.every((g) => groupResults.get(g)?.complete ?? false);
    const thirds: ThirdPlaceRow[] = GROUPS.map((g) => {
      const result = required(groupResults.get(g), `groupe ${g} manquant`);
      const r = required(result.standings[2], `3e du groupe ${g} manquant`);
      return { teamId: r.teamId, groupId: g, points: r.points, gd: r.gd, gf: r.gf, rank: 0, qualified: false };
    }).sort((x, y) => this.comparator.compare(x, y));

    thirds.forEach((t, i) => {
      t.rank = i + 1;
      t.qualified = allComplete && i < 8;
    });
    return { ranking: thirds, resolved: allComplete };
  }

  /**
   * Affecte les 8 groupes 3es qualifiés aux 8 créneaux R32 (backtracking).
   * Le glouton échoue ~80 % du temps → backtracking obligatoire.
   * @returns slotId → groupId, ou null (garde défensive, jamais atteint pour les 495 combos).
   */
  assignThirdPlaceSlots(qualifiedGroups: readonly GroupId[]): Record<MatchId, GroupId> | null {
    const qualified = new Set<GroupId>(qualifiedGroups);
    const candidates: GroupId[][] = SLOT_ORDER.map((slot) =>
      [...(THIRD_PLACE_SLOTS[slot] ?? [])].filter((g) => qualified.has(g)).sort(),
    );

    const used = new Set<GroupId>();
    const assign: Record<MatchId, GroupId> = {};
    const solve = (i: number): boolean => {
      if (i === SLOT_ORDER.length) return true;
      const slot = required(SLOT_ORDER[i], `créneau ${i} manquant`);
      for (const g of candidates[i] ?? []) {
        if (used.has(g)) continue;
        used.add(g);
        assign[slot] = g;
        if (solve(i + 1)) return true;
        used.delete(g);
        delete assign[slot];
      }
      return false;
    };
    return solve(0) ? { ...assign } : null;
  }
}
