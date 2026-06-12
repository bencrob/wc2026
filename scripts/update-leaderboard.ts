/**
 * Recalcule le classement dans Supabase à partir des résultats officiels
 * (public/official-results.json) et des pronostics de tous les comptes.
 *
 * Lancé par .github/workflows/update-scores.yml après la mise à jour des scores
 * (le classement ne change que quand l'officiel change). Utilise la clé
 * service_role (contourne la RLS) pour lire les pronostics privés et écrire la
 * table publique `leaderboard`.
 *
 * Exits 0 sur tout chemin « rien à faire » (env absent) pour ne jamais faire
 * échouer le workflow.
 *
 * Env requis : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 * Flags : --dry-run (calcule + affiche, n'écrit pas).
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ScoreMap } from '../src/app/domain/models';
import { ScoreMapValidator } from '../src/app/domain/validation/score-map.validator';
import { PlayerPrediction, computeLeaderboard } from './lib/compute-leaderboard';

const RESULTS_PATH = resolve(import.meta.dirname, '../public/official-results.json');

function readOfficial(): ScoreMap {
  try {
    const data: unknown = JSON.parse(readFileSync(RESULTS_PATH, 'utf8'));
    const res = new ScoreMapValidator().validateOfficial(data);
    return res.ok ? res.value : {};
  } catch {
    return {};
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const url = process.env['SUPABASE_URL'];
  const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!url || !serviceKey) {
    console.log('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY absents — rien à faire.');
    return;
  }

  const official = readOfficial();
  const client = createClient(url, serviceKey, { auth: { persistSession: false } });
  const validator = new ScoreMapValidator();

  const profilesRes = await client.from('profiles').select('user_id, pseudo');
  if (profilesRes.error) {
    console.error(`Lecture profiles impossible : ${profilesRes.error.message}`);
    process.exitCode = 1;
    return;
  }
  const pseudoByUser = new Map<string, string>();
  for (const row of profilesRes.data ?? []) pseudoByUser.set(row.user_id, row.pseudo);

  const predRes = await client.from('predictions').select('user_id, scores, version');
  if (predRes.error) {
    console.error(`Lecture predictions impossible : ${predRes.error.message}`);
    process.exitCode = 1;
    return;
  }

  const players: PlayerPrediction[] = [];
  for (const row of predRes.data ?? []) {
    const pseudo = pseudoByUser.get(row.user_id);
    if (!pseudo) continue; // pas de pseudo → hors classement
    const valid = validator.validatePredictions({ version: row.version, scores: row.scores });
    players.push({ userId: row.user_id, pseudo, scores: valid.ok ? valid.value : {} });
  }

  const rows = computeLeaderboard(players, official);
  console.log(`Classement calculé : ${rows.length} joueur(s).`);
  if (dryRun) {
    console.log('[dry-run] non écrit :', JSON.stringify(rows, null, 2));
    return;
  }
  if (rows.length === 0) {
    console.log('Aucun joueur — rien à écrire.');
    return;
  }

  const stamped = rows.map((r) => ({ ...r, updated_at: new Date().toISOString() }));
  const { error } = await client.from('leaderboard').upsert(stamped, { onConflict: 'user_id' });
  if (error) {
    console.error(`Écriture leaderboard impossible : ${error.message}`);
    process.exitCode = 1;
    return;
  }
  console.log(`✓ Classement mis à jour (${rows.length} joueur(s)).`);
}

main().catch((error: unknown) => {
  console.error(`Échec inattendu : ${String(error)}`);
  process.exitCode = 1;
});
