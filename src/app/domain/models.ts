/**
 * Modèles du domaine — types purs, sans dépendance Angular ni navigateur.
 * Toute la logique métier (moteurs, policies) s'appuie sur ces types.
 */

export type GroupId =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export type Side = 'home' | 'away';

/** Identifiant d'équipe, ex. "A1".."L4". */
export type TeamId = string;

/** Identifiant de match, ex. "M1".."M104". */
export type MatchId = string;

export interface Team {
  readonly id: TeamId;
  readonly name: string;
  readonly flag: string;
  readonly groupId: GroupId;
}

/** Score d'un match. `winner` n'a de sens qu'en KO sur un score nul (tirs au but). */
export interface Score {
  readonly home: number;
  readonly away: number;
  readonly winner?: Side;
}

/** Table des scores : clé absente = match non joué. */
export type ScoreMap = Readonly<Record<MatchId, Score>>;

/** Fixture de poule (M1..M72), généré depuis le pattern round-robin. */
export interface GroupFixture {
  readonly id: MatchId;
  readonly groupId: GroupId;
  readonly matchday: number;
  readonly home: TeamId;
  readonly away: TeamId;
}

export interface MatchSchedule {
  readonly date: string;
  readonly venue: string;
}

/** Source d'un côté d'un match de 16es (R32). */
export type SlotSource =
  | { readonly kind: 'winner'; readonly group: GroupId }
  | { readonly kind: 'runnerUp'; readonly group: GroupId }
  | { readonly kind: 'third'; readonly slot: MatchId };

export interface R32Slot {
  readonly id: MatchId;
  readonly home: SlotSource;
  readonly away: SlotSource;
}

export interface BracketTarget {
  readonly match: MatchId;
  readonly side: Side;
}

/** Lien sortant d'un match KO : où vont vainqueur (et perdant pour les demies). */
export interface BracketLink {
  readonly match: MatchId;
  readonly winnerTo?: BracketTarget;
  readonly loserTo?: BracketTarget;
}

export interface KnockoutPhase {
  readonly key: string;
  readonly label: string;
  readonly from: number;
  readonly to: number;
}

/** Ligne de classement (mutable pendant le calcul). */
export interface StandingRow {
  teamId: TeamId;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  rank: number;
}

export interface GroupResult {
  readonly standings: StandingRow[];
  readonly complete: boolean;
  readonly tiedRanks: ReadonlySet<number>;
}

export interface ThirdPlaceRow {
  teamId: TeamId;
  groupId: GroupId;
  points: number;
  gd: number;
  gf: number;
  rank: number;
  qualified: boolean;
}

export interface ThirdRanking {
  readonly ranking: ThirdPlaceRow[];
  readonly resolved: boolean;
}

export interface KnockoutMatch {
  id: MatchId;
  home: TeamId | null;
  away: TeamId | null;
  homeScore: number | null;
  awayScore: number | null;
  winner: TeamId | null;
  loser: TeamId | null;
  decided: boolean;
  needsAttention: boolean;
}

export type KnockoutBracket = Record<MatchId, KnockoutMatch>;

export interface Qualifiers {
  readonly winners: Partial<Record<GroupId, TeamId>>;
  readonly runnersUp: Partial<Record<GroupId, TeamId>>;
  readonly bestThirds: readonly TeamId[];
}

/** Verdict de comparaison prono vs résultat officiel. */
export type Verdict = 'exact' | 'outcome' | 'wrong';

export interface Comparison {
  readonly verdict: Verdict | null;
  readonly prediction: Score | null;
}

export interface ComparisonSummary {
  official: number;
  exact: number;
  outcome: number;
  wrong: number;
  noPrediction: number;
}

export interface Progress {
  readonly groupsDone: number;
  readonly koDone: number;
  readonly total: number;
  readonly pct: number;
}

/** État dérivé complet, recalculé à chaque changement. Jamais persisté. */
export interface RuntimeState {
  readonly groups: Record<GroupId, GroupResult>;
  readonly thirdPlaceRanking: ThirdPlaceRow[];
  readonly thirdResolved: boolean;
  readonly qualifiers: Qualifiers;
  readonly thirdPlaceAssignment: Record<MatchId, TeamId>;
  readonly knockout: KnockoutBracket;
  readonly effective: ScoreMap;
  readonly officialResults: ScoreMap;
  readonly comparison: Record<MatchId, Comparison>;
  readonly comparisonSummary: ComparisonSummary;
  readonly progress: Progress;
}
