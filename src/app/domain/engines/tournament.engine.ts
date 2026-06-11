import { GROUP_FIXTURE_IDS } from '../data/fixtures';
import { KO_ID_SET, KO_MATCH_IDS } from '../data/knockout-structure';
import { GROUPS } from '../data/teams';
import {
  Comparison,
  ComparisonSummary,
  DraftScore,
  DraftScoreMap,
  GroupId,
  GroupResult,
  MatchId,
  Progress,
  Qualifiers,
  RuntimeState,
  ScoreMap,
  TeamId,
  ThirdPlaceRow,
} from '../models';
import { required } from '../util/required';
import { GroupStageEngine } from './group-stage.engine';
import { countEntered, KnockoutStageEngine } from './knockout-stage.engine';
import { PredictionComparator } from './prediction-comparator';

/**
 * Orchestrateur pur : (pronostics, officiels) → RuntimeState.
 *
 * Précédence : pour chaque match, score effectif = officiel ?? prono.
 * Tout (classements, qualifiés, bracket, progression, comparaison) est dérivé
 * des scores effectifs → un résultat officiel pilote l'app, le prono est ignoré.
 */
export class TournamentEngine {
  constructor(
    private readonly groupStage: GroupStageEngine = new GroupStageEngine(),
    private readonly knockout: KnockoutStageEngine = new KnockoutStageEngine(),
    private readonly comparator: PredictionComparator = new PredictionComparator(),
  ) {}

  recompute(predictions: DraftScoreMap, official: ScoreMap = {}): RuntimeState {
    // 0. Scores effectifs : l'officiel remplace entièrement le prono du même match.
    const effective: Record<MatchId, DraftScore> = { ...predictions };
    for (const id of Object.keys(official)) {
      const o = official[id];
      if (o) effective[id] = o;
    }

    // 1. Classements des 12 groupes
    const groups = new Map<GroupId, GroupResult>(
      GROUPS.map((g) => [g, this.groupStage.computeGroupStandings(g, effective)]),
    );

    // 2. Qualifiés directs (1er/2e par groupe complet)
    const winners: Partial<Record<GroupId, TeamId>> = {};
    const runnersUp: Partial<Record<GroupId, TeamId>> = {};
    for (const g of GROUPS) {
      const gr = groups.get(g);
      if (gr?.complete) {
        winners[g] = required(gr.standings[0], `1er du groupe ${g}`).teamId;
        runnersUp[g] = required(gr.standings[1], `2e du groupe ${g}`).teamId;
      }
    }

    // 3. Classement des 3es + affectation aux créneaux R32
    const third = this.groupStage.rankThirdPlaced(groups);
    const thirdPlaceAssignment: Record<MatchId, TeamId> = {};
    let bestThirds: ThirdPlaceRow[] = [];
    if (third.resolved) {
      bestThirds = third.ranking.filter((t) => t.qualified);
      const qualifiedGroups = bestThirds.map((t) => t.groupId);
      const slotToGroup =
        this.groupStage.assignThirdPlaceSlots(qualifiedGroups) ?? {};
      const teamByGroup = new Map<GroupId, TeamId>(
        bestThirds.map((t) => [t.groupId, t.teamId]),
      );
      for (const slot of Object.keys(slotToGroup)) {
        const grp = slotToGroup[slot];
        const team = grp ? teamByGroup.get(grp) : undefined;
        if (team) thirdPlaceAssignment[slot] = team;
      }
    }

    const qualifiers: Qualifiers = {
      winners,
      runnersUp,
      bestThirds: bestThirds.map((t) => t.teamId),
    };

    // 4. Tableau final
    const knockout = this.knockout.buildAndPropagate(
      qualifiers,
      thirdPlaceAssignment,
      effective,
    );

    // 5. Comparaison prono vs officiel + résumé agrégé
    const comparison: Record<MatchId, Comparison> = {};
    const comparisonSummary: ComparisonSummary = {
      official: 0,
      exact: 0,
      outcome: 0,
      wrong: 0,
      noPrediction: 0,
    };
    for (const id of Object.keys(official)) {
      const off = official[id];
      if (!off) continue;
      comparisonSummary.official++;
      const verdict = this.comparator.verdict(
        predictions[id],
        off,
        KO_ID_SET.has(id),
      );
      if (verdict === null) {
        comparisonSummary.noPrediction++;
        comparison[id] = { verdict: null, prediction: null };
      } else {
        comparisonSummary[verdict]++;
        comparison[id] = { verdict, prediction: predictions[id] ?? null };
      }
    }

    // 6. Progression (sur scores effectifs)
    const groupsDone = countEntered(effective, GROUP_FIXTURE_IDS);
    const koDone = countEntered(effective, KO_MATCH_IDS);
    const total = groupsDone + koDone;
    const progress: Progress = {
      groupsDone,
      koDone,
      total,
      pct: Math.round((total / 104) * 100),
    };

    return {
      groups,
      thirdPlaceRanking: third.ranking,
      thirdResolved: third.resolved,
      qualifiers,
      thirdPlaceAssignment,
      knockout,
      effective,
      officialResults: official,
      comparison,
      comparisonSummary,
      progress,
    };
  }
}
