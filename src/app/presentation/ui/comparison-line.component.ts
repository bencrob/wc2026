import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DraftScore, Score, Verdict } from '../../domain/models';
import { VerdictBadgeComponent } from './verdict-badge.component';

/**
 * Ligne « officiel vs pronostic » d'un match (affichée quand un résultat officiel existe).
 * `koWinnerName` = équipe qualifiée aux tirs au but (officiel KO nul), sinon null.
 */
@Component({
  selector: 'wc-comparison-line',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VerdictBadgeComponent],
  templateUrl: './comparison-line.component.html',
  styleUrl: './comparison-line.component.scss',
})
export class ComparisonLineComponent {
  readonly official = input.required<Score>();
  readonly prediction = input<DraftScore | null>(null);
  readonly verdict = input<Verdict | null>(null);
  readonly koWinnerName = input<string | null>(null);

  protected readonly officialText = computed(() => {
    const o = this.official();
    const suffix = this.koWinnerName() ? ` (TAB ${this.koWinnerName()})` : '';
    return `${o.home}–${o.away}${suffix}`;
  });
}
