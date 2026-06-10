import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TournamentStore } from '../../../application/tournament.store';
import { KO_PHASES } from '../../../domain/data/knockout-structure';
import { SCHEDULE } from '../../../domain/data/schedule';
import { teamName } from '../../../domain/data/teams';
import {
  Comparison,
  KnockoutMatch,
  MatchId,
  Score,
  Side,
} from '../../../domain/models';
import { ComparisonLineComponent } from '../../ui/comparison-line.component';
import { FlagComponent } from '../../ui/flag.component';
import { ScoreInputComponent } from '../../ui/score-input.component';

@Component({
  selector: 'wc-knockout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FlagComponent, ScoreInputComponent, ComparisonLineComponent],
  templateUrl: './knockout.component.html',
  styleUrl: './knockout.component.scss',
})
export class KnockoutComponent {
  protected readonly store = inject(TournamentStore);
  protected readonly phases = KO_PHASES;
  protected readonly name = teamName;

  protected ids(from: number, to: number): MatchId[] {
    const out: MatchId[] = [];
    for (let n = from; n <= to; n++) out.push('M' + n);
    return out;
  }

  protected match(id: MatchId): KnockoutMatch {
    return this.store.knockout()[id]!;
  }

  protected sideValue(id: MatchId, side: Side): number | null {
    return this.store.effective()[id]?.[side] ?? null;
  }

  protected isWinner(id: MatchId, teamId: string | null): boolean {
    const m = this.match(id);
    return m.decided && teamId !== null && m.winner === teamId;
  }

  /** Affiche le sélecteur tirs au but : éditable, deux équipes connues, nul saisi. */
  protected showPenalty(id: MatchId): boolean {
    const m = this.match(id);
    const sc = this.store.effective()[id];
    return (
      this.store.isEditable(id) &&
      m.home !== null &&
      m.away !== null &&
      !!sc &&
      Number.isInteger(sc.home) &&
      Number.isInteger(sc.away) &&
      sc.home === sc.away
    );
  }

  protected penaltyPick(id: MatchId): Side | undefined {
    return this.store.effective()[id]?.winner;
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

  /** Équipe qualifiée aux tirs au but pour un résultat officiel nul (sinon null). */
  protected koWinnerName(id: MatchId): string | null {
    const off = this.official(id);
    if (!off || off.home !== off.away || !off.winner) return null;
    return this.name(this.match(id)[off.winner]);
  }

  protected set(id: MatchId, side: Side, value: number | null): void {
    this.store.setScore(id, side, value);
  }

  protected pickWinner(id: MatchId, side: Side): void {
    this.store.pickPenaltyWinner(id, side);
  }
}
