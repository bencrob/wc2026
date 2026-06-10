import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TournamentStore } from '../../../application/tournament.store';
import {
  BRACKET_LINKS,
  KO_PHASES,
  R32_SLOTS,
} from '../../../domain/data/knockout-structure';
import { SCHEDULE } from '../../../domain/data/schedule';
import { teamName } from '../../../domain/data/teams';
import {
  Comparison,
  KnockoutMatch,
  KnockoutPhase,
  MatchId,
  Score,
  Side,
  SlotSource,
} from '../../../domain/models';
import { ComparisonLineComponent } from '../../ui/comparison-line.component';
import { FlagComponent } from '../../ui/flag.component';
import { ScoreInputComponent } from '../../ui/score-input.component';

/** Décrit la provenance d'un côté de match (pour afficher au lieu de « À déterminer »). */
function describeSource(s: SlotSource): string {
  if (s.kind === 'winner') return `1ᵉʳ groupe ${s.group}`;
  if (s.kind === 'runnerUp') return `2ᵉ groupe ${s.group}`;
  return 'Meilleur 3ᵉ';
}

/** Label de provenance par emplacement `${matchId}-${side}` (R32 = chapeau, R16+ = vainqueur/perdant). */
const FEEDER_LABEL: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const slot of R32_SLOTS) {
    m[`${slot.id}-home`] = describeSource(slot.home);
    m[`${slot.id}-away`] = describeSource(slot.away);
  }
  for (const link of BRACKET_LINKS) {
    if (link.winnerTo) {
      m[`${link.winnerTo.match}-${link.winnerTo.side}`] = `Vainqueur M${link.match.slice(1)}`;
    }
    if (link.loserTo) {
      m[`${link.loserTo.match}-${link.loserTo.side}`] = `Perdant M${link.match.slice(1)}`;
    }
  }
  return m;
})();

/**
 * Nourrisseurs d'un match : FEEDERS[target] = [sourceHome, sourceAway].
 * Reconstruit depuis BRACKET_LINKS.winnerTo (sens inverse de la propagation).
 */
const FEEDERS: Record<MatchId, [MatchId, MatchId]> = (() => {
  const tmp: Record<string, { home?: MatchId; away?: MatchId }> = {};
  for (const link of BRACKET_LINKS) {
    if (!link.winnerTo) continue;
    const t = link.winnerTo.match;
    (tmp[t] ??= {})[link.winnerTo.side] = link.match;
  }
  const out: Record<MatchId, [MatchId, MatchId]> = {};
  for (const [target, sides] of Object.entries(tmp)) {
    if (sides.home && sides.away) out[target] = [sides.home, sides.away];
  }
  return out;
})();

/**
 * Index d'arbre par parcours infixe depuis la finale (M104).
 * Trier une colonne par cet index aligne chaque match au milieu de ses 2 qualifiés.
 */
const ORDER_INDEX: Record<MatchId, number> = (() => {
  const idx: Record<MatchId, number> = {};
  let n = 0;
  const visit = (node: MatchId): void => {
    const feeders = FEEDERS[node];
    if (feeders) visit(feeders[0]);
    idx[node] = n++;
    if (feeders) visit(feeders[1]);
  };
  visit('M104');
  return idx;
})();

const THIRD_PLACE_ID: MatchId = 'M103';

@Component({
  selector: 'wc-knockout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, FlagComponent, ScoreInputComponent, ComparisonLineComponent],
  templateUrl: './knockout.component.html',
  styleUrl: './knockout.component.scss',
})
export class KnockoutComponent {
  protected readonly store = inject(TournamentStore);
  /** Tours de l'arbre (hors petite finale, rendue à part). */
  protected readonly bracketPhases = KO_PHASES.filter((p) => p.key !== 'P3');
  protected readonly thirdPlaceId = THIRD_PLACE_ID;
  protected readonly name = teamName;

  /** Ids d'un tour, ordonnés selon l'arbre (qualifiés adjacents → match centré). */
  protected orderedIds(phase: KnockoutPhase): MatchId[] {
    const ids: MatchId[] = [];
    for (let n = phase.from; n <= phase.to; n++) ids.push('M' + n);
    return ids.sort((a, b) => (ORDER_INDEX[a] ?? 0) - (ORDER_INDEX[b] ?? 0));
  }

  /** Nom de l'équipe si connue, sinon la provenance (« Vainqueur M74 », « 2ᵉ groupe A »…). */
  protected placeholder(id: MatchId, side: Side): string {
    return FEEDER_LABEL[`${id}-${side}`] ?? 'À déterminer';
  }

  /** Champion = vainqueur de la finale (M104) une fois décidée. */
  protected champion(): string | null {
    const final = this.store.knockout()['M104'];
    return final?.decided ? this.name(final.winner) : null;
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
