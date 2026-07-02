import { describe, expect, test } from 'vitest';
import { GROUP_FIXTURES } from '../../src/app/domain/data/fixtures';
import { teamName } from '../../src/app/domain/data/teams';
import { TournamentEngine } from '../../src/app/domain/engines/tournament.engine';
import { MatchId, Score, ScoreMap } from '../../src/app/domain/models';
import { required } from '../../src/app/domain/util/required';
import { buildResults, orient, penaltyWinner, pairKey } from './map-results';
import { FeedMatch } from './sports-api';

const ALWAYS_DUE = { isDue: (): boolean => true };
const suffix = (teamId: string): number => Number(teamId.slice(1));

/** A finished feed match, addressed by team NAMES (resolved by team-map). */
function feedMatch(homeId: string, awayId: string, home: number, away: number, opts: Partial<FeedMatch['score']> = {}): FeedMatch {
  return {
    id: 0,
    utcDate: '2026-06-12T19:00:00Z',
    status: 'FINISHED',
    stage: 'GROUP_STAGE',
    homeTeam: { name: required(teamName(homeId), homeId) },
    awayTeam: { name: required(teamName(awayId), awayId) },
    score: { winner: 'HOME_TEAM', duration: 'REGULAR', fullTime: { home, away }, ...opts },
  };
}

/** Full group stage where the lower-suffix team always wins 1–0 (deterministic ranking). */
function fullGroupBase(): ScoreMap {
  const map: Record<MatchId, Score> = {};
  for (const f of GROUP_FIXTURES) {
    map[f.id] = suffix(f.home) < suffix(f.away) ? { home: 1, away: 0 } : { home: 0, away: 1 };
  }
  return map;
}

describe('pure helpers', () => {
  test('pairKey is order-independent', () => {
    expect(pairKey('A1', 'B2')).toBe(pairKey('B2', 'A1'));
  });

  test('orient keeps our fixture orientation', () => {
    expect(orient('A1', 'A1', 2, 0)).toEqual({ home: 2, away: 0 });
    expect(orient('A1', 'A4', 1, 0)).toEqual({ home: 0, away: 1 }); // feed home ≠ our home → flip
  });

  test('penaltyWinner maps the shootout winner to our orientation', () => {
    const m = feedMatch('A2', 'B2', 1, 1, { winner: 'AWAY_TEAM', duration: 'PENALTY_SHOOTOUT' });
    expect(penaltyWinner(m, 'A2', 'B2', 'A2')).toBe('away'); // away team won, our home is A2
    expect(penaltyWinner(m, 'A2', 'B2', 'B2')).toBe('home'); // same winner, flipped orientation
  });
});

describe('buildResults — group stage', () => {
  test('maps a group result with correct orientation', () => {
    // M1 = A1 (Mexique, home) vs A2 (Afrique du Sud, away)
    const { results, addedIds } = buildResults([feedMatch('A1', 'A2', 2, 0)], {}, ALWAYS_DUE);
    expect(results['M1']).toEqual({ home: 2, away: 0 });
    expect(addedIds).toContain('M1');
  });

  test('flips the score when the feed home is our fixture away', () => {
    // M5 = A4 (Tchéquie, home) vs A1 (Mexique, away); feed reports Mexico (home) 1–0.
    const { results } = buildResults([feedMatch('A1', 'A4', 1, 0)], {}, ALWAYS_DUE);
    expect(results['M5']).toEqual({ home: 0, away: 1 });
  });

  test('manual entries win (never overwritten)', () => {
    const base: ScoreMap = { M1: { home: 9, away: 9 } };
    const { results, addedIds } = buildResults([feedMatch('A1', 'A2', 2, 0)], base, ALWAYS_DUE);
    expect(results['M1']).toEqual({ home: 9, away: 9 });
    expect(addedIds).not.toContain('M1');
  });

  test('skips a match that is not due yet', () => {
    const { results, addedIds } = buildResults([feedMatch('A1', 'A2', 2, 0)], {}, {
      isDue: (id) => id !== 'M1',
    });
    expect(results['M1']).toBeUndefined();
    expect(addedIds).not.toContain('M1');
  });

  test('reports diagnostic counts', () => {
    const out = buildResults([feedMatch('A1', 'A2', 2, 0), feedMatch('A1', 'A4', 1, 0)], {}, ALWAYS_DUE);
    expect(out.finishedCount).toBe(2);
    expect(out.recognizedCount).toBe(2);
    expect(out.mappedCount).toBe(2);
    expect([...out.addedIds].sort()).toEqual(['M1', 'M5']);
  });

  test('flags finished-but-unmapped (wrong-edition smell)', () => {
    // A1 (Mexique) vs B1 (Canada): not a group fixture, and KO unseeded (empty base) → 0 mapped.
    const out = buildResults([feedMatch('A1', 'B1', 1, 0)], {}, ALWAYS_DUE);
    expect(out.finishedCount).toBe(1);
    expect(out.recognizedCount).toBe(1);
    expect(out.mappedCount).toBe(0);
    expect(out.addedIds).toEqual([]);
  });
});

describe('buildResults — knockout', () => {
  test('maps a KO result + penalty winner using engine seeding', () => {
    const base = fullGroupBase();
    const seeded = new TournamentEngine().recompute({}, base).knockout['M73'];
    const homeId = required(seeded?.home, 'M73 home');
    const awayId = required(seeded?.away, 'M73 away');

    // Feed reports the M73 pairing as a 1–1 draw won on penalties by the AWAY side.
    const ko = feedMatch(homeId, awayId, 1, 1, { winner: 'AWAY_TEAM', duration: 'PENALTY_SHOOTOUT' });
    const { results, addedIds } = buildResults([ko], base, ALWAYS_DUE);

    expect(results['M73']).toEqual({ home: 1, away: 1, winner: 'away' });
    expect(addedIds).toEqual(['M73']);
  });

  test('KO à t.a.b. : garde le score du terrain (regularTime), jamais les tirs au but', () => {
    const base = fullGroupBase();
    const seeded = new TournamentEngine().recompute({}, base).knockout['M73'];
    const homeId = required(seeded?.home, 'M73 home');
    const awayId = required(seeded?.away, 'M73 away');

    // Le flux gonfle fullTime avec les t.a.b. (5–6), mais regularTime = 1–1 (réel).
    const ko = feedMatch(homeId, awayId, 5, 6, {
      winner: 'AWAY_TEAM',
      duration: 'PENALTY_SHOOTOUT',
      regularTime: { home: 1, away: 1 },
      penalties: { home: 3, away: 4 },
    });
    const { results } = buildResults([ko], base, ALWAYS_DUE);

    // 1–1 (terrain) + vainqueur t.a.b. — surtout PAS 5–6.
    expect(results['M73']).toEqual({ home: 1, away: 1, winner: 'away' });
  });

  test('KO décisif en prolongation : regularTime + extraTime, sans t.a.b.', () => {
    const base = fullGroupBase();
    const seeded = new TournamentEngine().recompute({}, base).knockout['M73'];
    const homeId = required(seeded?.home, 'M73 home');
    const awayId = required(seeded?.away, 'M73 away');

    const ko = feedMatch(homeId, awayId, 2, 1, {
      winner: 'HOME_TEAM',
      duration: 'EXTRA_TIME',
      regularTime: { home: 1, away: 1 },
      extraTime: { home: 1, away: 0 },
    });
    const { results } = buildResults([ko], base, ALWAYS_DUE);

    expect(results['M73']).toEqual({ home: 2, away: 1 }); // décisif → pas de winner
  });

  test('skips a KO draw with no shootout winner (would be invalid)', () => {
    const base = fullGroupBase();
    const seeded = new TournamentEngine().recompute({}, base).knockout['M73'];
    const homeId = required(seeded?.home, 'M73 home');
    const awayId = required(seeded?.away, 'M73 away');

    const ko = feedMatch(homeId, awayId, 0, 0, { winner: 'DRAW', duration: 'REGULAR' });
    const { results, addedIds } = buildResults([ko], base, ALWAYS_DUE);

    expect(results['M73']).toBeUndefined();
    expect(addedIds).toEqual([]);
  });
});
