import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TournamentStore } from '../../../application/tournament.store';
import {
  BRACKET_LINKS,
  KO_PHASES,
  R32_SLOTS,
} from '../../../domain/data/knockout-structure';
import { SCHEDULE } from '../../../domain/data/schedule';
import { teamName } from '../../../domain/data/teams';
import { MatchId, Side, SlotSource } from '../../../domain/models';
import { required } from '../../../domain/util/required';
import { ComparisonLineComponent } from '../../ui/comparison-line.component';
import { FlagComponent } from '../../ui/flag.component';
import { ScoreInputComponent } from '../../ui/score-input.component';

/** Décrit la provenance d'un côté de match (affiché au lieu de « À déterminer »). */
function describeSource(s: SlotSource): string {
  if (s.kind === 'winner') return `1ᵉʳ groupe ${s.group}`;
  if (s.kind === 'runnerUp') return `2ᵉ groupe ${s.group}`;
  return 'Meilleur 3ᵉ';
}

/** Provenance par emplacement `${matchId}-${side}` (R32 = chapeau, R16+ = vainqueur/perdant). */
const FEEDER_LABEL: Record<string, string> = (() => {
  const labels: Record<string, string> = {};
  for (const slot of R32_SLOTS) {
    labels[`${slot.id}-home`] = describeSource(slot.home);
    labels[`${slot.id}-away`] = describeSource(slot.away);
  }
  for (const link of BRACKET_LINKS) {
    if (link.winnerTo) {
      labels[`${link.winnerTo.match}-${link.winnerTo.side}`] = `Vainqueur M${link.match.slice(1)}`;
    }
    if (link.loserTo) {
      labels[`${link.loserTo.match}-${link.loserTo.side}`] = `Perdant M${link.match.slice(1)}`;
    }
  }
  return labels;
})();

/** Nourrisseurs d'un match : [home, away], reconstruits depuis BRACKET_LINKS.winnerTo. */
const FEEDERS: Record<MatchId, { home?: MatchId; away?: MatchId }> = (() => {
  const map: Record<MatchId, { home?: MatchId; away?: MatchId }> = {};
  for (const link of BRACKET_LINKS) {
    if (!link.winnerTo) continue;
    const entry = map[link.winnerTo.match] ?? {};
    entry[link.winnerTo.side] = link.match;
    map[link.winnerTo.match] = entry;
  }
  return map;
})();

/** Index d'arbre par parcours infixe depuis la finale (centre chaque match entre ses qualifiés). */
const ORDER_INDEX: Record<MatchId, number> = (() => {
  const idx: Record<MatchId, number> = {};
  let n = 0;
  const visit = (node: MatchId): void => {
    const feeders = FEEDERS[node];
    if (feeders?.home) visit(feeders.home);
    idx[node] = n++;
    if (feeders?.away) visit(feeders.away);
  };
  visit('M104');
  return idx;
})();

/** Ids ordonnés par l'arbre, précalculés par tour (statique). */
const ORDERED_IDS: Record<string, MatchId[]> = (() => {
  const out: Record<string, MatchId[]> = {};
  for (const ph of KO_PHASES) {
    const ids: MatchId[] = [];
    for (let n = ph.from; n <= ph.to; n++) ids.push('M' + n);
    out[ph.key] = ids.sort((a, b) => (ORDER_INDEX[a] ?? 0) - (ORDER_INDEX[b] ?? 0));
  }
  return out;
})();

const FINAL_ID: MatchId = 'M104';
const THIRD_PLACE_ID: MatchId = 'M103';

@Component({
  selector: 'wc-knockout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, FlagComponent, ScoreInputComponent, ComparisonLineComponent],
  templateUrl: './knockout.component.html',
  styleUrl: './knockout.component.scss',
})
export class KnockoutComponent {
  private readonly store = inject(TournamentStore);

  /** Arbre complet prêt à afficher : tours ordonnés, podium, petite finale. */
  protected readonly bracketVm = computed(() => {
    const rounds = KO_PHASES.filter((ph) => ph.key !== 'P3').map((ph) => ({
      key: ph.key,
      label: ph.label,
      matches: (ORDERED_IDS[ph.key] ?? []).map((id) => this.matchVm(id)),
    }));
    const final = required(this.store.knockout()[FINAL_ID], 'finale manquante');
    return {
      rounds,
      thirdPlace: this.matchVm(THIRD_PLACE_ID),
      champion: final.decided ? teamName(final.winner) : null,
      runnerUp: final.decided ? teamName(final.loser) : null,
    };
  });

  protected set(id: MatchId, side: Side, value: number | null): void {
    this.store.setScore(id, side, value);
  }

  protected pickWinner(id: MatchId, side: Side): void {
    this.store.pickPenaltyWinner(id, side);
  }

  private matchVm(id: MatchId) {
    const m = required(this.store.knockout()[id], `match ${id} manquant`);
    const eff = this.store.effective()[id];
    const off = this.store.officialResults()[id];
    const cmp = this.store.comparison()[id];
    const bothKnown = m.home !== null && m.away !== null;
    const editable = this.store.isEditable(id);
    const isDraw =
      !!eff &&
      Number.isInteger(eff.home) &&
      Number.isInteger(eff.away) &&
      eff.home === eff.away;
    const koWinnerName =
      off && off.home === off.away && off.winner ? teamName(m[off.winner]) : null;

    return {
      id,
      meta: `Match ${id.slice(1)}`,
      schedule: SCHEDULE[id] ?? null,
      inputDisabled: !editable || !bothKnown,
      needsAttention: m.needsAttention,
      showPenalty: editable && bothKnown && isDraw,
      penaltyHome: eff?.winner === 'home',
      penaltyAway: eff?.winner === 'away',
      home: {
        teamId: m.home,
        name: teamName(m.home),
        penaltyAria: `Vainqueur aux tirs au but : ${teamName(m.home) ?? ''}`,
        display:
          m.home === null
            ? (FEEDER_LABEL[`${id}-home`] ?? 'À déterminer')
            : (teamName(m.home) ?? ''),
        tbd: m.home === null,
        winner: m.decided && m.winner === m.home,
        value: eff?.home ?? null,
      },
      away: {
        teamId: m.away,
        name: teamName(m.away),
        penaltyAria: `Vainqueur aux tirs au but : ${teamName(m.away) ?? ''}`,
        display:
          m.away === null
            ? (FEEDER_LABEL[`${id}-away`] ?? 'À déterminer')
            : (teamName(m.away) ?? ''),
        tbd: m.away === null,
        winner: m.decided && m.winner === m.away,
        value: eff?.away ?? null,
      },
      official: off ?? null,
      prediction: cmp?.prediction ?? null,
      verdict: cmp?.verdict ?? null,
      koWinnerName,
    };
  }
}
