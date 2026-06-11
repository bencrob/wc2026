import { describe, expect, test } from 'vitest';
import { SignedNumberPipe } from './signed-number.pipe';

const pipe = new SignedNumberPipe();

describe('SignedNumberPipe', () => {
  describe('transform', () => {
    test('préfixe les positifs par +', () => {
      expect(pipe.transform(3)).toBe('+3');
    });

    test('laisse les négatifs tels quels', () => {
      expect(pipe.transform(-1)).toBe('-1');
    });

    test('rend 0 sans signe', () => {
      expect(pipe.transform(0)).toBe('0');
    });
  });
});
