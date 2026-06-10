import { describe, expect, it } from 'vitest';
import { KO_MATCH_IDS } from '../data/knockout-structure';
import { GroupId, Qualifiers, ScoreMap, TeamId } from '../models';
import { KnockoutStageEngine } from './knockout-stage.engine';

const engine = new KnockoutStageEngine();
const GROUP_IDS: GroupId[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

function buildQualifiers(): Qualifiers {
  const winners: Partial<Record<GroupId, TeamId>> = {};
  const runnersUp: Partial<Record<GroupId, TeamId>> = {};
  for (const g of GROUP_IDS) {
    winners[g] = `${g}1`;
    runnersUp[g] = `${g}2`;
  }
  return { winners, runnersUp, bestThirds: [] };
}

const thirdAssignment: Record<string, TeamId> = {
  M74: 'A3', M77: 'C3', M79: 'F3', M80: 'E3',
  M81: 'B3', M82: 'H3', M85: 'G3', M87: 'D3',
};

/** Tous les KO en victoire à domicile 1-0. */
function allHomeWins(): ScoreMap {
  const m: Record<string, { home: number; away: number }> = {};
  for (const id of KO_MATCH_IDS) m[id] = { home: 1, away: 0 };
  return m;
}

describe('KnockoutStageEngine.buildAndPropagate', () => {
  it('seede les 16es depuis les qualifiés (cross-link officiel)', () => {
    const ko = engine.buildAndPropagate(buildQualifiers(), thirdAssignment, {});
    expect(ko['M73']!.home).toBe('A2'); // runnerUp A
    expect(ko['M73']!.away).toBe('B2'); // runnerUp B
    expect(ko['M74']!.home).toBe('E1'); // winner E
    expect(ko['M74']!.away).toBe('A3'); // third slot M74
  });

  it('propage les vainqueurs jusqu’à la finale (M104 décidé)', () => {
    const ko = engine.buildAndPropagate(
      buildQualifiers(),
      thirdAssignment,
      allHomeWins(),
    );
    // M89 = vainqueur M74 (E1) + vainqueur M77 (I1) — cross-link
    expect(ko['M89']!.home).toBe('E1');
    expect(ko['M89']!.away).toBe('I1');
    expect(ko['M104']!.decided).toBe(true);
    expect(ko['M104']!.winner).not.toBeNull();
    // 3e place alimentée par les perdants des demies
    expect(ko['M103']!.home).not.toBeNull();
    expect(ko['M103']!.away).not.toBeNull();
  });

  it('résout un nul par les tirs au but et propage le qualifié', () => {
    const scores: ScoreMap = { M73: { home: 1, away: 1, winner: 'away' } };
    const ko = engine.buildAndPropagate(buildQualifiers(), thirdAssignment, scores);
    expect(ko['M73']!.decided).toBe(true);
    expect(ko['M73']!.winner).toBe('B2'); // away = runnerUp B
    // M73 winnerTo M90 home
    expect(ko['M90']!.home).toBe('B2');
  });

  it('bloque la propagation sur un nul sans tirs au but (needsAttention)', () => {
    const scores: ScoreMap = { M73: { home: 0, away: 0 } };
    const ko = engine.buildAndPropagate(buildQualifiers(), thirdAssignment, scores);
    expect(ko['M73']!.decided).toBe(false);
    expect(ko['M73']!.needsAttention).toBe(true);
    expect(ko['M90']!.home).toBeNull();
  });
});
