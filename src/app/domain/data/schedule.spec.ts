import { describe, expect, test } from 'vitest';
import { kickoffMsOf, SCHEDULE } from './schedule';

describe('kickoffMsOf', () => {
  test('utilise le coup d’envoi précis quand il est renseigné', () => {
    expect(kickoffMsOf('M1')).toBe(Date.parse('2026-06-11T13:00:00-06:00'));
  });

  test('renvoie undefined quand le kickoff manque (aucun verrou horaire)', () => {
    // M2 n'a pas de créneau précis → pas de verrou horaire (éditable jusqu'à l'officiel).
    // ⚠️ Surtout PAS de repli « début de journée » (verrouillait le match dès minuit).
    expect(SCHEDULE['M2']?.kickoff).toBeUndefined();
    expect(kickoffMsOf('M2')).toBeUndefined();
  });

  test('gère le libellé ordinal « 1ᵉʳ juillet »', () => {
    expect(kickoffMsOf('M80')).toBe(Date.parse('2026-07-01T12:00:00-04:00'));
  });
});
