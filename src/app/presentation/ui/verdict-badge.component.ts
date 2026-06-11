import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Verdict } from '../../domain/models';

const LABELS: Record<Verdict, { text: string; cls: string }> = {
  exact: { text: '✓ Score exact', cls: 'v-exact' },
  outcome: { text: '≈ Bon résultat', cls: 'v-outcome' },
  wrong: { text: '✗ Raté', cls: 'v-wrong' },
};

/** Pastille de verdict d'un pronostic comparé au résultat officiel. */
@Component({
  selector: 'wc-verdict-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './verdict-badge.component.html',
  styleUrl: './verdict-badge.component.scss',
})
export class VerdictBadgeComponent {
  readonly verdict = input<Verdict | null>(null);
  protected readonly info = computed(() => {
    const v = this.verdict();
    return v ? LABELS[v] : null;
  });
}
