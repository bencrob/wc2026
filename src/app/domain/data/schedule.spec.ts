import { describe, expect, test } from 'vitest';
import { kickoffMsOf, SCHEDULE } from './schedule';

describe('kickoffMsOf', () => {
  test('utilise le coup d’envoi précis quand il est renseigné', () => {
    expect(kickoffMsOf('M1')).toBe(Date.parse('2026-06-11T13:00:00-06:00'));
  });

  test('replie sur le début du jour du match (UTC-6) quand le kickoff manque', () => {
    // M2 n'a pas de kickoff précis (date interne sans créneau réel) → repli 00:00 UTC-6.
    expect(SCHEDULE['M2']?.kickoff).toBeUndefined();
    expect(kickoffMsOf('M2')).toBe(Date.parse('2026-06-11T00:00:00-06:00'));
  });

  test('gère le libellé ordinal « 1ᵉʳ juillet »', () => {
    expect(kickoffMsOf('M80')).toBe(Date.parse('2026-07-01T12:00:00-04:00'));
  });
});
