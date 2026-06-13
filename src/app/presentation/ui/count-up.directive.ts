import { Directive, ElementRef, effect, inject, input } from '@angular/core';

/**
 * Anime le nombre affiché de 0 jusqu'à la valeur (~0,6 s, easing). Pose la
 * valeur finale instantanément si l'utilisateur préfère réduire les animations.
 *
 * Usage : `<span [wcCountUp]="points">0</span>`
 */
@Directive({ selector: '[wcCountUp]' })
export class CountUpDirective {
  readonly target = input.required<number>({ alias: 'wcCountUp' });
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private raf = 0;

  constructor() {
    effect(() => {
      const to = this.target();
      cancelAnimationFrame(this.raf);
      if (this.prefersReducedMotion()) {
        this.el.nativeElement.textContent = String(to);
        return;
      }
      const start = performance.now();
      const duration = 600;
      const step = (now: number): void => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        this.el.nativeElement.textContent = String(Math.round(to * eased));
        if (p < 1) this.raf = requestAnimationFrame(step);
      };
      this.raf = requestAnimationFrame(step);
    });
  }

  private prefersReducedMotion(): boolean {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  }
}
