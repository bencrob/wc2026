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
  template: `
    @if (info(); as i) {
      <span class="verdict" [class]="i.cls">{{ i.text }}</span>
    }
  `,
  styles: `
    .verdict {
      display: inline-block;
      padding: 0.05rem 0.4rem;
      border-radius: 0.5rem;
      font-size: 0.72rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .v-exact { background: #198754; color: #fff; }
    .v-outcome { background: #ffc107; color: #000; }
    .v-wrong { background: #dc3545; color: #fff; }
  `,
})
export class VerdictBadgeComponent {
  readonly verdict = input<Verdict | null>(null);
  protected readonly info = computed(() => {
    const v = this.verdict();
    return v ? LABELS[v] : null;
  });
}
