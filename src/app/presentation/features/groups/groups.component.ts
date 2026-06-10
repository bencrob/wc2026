import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { TournamentStore } from '../../../application/tournament.store';
import { GROUP_FIXTURES } from '../../../domain/data/fixtures';
import { SCHEDULE } from '../../../domain/data/schedule';
import { GROUPS, teamFifaRank, teamName } from '../../../domain/data/teams';
import {
  Comparison,
  GroupFixture,
  GroupId,
  MatchId,
  Score,
  Side,
} from '../../../domain/models';
import { ComparisonLineComponent } from '../../ui/comparison-line.component';
import { FlagComponent } from '../../ui/flag.component';
import { ScoreInputComponent } from '../../ui/score-input.component';

const FIXTURES_BY_GROUP = GROUPS.reduce(
  (acc, g) => {
    acc[g] = GROUP_FIXTURES.filter((f) => f.groupId === g);
    return acc;
  },
  {} as Record<GroupId, GroupFixture[]>,
);

@Component({
  selector: 'wc-groups',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatExpansionModule,
    FlagComponent,
    ScoreInputComponent,
    ComparisonLineComponent,
  ],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
})
export class GroupsComponent {
  protected readonly store = inject(TournamentStore);
  protected readonly groups = GROUPS;
  protected readonly fixturesByGroup = FIXTURES_BY_GROUP;
  protected readonly name = teamName;
  protected readonly fifaRank = teamFifaRank;

  protected entered(g: GroupId): number {
    return this.store.groups()[g].standings.reduce((s, r) => s + r.played, 0) / 2;
  }

  protected side(id: MatchId, side: Side): number | null {
    return this.store.effective()[id]?.[side] ?? null;
  }

  protected schedule(id: MatchId): { date: string; venue: string } | null {
    return SCHEDULE[id] ?? null;
  }

  protected official(id: MatchId): Score | undefined {
    return this.store.officialResults()[id];
  }

  protected comparison(id: MatchId): Comparison | undefined {
    return this.store.comparison()[id];
  }

  protected set(id: MatchId, side: Side, value: number | null): void {
    this.store.setScore(id, side, value);
  }
}
