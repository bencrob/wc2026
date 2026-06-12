import { describe, expect, test } from 'vitest';
import { resolveTeam } from './team-map';

describe('resolveTeam', () => {
  test('résout par code FIFA (tla)', () => {
    expect(resolveTeam({ tla: 'MEX' })).toBe('A1');
    expect(resolveTeam({ tla: 'fra' })).toBe('I1');
  });

  test('résout par nom anglais du flux', () => {
    expect(resolveTeam({ name: 'South Africa' })).toBe('A2');
    expect(resolveTeam({ name: 'Korea Republic' })).toBe('A3');
    expect(resolveTeam({ name: 'DR Congo' })).toBe('K2');
  });

  test('résout par nom français (accents/ponctuation ignorés)', () => {
    expect(resolveTeam({ name: 'Côte d’Ivoire' })).toBe('E3');
    expect(resolveTeam({ name: 'Tchéquie' })).toBe('A4');
  });

  test('renvoie null pour une équipe inconnue', () => {
    expect(resolveTeam({ name: 'Atlantis' })).toBeNull();
    expect(resolveTeam({})).toBeNull();
  });
});
