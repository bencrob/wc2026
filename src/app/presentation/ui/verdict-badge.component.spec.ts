import { inputBinding, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, test } from 'vitest';
import { Verdict } from '../../domain/models';
import { VerdictBadgeComponent } from './verdict-badge.component';

describe('VerdictBadgeComponent', () => {
  describe('verdict (input)', () => {
    test('rend le bon libellé et la bonne classe par verdict', () => {
      const cases: [Verdict, string, string][] = [
        ['exact', 'Score exact', 'v-exact'],
        ['outcome', 'Bon résultat', 'v-outcome'],
        ['wrong', 'Raté', 'v-wrong'],
      ];
      for (const [verdict, label, cls] of cases) {
        const value = signal<Verdict | null>(verdict);
        const fixture = TestBed.createComponent(VerdictBadgeComponent, {
          bindings: [inputBinding('verdict', value)],
        });
        fixture.detectChanges();
        const el: HTMLElement = fixture.nativeElement;
        expect(el.textContent).toContain(label);
        expect(el.querySelector(`.${cls}`)).toBeTruthy();
      }
    });

    test("n'affiche rien quand verdict est null", () => {
      const value = signal<Verdict | null>(null);
      const fixture = TestBed.createComponent(VerdictBadgeComponent, {
        bindings: [inputBinding('verdict', value)],
      });
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('.verdict')).toBeNull();
    });
  });
});
