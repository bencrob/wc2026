import { Injectable } from '@angular/core';

/**
 * Effets de confettis (fun ⚽). `canvas-confetti` est importé **paresseusement**
 * (chunk séparé → hors bundle initial) et déclenché uniquement à la demande.
 * No-op si l'utilisateur préfère réduire les animations (`prefers-reduced-motion`).
 */
@Injectable({ providedIn: 'root' })
export class CelebrationService {
  /** Petit éclat — couleurs du thème par défaut (ex. nouveau score exact). */
  async burst(colors?: readonly string[]): Promise<void> {
    const confetti = await this.load();
    if (!confetti) return;
    confetti({
      particleCount: 90,
      spread: 75,
      startVelocity: 38,
      origin: { y: 0.7 },
      colors: [...(colors ?? this.themeColors())],
    });
  }

  /** Pluie dorée ~1,2 s depuis les deux bords (célébration majeure : 100 %). */
  async rain(): Promise<void> {
    const confetti = await this.load();
    if (!confetti) return;
    const gold = ['#ffd700', '#ffce3a', '#fff3b0', '#ffffff'];
    const end = Date.now() + 1200;
    const frame = (): void => {
      if (Date.now() > end) return;
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: gold });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: gold });
      requestAnimationFrame(frame);
    };
    frame();
  }

  /** Charge la lib à la demande ; `null` si réduction des animations demandée. */
  private async load() {
    if (this.prefersReducedMotion()) return null;
    const mod = await import('canvas-confetti');
    return mod.default;
  }

  private prefersReducedMotion(): boolean {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  }

  /** Couleurs dérivées du thème courant (variables Material), fallback festif. */
  private themeColors(): string[] {
    try {
      const s = getComputedStyle(document.body);
      const vars = ['--mat-sys-primary', '--mat-sys-tertiary'].map((v) => s.getPropertyValue(v).trim());
      const colors = vars.filter((c) => c.length > 0);
      return colors.length > 0 ? [...colors, '#ffffff'] : ['#7b2ff7', '#ffce3a', '#ffffff'];
    } catch {
      return ['#7b2ff7', '#ffce3a', '#ffffff'];
    }
  }
}
