import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Saisie d'un score (0..N). Verrouillé (`disabled`) quand un résultat officiel existe.
 * Émet `null` quand le champ est vidé ; ignore les saisies invalides.
 */
@Component({
  selector: 'wc-score-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input
      type="number"
      min="0"
      inputmode="numeric"
      class="score-input"
      [class.locked]="disabled()"
      [value]="value() ?? ''"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel()"
      [title]="disabled() ? 'Résultat officiel — saisie verrouillée' : ''"
      (input)="onInput($event)"
    />
  `,
  styles: `
    .score-input {
      width: 2.8rem;
      text-align: center;
      padding: 0.25rem;
      border: 1px solid var(--mat-sys-outline, #999);
      border-radius: 4px;
      background: var(--mat-sys-surface, #fff);
      color: var(--mat-sys-on-surface, #000);
      font: inherit;
    }
    .score-input:focus-visible {
      outline: 2px solid var(--mat-sys-primary, #1976d2);
      outline-offset: 1px;
      border-color: var(--mat-sys-primary, #1976d2);
    }
    .score-input.locked {
      background: #e9ecef;
      color: #212529;
      font-weight: 700;
      cursor: not-allowed;
    }
    .score-input::-webkit-outer-spin-button,
    .score-input::-webkit-inner-spin-button {
      margin: 0;
    }
  `,
})
export class ScoreInputComponent {
  readonly value = input<number | null>(null);
  readonly disabled = input<boolean>(false);
  readonly ariaLabel = input<string>('Score');
  readonly valueChange = output<number | null>();

  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.trim();
    if (raw === '') {
      this.valueChange.emit(null);
      return;
    }
    const n = Number(raw);
    if (Number.isInteger(n) && n >= 0) this.valueChange.emit(n);
  }
}
