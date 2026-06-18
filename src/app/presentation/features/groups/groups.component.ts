import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { TournamentStore } from '../../../application/tournament.store';
import { GROUP_FIXTURES } from '../../../domain/data/fixtures';
import { SCHEDULE } from '../../../domain/data/schedule';
import { GROUPS, teamName } from '../../../domain/data/teams';
import { GroupFixture, GroupId, MatchId, Side } from '../../../domain/models';
import { required } from '../../../domain/util/required';
import { ComparisonLineComponent } from '../../ui/comparison-line.component';
import { FlagComponent } from '../../ui/flag.component';
import { FifaRankPipe } from '../../ui/pipes/fifa-rank.pipe';
import { SignedNumberPipe } from '../../ui/pipes/signed-number.pipe';
import { TeamNamePipe } from '../../ui/pipes/team-name.pipe';
import { ScoreInputComponent } from '../../ui/score-input.component';

const FIXTURES_BY_GROUP: ReadonlyMap<GroupId, readonly GroupFixture[]> = new Map(
  GROUPS.map((g) => [g, GROUP_FIXTURES.filter((f) => f.groupId === g)]),
);

@Component({
  selector: 'wc-groups',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatExpansionModule,
    FlagComponent,
    ScoreInputComponent,
    ComparisonLineComponent,
    TeamNamePipe,
    FifaRankPipe,
    SignedNumberPipe,
  ],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
})
export class GroupsComponent {
  private readonly store = inject(TournamentStore);

  /**
   * Poule dépliée à l'ouverture : match de poule en cours / prochain à venir,
   * repli sur le groupe A. Lu une seule fois à la construction (snapshot) : la
   * valeur reste figée ensuite, l'utilisateur garde la main sur l'accordéon.
   */
  protected readonly initialGroup: GroupId = this.store.focusGroup() ?? 'A';

  /** Vue prête à afficher : aucune logique dans le template. */
  protected readonly groupsVm = computed(() => {
    const groups = this.store.groups();
    const effective = this.store.effective();
    const official = this.store.officialResults();
    const comparison = this.store.comparison();

    return GROUPS.map((g) => {
      const result = required(groups.get(g), `groupe ${g} manquant`);
      const standings = result.standings.map((r) => ({
        teamId: r.teamId,
        rank: r.rank,
        played: r.played,
        won: r.won,
        drawn: r.drawn,
        lost: r.lost,
        gf: r.gf,
        ga: r.ga,
        gd: r.gd,
        points: r.points,
        qualif: r.rank <= 2,
        third: r.rank === 3,
      }));
      const played = standings.reduce((sum, r) => sum + r.played, 0);

      const fixtures = required(FIXTURES_BY_GROUP.get(g), `fixtures ${g}`).map((f) => {
        const eff = effective[f.id];
        const cmp = comparison[f.id];
        return {
          id: f.id,
          home: f.home,
          away: f.away,
          homeValue: eff?.home ?? null,
          awayValue: eff?.away ?? null,
          locked: !this.store.isEditable(f.id),
          homeAria: `${teamName(f.home) ?? ''} buts`,
          awayAria: `${teamName(f.away) ?? ''} buts`,
          schedule: SCHEDULE[f.id] ?? null,
          official: official[f.id] ?? null,
          prediction: cmp?.prediction ?? null,
          verdict: cmp?.verdict ?? null,
        };
      });

      return {
        id: g,
        complete: result.complete,
        enteredLabel: `${played / 2}/6`,
        standings,
        fixtures,
      };
    });
  });

  protected set(id: MatchId, side: Side, value: number | null): void {
    this.store.setScore(id, side, value);
  }
}
