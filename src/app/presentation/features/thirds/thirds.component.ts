import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TournamentStore } from '../../../application/tournament.store';
import { GROUPS } from '../../../domain/data/teams';
import { MatchId, TeamId } from '../../../domain/models';
import { FlagComponent } from '../../ui/flag.component';
import { SignedNumberPipe } from '../../ui/pipes/signed-number.pipe';
import { TeamNamePipe } from '../../ui/pipes/team-name.pipe';

@Component({
  selector: 'wc-thirds',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FlagComponent, TeamNamePipe, SignedNumberPipe],
  templateUrl: './thirds.component.html',
  styleUrl: './thirds.component.scss',
})
export class ThirdsComponent {
  private readonly store = inject(TournamentStore);

  /** Vue prête à afficher : zéro logique dans le template. */
  protected readonly vm = computed(() => {
    const groups = this.store.groups();
    const assignment = this.store.thirdPlaceAssignment();
    const slotByTeam = new Map<TeamId, MatchId>();
    for (const slot of Object.keys(assignment)) {
      const team = assignment[slot];
      if (team) slotByTeam.set(team, slot);
    }
    const rows = this.store.thirdPlaceRanking().map((t, i) => {
      const slot = slotByTeam.get(t.teamId);
      return {
        teamId: t.teamId,
        rank: t.rank,
        groupId: t.groupId,
        points: t.points,
        gd: t.gd,
        gf: t.gf,
        qualified: t.qualified,
        cut: i === 8,
        slotLabel: slot ? `Match ${slot.slice(1)}` : '—',
      };
    });
    return {
      provisional: !this.store.thirdResolved(),
      completeCount: GROUPS.filter((g) => groups.get(g)?.complete).length,
      rows,
    };
  });
}
