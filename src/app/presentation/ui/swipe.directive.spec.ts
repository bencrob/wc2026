import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, test } from 'vitest';
import { SwipeDirective } from './swipe.directive';

@Component({
  imports: [SwipeDirective],
  template: `
    <div
      wcSwipe
      (swipeLeft)="left = left + 1"
      (swipeRight)="right = right + 1"
    >
      <span class="plain">contenu</span>
      <div data-no-swipe><span class="scrollable">bracket</span></div>
    </div>
  `,
})
class HostComponent {
  left = 0;
  right = 0;
}

/** Construit un faux TouchEvent suffisant pour la directive (jsdom n'a pas TouchEvent). */
function touch(target: Element, x: number, y: number): TouchEvent {
  return { target, changedTouches: [{ clientX: x, clientY: y }] } as unknown as TouchEvent;
}

describe('SwipeDirective', () => {
  let host: HostComponent;
  let dir: SwipeDirective;
  let root: HTMLElement;

  beforeEach(() => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    host = fixture.componentInstance;
    const de = fixture.debugElement.query(By.directive(SwipeDirective));
    dir = de.injector.get(SwipeDirective);
    root = de.nativeElement as HTMLElement;
  });

  test('émet swipeLeft sur un glissement vers la gauche', () => {
    dir.onTouchStart(touch(root, 250, 100));
    dir.onTouchEnd(touch(root, 120, 110));
    expect(host.left).toBe(1);
    expect(host.right).toBe(0);
  });

  test('émet swipeRight sur un glissement vers la droite', () => {
    dir.onTouchStart(touch(root, 100, 100));
    dir.onTouchEnd(touch(root, 230, 95));
    expect(host.right).toBe(1);
    expect(host.left).toBe(0);
  });

  test('ignore un geste majoritairement vertical (scroll)', () => {
    dir.onTouchStart(touch(root, 100, 100));
    dir.onTouchEnd(touch(root, 130, 300)); // dx=30, dy=200 → vertical
    expect(host.left).toBe(0);
    expect(host.right).toBe(0);
  });

  test('ignore un petit déplacement sous le seuil', () => {
    dir.onTouchStart(touch(root, 100, 100));
    dir.onTouchEnd(touch(root, 140, 100)); // dx=40 < 60
    expect(host.left).toBe(0);
    expect(host.right).toBe(0);
  });

  test('ignore un swipe démarré dans une zone [data-no-swipe] (bracket)', () => {
    const scrollable = root.querySelector('.scrollable') as Element;
    dir.onTouchStart(touch(scrollable, 250, 100));
    dir.onTouchEnd(touch(scrollable, 100, 100)); // grand dx mais zone exclue
    expect(host.left).toBe(0);
    expect(host.right).toBe(0);
  });
});
