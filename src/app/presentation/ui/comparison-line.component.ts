import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Score, Verdict } from '../../domain/models';
import { VerdictBadgeComponent } from './verdict-badge.component';

/**
 * Ligne « officiel vs pronostic » d'un match (affichée quand un résultat officiel existe).
 * `koWinnerName` = équipe qualifiée aux tirs au but (officiel KO nul), sinon null.
 */
@Component({
  selector: 'wc-comparison-line',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VerdictBadgeComponent],
  template: `
    <div class="cmp">
      <span class="off">🏟️ Officiel {{ officialText() }}</span>
      @if (prediction(); as p) {
        <span class="prono">· prono {{ p.home }}–{{ p.away }}</span>
        <wc-verdict-badge [verdict]="verdict()" />
      } @else {
        <span class="prono muted">· aucun prono saisi</span>
      }
    </div>
  `,
  styles: `
    .cmp {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      align-items: center;
      justify-content: center;
      font-size: 0.74rem;
      margin-top: 0.2rem;
    }
    .off {
      background: #212529;
      color: #fff;
      padding: 0.05rem 0.4rem;
      border-radius: 0.5rem;
      font-weight: 600;
    }
    .muted { opacity: 0.7; }
  `,
})
export class ComparisonLineComponent {
  readonly official = input.required<Score>();
  readonly prediction = input<Score | null>(null);
  readonly verdict = input<Verdict | null>(null);
  readonly koWinnerName = input<string | null>(null);

  protected readonly officialText = computed(() => {
    const o = this.official();
    const suffix = this.koWinnerName() ? ` (TAB ${this.koWinnerName()})` : '';
    return `${o.home}–${o.away}${suffix}`;
  });
}
