import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { teamFlag } from '../../domain/data/teams';
import { TeamId } from '../../domain/models';

/** Drapeau d'une équipe (police Twemoji Country Flags, repli système). */
@Component({
  selector: 'wc-flag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './flag.component.html',
  styleUrl: './flag.component.scss',
})
export class FlagComponent {
  readonly teamId = input<TeamId | null>(null);
  protected readonly flag = computed(() => teamFlag(this.teamId()));
}
