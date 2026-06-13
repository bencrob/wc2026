import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

/**
 * Saisie d'un score (0..N). Verrouillé (`disabled`) quand un résultat officiel existe.
 * Émet `null` quand le champ est vidé ; ignore les saisies invalides.
 */
@Component({
  selector: 'wc-score-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './score-input.component.html',
  styleUrl: './score-input.component.scss',
})
export class ScoreInputComponent {
  readonly value = input<number | null>(null);
  readonly disabled = input(false);
  readonly ariaLabel = input('Score');
  readonly valueChange = output<number | null>();

  protected readonly displayValue = computed(() => this.value() ?? '');
  protected readonly lockTitle = computed(() =>
    this.disabled() ? 'Résultat officiel — saisie verrouillée' : '',
  );
  /** Micro-anim « pop » jouée à chaque saisie de score valide. */
  protected readonly flash = signal(false);

  onInput(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const raw = input.value.trim();
    if (raw === '') {
      this.valueChange.emit(null);
      return;
    }
    const n = Number(raw);
    if (Number.isInteger(n) && n >= 0) {
      this.valueChange.emit(n);
      this.flash.set(true);
    }
  }
}
