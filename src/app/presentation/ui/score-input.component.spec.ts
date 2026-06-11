import { inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, test } from 'vitest';
import { ScoreInputComponent } from './score-input.component';

function inputEl(fixture: ComponentFixture<ScoreInputComponent>): HTMLInputElement {
  const el: HTMLInputElement | null = fixture.nativeElement.querySelector('input');
  if (!el) throw new Error('input introuvable');
  return el;
}

describe('ScoreInputComponent', () => {
  describe('disabled (input)', () => {
    test('désactive et verrouille le champ', () => {
      const disabled = signal(false);
      const fixture = TestBed.createComponent(ScoreInputComponent, {
        bindings: [inputBinding('disabled', disabled)],
      });
      fixture.detectChanges();
      expect(inputEl(fixture).disabled).toBe(false);

      disabled.set(true);
      fixture.detectChanges();
      const el = inputEl(fixture);
      expect(el.disabled).toBe(true);
      expect(el.classList.contains('locked')).toBe(true);
    });
  });

  describe('value (input)', () => {
    test('affiche la valeur, et vide quand null', () => {
      const value = signal<number | null>(2);
      const fixture = TestBed.createComponent(ScoreInputComponent, {
        bindings: [inputBinding('value', value)],
      });
      fixture.detectChanges();
      expect(inputEl(fixture).value).toBe('2');

      value.set(null);
      fixture.detectChanges();
      expect(inputEl(fixture).value).toBe('');
    });
  });

  describe('onInput', () => {
    test('émet la valeur saisie, et null quand on vide', () => {
      const fixture = TestBed.createComponent(ScoreInputComponent);
      fixture.detectChanges();
      const emitted: (number | null)[] = [];
      fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));
      const el = inputEl(fixture);

      el.value = '3';
      el.dispatchEvent(new Event('input'));
      el.value = '';
      el.dispatchEvent(new Event('input'));

      expect(emitted).toEqual([3, null]);
    });

    test('ignore une saisie négative', () => {
      const fixture = TestBed.createComponent(ScoreInputComponent);
      fixture.detectChanges();
      const emitted: (number | null)[] = [];
      fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));
      const el = inputEl(fixture);

      el.value = '-2';
      el.dispatchEvent(new Event('input'));

      expect(emitted).toEqual([]);
    });
  });
});
