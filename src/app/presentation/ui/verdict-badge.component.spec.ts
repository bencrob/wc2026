import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { VerdictBadgeComponent } from './verdict-badge.component';

describe('VerdictBadgeComponent', () => {
  it('rend le bon libellé et la bonne classe par verdict', () => {
    const cases: [string, string, string][] = [
      ['exact', 'Score exact', 'v-exact'],
      ['outcome', 'Bon résultat', 'v-outcome'],
      ['wrong', 'Raté', 'v-wrong'],
    ];
    for (const [verdict, label, cls] of cases) {
      const f = TestBed.createComponent(VerdictBadgeComponent);
      f.componentRef.setInput('verdict', verdict);
      f.detectChanges();
      const el = f.nativeElement as HTMLElement;
      expect(el.textContent).toContain(label);
      expect(el.querySelector(`.${cls}`)).toBeTruthy();
    }
  });

  it("n'affiche rien si verdict est null", () => {
    const f = TestBed.createComponent(VerdictBadgeComponent);
    f.componentRef.setInput('verdict', null);
    f.detectChanges();
    expect((f.nativeElement as HTMLElement).querySelector('.verdict')).toBeNull();
  });
});
