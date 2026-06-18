import { describe, expect, test } from 'vitest';
import { GROUP_FIXTURES } from '../data/fixtures';
import { kickoffMsOf } from '../data/schedule';
import { MatchId } from '../models';
import { selectFocusGroup } from './focus-group';

const at = (iso: string): number => Date.parse(iso);
const groupOf = (id: MatchId) => GROUP_FIXTURES.find((f) => f.id === id)?.groupId;

describe('selectFocusGroup', () => {
  test('match de poule en cours → sa poule', () => {
    // M1 : coup d'envoi 2026-06-11T19:00Z ; à +1 h, seul match dans sa fenêtre.
    expect(selectFocusGroup(at('2026-06-11T20:00:00Z'))).toBe(groupOf('M1'));
  });

  test('aucun en cours → prochain match à venir (match terminé exclu)', () => {
    // M1 terminé à 21:00Z ; prochain coup d'envoi = M7 (groupe B).
    expect(selectFocusGroup(at('2026-06-11T22:00:00Z'))).toBe(groupOf('M7'));
  });

  test('avant la compétition → poule du tout premier coup d’envoi', () => {
    const earliest = [...GROUP_FIXTURES]
      .filter((f) => kickoffMsOf(f.id) !== undefined)
      .sort((a, b) => (kickoffMsOf(a.id) ?? 0) - (kickoffMsOf(b.id) ?? 0))[0];
    expect(selectFocusGroup(at('2026-01-01T00:00:00Z'))).toBe(earliest?.groupId);
  });

  test('phase de groupes terminée → null (matchs KO ignorés)', () => {
    expect(selectFocusGroup(at('2026-07-10T00:00:00Z'))).toBeNull();
  });
});
