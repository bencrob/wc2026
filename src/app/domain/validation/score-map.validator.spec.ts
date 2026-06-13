import { describe, expect, test } from 'vitest';
import { ScoreMapValidator } from './score-map.validator';

const v = new ScoreMapValidator();

describe('ScoreMapValidator.validatePredictions', () => {
  test('accepte un objet { version, scores } valide', () => {
    const r = v.validatePredictions({ version: 1, scores: { M1: { home: 2, away: 1 } } });
    expect(r.ok).toBe(true);
  });

  test('refuse une mauvaise version', () => {
    const r = v.validatePredictions({ version: 99, scores: {} });
    expect(r.ok).toBe(false);
  });

  test('refuse un id de match invalide', () => {
    const r = v.validatePredictions({ version: 1, scores: { M999: { home: 1, away: 0 } } });
    expect(r.ok).toBe(false);
  });

  test('refuse un score négatif ou non entier', () => {
    expect(v.validatePredictions({ version: 1, scores: { M1: { home: -1, away: 0 } } }).ok).toBe(false);
    expect(v.validatePredictions({ version: 1, scores: { M1: { home: 1.5, away: 0 } } }).ok).toBe(false);
  });

  test('refuse « winner » sur un match de poule', () => {
    const r = v.validatePredictions({ version: 1, scores: { M1: { home: 0, away: 0, winner: 'home' } } });
    expect(r.ok).toBe(false);
  });
});

describe('ScoreMapValidator.validateOfficial', () => {
  test('accepte { results } et { scores }, version optionnelle', () => {
    expect(v.validateOfficial({ results: { M1: { home: 1, away: 0 } } }).ok).toBe(true);
    expect(v.validateOfficial({ scores: { M1: { home: 1, away: 0 } } }).ok).toBe(true);
  });

  test('exige un vainqueur sur un match KO nul', () => {
    expect(v.validateOfficial({ results: { M73: { home: 1, away: 1 } } }).ok).toBe(false);
    expect(v.validateOfficial({ results: { M73: { home: 1, away: 1, winner: 'home' } } }).ok).toBe(true);
  });

  test('renvoie la table nettoyée en cas de succès', () => {
    const r = v.validateOfficial({ results: { M1: { home: 2, away: 1 } } });
    expect(r.ok && r.value['M1']).toEqual({ home: 2, away: 1 });
  });
});
