import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ScoreInputComponent } from './score-input.component';

describe('ScoreInputComponent', () => {
  it("désactive l'input quand disabled = true", () => {
    const f = TestBed.createComponent(ScoreInputComponent);
    f.componentRef.setInput('disabled', true);
    f.detectChanges();
    const input = f.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(input.classList.contains('locked')).toBe(true);
  });

  it('émet la valeur saisie, et null quand on vide', () => {
    const f = TestBed.createComponent(ScoreInputComponent);
    f.detectChanges();
    const emitted: (number | null)[] = [];
    f.componentInstance.valueChange.subscribe((v) => emitted.push(v));
    const input = f.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = '3';
    input.dispatchEvent(new Event('input'));
    input.value = '';
    input.dispatchEvent(new Event('input'));

    expect(emitted).toEqual([3, null]);
  });

  it('ignore une saisie invalide (négative)', () => {
    const f = TestBed.createComponent(ScoreInputComponent);
    f.detectChanges();
    const emitted: (number | null)[] = [];
    f.componentInstance.valueChange.subscribe((v) => emitted.push(v));
    const input = f.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '-2';
    input.dispatchEvent(new Event('input'));
    expect(emitted).toEqual([]);
  });
});
