/**
 * Minimal typed client for the football-data.org REST API (v4).
 * Only the fields we need to map results are declared.
 *
 * Free tier: the World Cup competition is `WC`; one call returns every match.
 * ⚠️ Confirm the free plan actually exposes World Cup 2026 before relying on this
 *    (see scripts/update-official-results.ts — it no-ops gracefully if not).
 */

export type FeedStatus =
  | 'SCHEDULED'
  | 'TIMED'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'FINISHED'
  | 'SUSPENDED'
  | 'POSTPONED'
  | 'CANCELLED'
  | string;

export type FeedWinner = 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;

export interface FeedTeam {
  readonly id?: number;
  readonly name?: string;
  readonly shortName?: string;
  readonly tla?: string;
}

/** Un couple de buts domicile/extérieur d'un feed (nul si indisponible). */
export interface FeedSides {
  readonly home: number | null;
  readonly away: number | null;
}

export interface FeedScore {
  readonly winner: FeedWinner;
  /** 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT' (penalties decided the tie). */
  readonly duration: string;
  /** Score du match (90 min + prolongation), HORS tirs au but. */
  readonly fullTime: FeedSides;
  /** Score après 90 min — présent si prolongation ou t.a.b. */
  readonly regularTime?: FeedSides;
  /** Buts de la prolongation — présent si prolongation. */
  readonly extraTime?: FeedSides;
  /** Buts de la SÉANCE de tirs au but uniquement — jamais le score du match. */
  readonly penalties?: FeedSides;
}

export interface FeedMatch {
  readonly id: number;
  readonly utcDate: string;
  readonly status: FeedStatus;
  /** 'GROUP_STAGE' | 'LAST_32' | 'LAST_16' | 'QUARTER_FINALS' | … */
  readonly stage: string;
  readonly group?: string | null;
  readonly homeTeam: FeedTeam;
  readonly awayTeam: FeedTeam;
  readonly score: FeedScore;
}

const BASE = process.env['FOOTBALL_DATA_BASE'] ?? 'https://api.football-data.org/v4';
const COMPETITION = process.env['FOOTBALL_DATA_COMPETITION'] ?? 'WC';

/** Fetches finished matches for the configured competition. Throws on HTTP error. */
export async function fetchFinishedMatches(token: string): Promise<FeedMatch[]> {
  const url = `${BASE}/competitions/${COMPETITION}/matches?status=FINISHED`;
  const res = await fetch(url, { headers: { 'X-Auth-Token': token } });
  if (!res.ok) {
    throw new Error(`football-data.org responded ${res.status} ${res.statusText}`);
  }
  const data: unknown = await res.json();
  if (typeof data !== 'object' || data === null) return [];
  const matches = (data as { matches?: unknown }).matches;
  return Array.isArray(matches) ? (matches as FeedMatch[]) : [];
}
