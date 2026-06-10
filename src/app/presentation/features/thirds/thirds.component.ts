import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TournamentStore } from '../../../application/tournament.store';
import { GROUPS, teamName } from '../../../domain/data/teams';
import { MatchId, TeamId } from '../../../domain/models';
import { FlagComponent } from '../../ui/flag.component';

@Component({
  selector: 'wc-thirds',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FlagComponent],
  template: `
    <div class="status" [class.resolved]="store.thirdResolved()">
      @if (store.thirdResolved()) {
        12 groupes complets — les 8 meilleurs troisièmes sont qualifiés et placés
        dans le tableau final.
      } @else {
        Classement provisoire — {{ completeCount() }}/12 groupes complets. La
        qualification des 3es se fige à 12/12.
      }
    </div>

    <table class="thirds">
      <thead>
        <tr>
          <th class="start">#</th>
          <th class="start">Équipe</th>
          <th>Gr.</th><th>Pts</th><th>Diff</th><th>BP</th><th>Créneau R32</th>
        </tr>
      </thead>
      <tbody>
        @for (t of store.thirdPlaceRanking(); track t.teamId; let i = $index) {
          <tr [class.qualif]="t.qualified" [class.cut]="i === 8">
            <td class="start">{{ t.rank }}</td>
            <td class="start team"><wc-flag [teamId]="t.teamId" /> {{ name(t.teamId) }}</td>
            <td>{{ t.groupId }}</td>
            <td class="pts">{{ t.points }}</td>
            <td>{{ t.gd > 0 ? '+' + t.gd : t.gd }}</td>
            <td>{{ t.gf }}</td>
            <td>{{ slotLabel(t.teamId) }}</td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styleUrl: './thirds.component.scss',
})
export class ThirdsComponent {
  protected readonly store = inject(TournamentStore);
  protected readonly name = teamName;

  private readonly slotByTeam = computed(() => {
    const map = new Map<TeamId, MatchId>();
    const assignment = this.store.thirdPlaceAssignment();
    for (const slot of Object.keys(assignment)) {
      const team = assignment[slot];
      if (team) map.set(team, slot);
    }
    return map;
  });

  protected completeCount(): number {
    return GROUPS.filter((g) => this.store.groups()[g].complete).length;
  }

  protected slotLabel(teamId: TeamId): string {
    const slot = this.slotByTeam().get(teamId);
    return slot ? 'Match ' + slot.slice(1) : '—';
  }
}
