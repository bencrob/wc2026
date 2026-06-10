import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { teamFlag } from '../../domain/data/teams';
import { TeamId } from '../../domain/models';

/** Drapeau d'une équipe (police Twemoji Country Flags, repli système). */
@Component({
  selector: 'wc-flag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="flag" aria-hidden="true">{{ flag() }}</span>`,
  styles: `
    .flag {
      font-family: 'Twemoji Country Flags', 'Segoe UI Emoji', 'Apple Color Emoji',
        'Noto Color Emoji', sans-serif;
      font-size: 1.15rem;
      line-height: 1;
    }
  `,
})
export class FlagComponent {
  readonly teamId = input<TeamId | null>(null);
  protected readonly flag = computed(() => teamFlag(this.teamId()));
}
