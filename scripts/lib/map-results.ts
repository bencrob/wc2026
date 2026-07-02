/**
 * Maps finished feed matches to our internal results map.
 *
 * - Group matches (M1..M72): matched by the unordered team-pair from GROUP_FIXTURES.
 * - Knockout matches (M73..M104): teams are only known at runtime, so we resolve
 *   each KO match's seeded home/away via the pure TournamentEngine, then match by pair.
 * - Orientation: the stored home/away always follows OUR fixture, not the feed's.
 * - Penalty winner: set only on a KO draw, derived from the feed shootout result.
 * - Merge: "manual wins" — a match already present in the base map is never overwritten.
 *
 * A fixed-point loop re-runs the engine after each batch so later KO rounds become
 * resolvable as their feeder results land.
 */
import { GROUP_FIXTURES } from '../../src/app/domain/data/fixtures';
import { KO_ID_SET } from '../../src/app/domain/data/knockout-structure';
import { TournamentEngine } from '../../src/app/domain/engines/tournament.engine';
import { MatchId, Score, ScoreMap, Side, TeamId } from '../../src/app/domain/models';
import { FeedMatch, FeedScore } from './sports-api';
import { resolveTeam } from './team-map';

export function pairKey(a: TeamId, b: TeamId): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/**
 * Score « sur le terrain » (90 min + prolongation), HORS tirs au but.
 * Un match à t.a.b. est nul ici (ex. 1–1) — la séance ne décide que du vainqueur.
 * Priorité à regularTime + extraTime (fiable, exclut les t.a.b.) ; sinon fullTime.
 */
export function onPitchScore(score: FeedScore): { home: number; away: number } | null {
  const rt = score.regularTime;
  if (rt && typeof rt.home === 'number' && typeof rt.away === 'number') {
    const et = score.extraTime;
    return {
      home: rt.home + (typeof et?.home === 'number' ? et.home : 0),
      away: rt.away + (typeof et?.away === 'number' ? et.away : 0),
    };
  }
  const ft = score.fullTime;
  if (typeof ft.home === 'number' && typeof ft.away === 'number') {
    return { home: ft.home, away: ft.away };
  }
  return null;
}

/** Group fixture lookup by unordered team-pair. */
const FIXTURE_BY_PAIR = new Map<string, { id: MatchId; home: TeamId }>();
for (const f of GROUP_FIXTURES) {
  FIXTURE_BY_PAIR.set(pairKey(f.home, f.away), { id: f.id, home: f.home });
}

/** Orients a feed score onto our fixture: returns {home, away} from our point of view. */
export function orient(
  feedHome: TeamId,
  ourHome: TeamId,
  feedHomeGoals: number,
  feedAwayGoals: number,
): { home: number; away: number } {
  return feedHome === ourHome
    ? { home: feedHomeGoals, away: feedAwayGoals }
    : { home: feedAwayGoals, away: feedHomeGoals };
}

/** Penalty-shootout winner expressed in OUR orientation, or null if undecided. */
export function penaltyWinner(
  match: FeedMatch,
  feedHomeId: TeamId,
  feedAwayId: TeamId,
  ourHome: TeamId,
): Side | null {
  const w = match.score.winner;
  if (w !== 'HOME_TEAM' && w !== 'AWAY_TEAM') return null;
  const winningTeam = w === 'HOME_TEAM' ? feedHomeId : feedAwayId;
  return winningTeam === ourHome ? 'home' : 'away';
}

export interface MapOptions {
  /** Only accept a match whose kick-off is at least the cut-off ago. */
  readonly isDue: (id: MatchId) => boolean;
}

export interface MapOutcome {
  readonly results: ScoreMap;
  readonly addedIds: readonly MatchId[];
  readonly unmappedTeams: readonly string[];
  /** Feed matches that are FINISHED with a numeric score. */
  readonly finishedCount: number;
  /** …of which both teams resolved to our ids. */
  readonly recognizedCount: number;
  /** …of which the pairing matched one of our matches (group fixture or KO seed). */
  readonly mappedCount: number;
}

interface ResolvedFeedMatch {
  readonly a: TeamId;
  readonly b: TeamId;
  readonly home: number;
  readonly away: number;
  readonly match: FeedMatch;
}

/** Builds the merged official results from the base map + finished feed matches. */
export function buildResults(
  feed: readonly FeedMatch[],
  base: ScoreMap,
  options: MapOptions,
): MapOutcome {
  const engine = new TournamentEngine();
  const out: Record<MatchId, Score> = { ...base };
  const addedIds: MatchId[] = [];
  const unmappedTeams = new Set<string>();

  // Resolve every finished feed match's teams + on-pitch score (hors t.a.b.) once.
  let finishedCount = 0;
  const resolved: ResolvedFeedMatch[] = [];
  for (const m of feed) {
    if (m.status !== 'FINISHED') continue;
    const onPitch = onPitchScore(m.score);
    if (!onPitch) continue;
    finishedCount++;
    const a = resolveTeam(m.homeTeam);
    const b = resolveTeam(m.awayTeam);
    if (!a) unmappedTeams.add(m.homeTeam.name ?? m.homeTeam.tla ?? '???');
    if (!b) unmappedTeams.add(m.awayTeam.name ?? m.awayTeam.tla ?? '???');
    if (a && b) resolved.push({ a, b, home: onPitch.home, away: onPitch.away, match: m });
  }

  const mappedPairs = new Set<string>();

  let changed = true;
  while (changed) {
    changed = false;
    const rt = engine.recompute({}, out);

    // KO seeded pairs (only matches whose both sides are known at this point).
    const koByPair = new Map<string, { id: MatchId; home: TeamId }>();
    for (const id of Object.keys(rt.knockout)) {
      const ko = rt.knockout[id];
      if (ko?.home && ko.away) koByPair.set(pairKey(ko.home, ko.away), { id, home: ko.home });
    }

    for (const r of resolved) {
      const group = FIXTURE_BY_PAIR.get(pairKey(r.a, r.b));
      const target = group ?? koByPair.get(pairKey(r.a, r.b));
      if (!target) continue;
      mappedPairs.add(pairKey(r.a, r.b));
      const { id, home: ourHome } = target;
      if (out[id]) continue; // manual / already set wins
      if (!options.isDue(id)) continue; // +2h gate

      const s = orient(r.a, ourHome, r.home, r.away);
      const score: Score = { home: s.home, away: s.away };
      if (KO_ID_SET.has(id) && s.home === s.away) {
        const winner = penaltyWinner(r.match, r.a, r.b, ourHome);
        if (!winner) continue; // KO draw without a shootout winner → skip (would be invalid)
        score.winner = winner;
      }
      out[id] = score;
      addedIds.push(id);
      changed = true;
    }
  }

  return {
    results: out,
    addedIds,
    unmappedTeams: [...unmappedTeams],
    finishedCount,
    recognizedCount: resolved.length,
    mappedCount: mappedPairs.size,
  };
}
