import { Directive, HostListener, output } from '@angular/core';

/**
 * Swipe horizontal TACTILE pour changer d'onglet (mobile/tablette).
 * - Émet `swipeLeft` / `swipeRight` sur un glissement horizontal franc.
 * - Ignoré si le geste est majoritairement vertical (scroll) ou s'il démarre
 *   dans un conteneur à défilement horizontal marqué `[data-no-swipe]` (ex. le bracket).
 */
@Directive({
  selector: '[wcSwipe]',
})
export class SwipeDirective {
  /** Seuil minimal de déplacement horizontal (px) pour considérer un swipe. */
  private static readonly THRESHOLD = 60;

  readonly swipeLeft = output<void>();
  readonly swipeRight = output<void>();

  private startX = 0;
  private startY = 0;
  private tracking = false;

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    const target = event.target;
    if (target instanceof Element && target.closest('[data-no-swipe]')) {
      this.tracking = false;
      return;
    }
    const touch = event.changedTouches[0];
    if (!touch) return;
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.tracking = true;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (!this.tracking) return;
    this.tracking = false;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - this.startX;
    const dy = touch.clientY - this.startY;
    // Swipe horizontal franc : amplitude suffisante ET nettement plus horizontal que vertical.
    if (Math.abs(dx) < SwipeDirective.THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.5) {
      return;
    }
    if (dx < 0) this.swipeLeft.emit();
    else this.swipeRight.emit();
  }
}
