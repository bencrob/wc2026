import { GROUP_FIXTURES } from '../data/fixtures';
import { THIRD_PLACE_ALLOCATION } from '../data/third-place-allocation';
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
   * Affecte les 8 groupes 3es qualifiés aux 8 créneaux R32 selon la table
   * OFFICIELLE FIFA 2026 (Annexe C → THIRD_PLACE_ALLOCATION).
   *
   * On consulte la table par la combinaison des 8 groupes (clé = lettres triées).
   * Indispensable : pour une même combinaison plusieurs affectations respectent les
   * contraintes d'éligibilité, mais une seule est l'officielle — un calcul local
   * (glouton/backtracking) tomberait souvent sur une autre.
   *
   * @returns créneau (matchId) → groupId, ou null si la combinaison est inconnue
   *          (jamais atteint pour les 495 combinaisons de 8 groupes).
   */
  assignThirdPlaceSlots(qualifiedGroups: readonly GroupId[]): Record<MatchId, GroupId> | null {
    const key = [...qualifiedGroups].sort().join('');
    const allocation = THIRD_PLACE_ALLOCATION[key];
    return allocation ? { ...allocation } : null;
  }
}
