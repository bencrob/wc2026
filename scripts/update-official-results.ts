/**
 * Auto-updates public/official-results.json from a sports data feed.
 *
 * Run by .github/workflows/update-scores.yml every ~30 min during the tournament.
 * Behaviour: for every match whose kick-off is ≥ 2 h ago and which is NOT already
 * in the file, take the feed's FINISHED result; otherwise leave it for the next run
 * (this is the "+2 h then retry" cadence). Manual entries are never overwritten.
 *
 * Exits 0 on every "nothing to do" path (missing token, no coverage, no change,
 * outside the tournament window) so the workflow never fails spuriously.
 *
 * Env: FOOTBALL_DATA_TOKEN (required to fetch), NOW (ISO, optional override for tests).
 * Flags: --dry-run (compute + print, do not write).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { kickoffMsOf } from '../src/app/domain/data/schedule';
import { MatchId, ScoreMap } from '../src/app/domain/models';
import { ScoreMapValidator } from '../src/app/domain/validation/score-map.validator';
import { buildResults } from './lib/map-results';
import { fetchFinishedMatches } from './lib/sports-api';

const RESULTS_PATH = resolve(import.meta.dirname, '../public/official-results.json');
const DUE_DELAY_MS = 2 * 60 * 60 * 1000; // verrou/relevé : 2 h après le coup d'envoi
const WINDOW_START = Date.parse('2026-06-11T00:00:00Z');
const WINDOW_END = Date.parse('2026-07-20T23:59:59Z');

function nowMs(): number {
  const raw = process.env['NOW'];
  if (raw) {
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return Date.now();
}

function readBase(): ScoreMap {
  try {
    const data: unknown = JSON.parse(readFileSync(RESULTS_PATH, 'utf8'));
    const res = new ScoreMapValidator().validateOfficial(data);
    return res.ok ? res.value : {};
  } catch {
    return {};
  }
}

function serialize(results: ScoreMap): string {
  const ids = Object.keys(results).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  const ordered: Record<MatchId, unknown> = {};
  for (const id of ids) ordered[id] = results[id];
  return `${JSON.stringify({ version: 1, results: ordered }, null, 2)}\n`;
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const now = nowMs();

  if (now < WINDOW_START || now > WINDOW_END) {
    console.log('Hors fenêtre du tournoi — rien à faire.');
    return;
  }

  const token = process.env['FOOTBALL_DATA_TOKEN'];
  if (!token) {
    console.log('FOOTBALL_DATA_TOKEN absent — rien à faire.');
    return;
  }

  const base = readBase();

  let feed;
  try {
    feed = await fetchFinishedMatches(token);
  } catch (error) {
    console.log(`Source injoignable (${String(error)}) — rien à faire.`);
    return;
  }
  if (feed.length === 0) {
    console.log('Aucun match terminé renvoyé (couverture CDM 2026 ?) — rien à faire.');
    return;
  }

  const isDue = (id: MatchId): boolean => {
    const ko = kickoffMsOf(id);
    return ko !== undefined && now >= ko + DUE_DELAY_MS;
  };

  const { results, addedIds, unmappedTeams, finishedCount, recognizedCount, mappedCount } =
    buildResults(feed, base, { isDue });

  console.log(
    `Flux : ${feed.length} match(s) reçus · ${finishedCount} terminé(s) · ` +
      `${recognizedCount} équipes reconnues · ${mappedCount} mappé(s) · ${addedIds.length} nouveau(x).`,
  );
  if (finishedCount > 0 && mappedCount === 0) {
    console.warn(
      '⚠️ Des matchs terminés mais aucun mappé : édition/couverture API suspecte (mauvaise compétition ?).',
    );
  }
  if (unmappedTeams.length > 0) {
    console.warn(`⚠️ Équipes non mappées : ${unmappedTeams.join(', ')}`);
  }

  const check = new ScoreMapValidator().validateOfficial({ version: 1, results });
  if (!check.ok) {
    console.error(`Résultats fusionnés invalides : ${check.error}`);
    process.exitCode = 1;
    return;
  }

  if (addedIds.length === 0) {
    console.log('Aucun nouveau résultat — fichier inchangé.');
    return;
  }

  console.log(`Nouveaux résultats : ${addedIds.join(', ')}`);
  if (dryRun) {
    console.log('[dry-run] fichier non écrit.');
    return;
  }
  writeFileSync(RESULTS_PATH, serialize(results), 'utf8');
  console.log(`✓ ${RESULTS_PATH} mis à jour (${addedIds.length} match(s)).`);
}

main().catch((error: unknown) => {
  console.error(`Échec inattendu : ${String(error)}`);
  process.exitCode = 1;
});
