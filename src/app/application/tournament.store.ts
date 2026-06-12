import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { MatchAccessPolicy } from '../domain/policies/match-access.policy';
import { kickoffMsOf } from '../domain/data/schedule';
import { DraftScore, DraftScoreMap, MatchId, ScoreMap, Side } from '../domain/models';
import { TournamentEngine } from '../domain/engines/tournament.engine';
import { ScoreMapValidator } from '../domain/validation/score-map.validator';
import { Result, ok } from '../domain/validation/result';
import { CLOCK, FILE_IO, OFFICIAL_RESULTS, PERSISTENCE } from './tokens';

/** Cadence de réévaluation des verrous horaires (UI passe en lecture seule au coup d'envoi). */
const CLOCK_TICK_MS = 30_000;

/**
 * État applicatif réactif.
 *
 * Source de vérité = 2 signals (pronostics utilisateur + officiels serveur).
 * Tout le reste est `computed` depuis le moteur pur → zéro état dérivé périmé.
 * Le verrouillage par résultat officiel est appliqué dans les mutations (garde),
 * pas seulement via `disabled` en UI (défense en profondeur).
 */
@Injectable({ providedIn: 'root' })
export class TournamentStore {
  private readonly persistence = inject(PERSISTENCE);
  private readonly officialSrc = inject(OFFICIAL_RESULTS);
  private readonly fileIo = inject(FILE_IO);
  private readonly clock = inject(CLOCK);

  private readonly engine = new TournamentEngine();
  private readonly access = new MatchAccessPolicy();
  private readonly validator = new ScoreMapValidator();

  private readonly _predictions = signal<DraftScoreMap>(this.persistence.loadPredictions());
  private readonly _official = signal<ScoreMap>({});
  /** Instant courant (ms epoch), réévalué périodiquement pour verrouiller au coup d'envoi. */
  private readonly _now = signal(this.clock.now());

  readonly runtime = computed(() => this.engine.recompute(this._predictions(), this._official()));
  readonly groups = computed(() => this.runtime().groups);
  readonly thirdPlaceRanking = computed(() => this.runtime().thirdPlaceRanking);
  readonly thirdResolved = computed(() => this.runtime().thirdResolved);
  readonly knockout = computed(() => this.runtime().knockout);
  readonly thirdPlaceAssignment = computed(() => this.runtime().thirdPlaceAssignment);
  readonly progress = computed(() => this.runtime().progress);
  readonly comparison = computed(() => this.runtime().comparison);
  readonly comparisonSummary = computed(() => this.runtime().comparisonSummary);
  readonly effective = computed(() => this.runtime().effective);
  readonly officialResults = this._official.asReadonly();

  constructor() {
    // Persistance réactive des pronostics (les officiels viennent du serveur, non sauvegardés).
    effect(() => this.persistence.savePredictions(this._predictions()));
    // Tic d'horloge : fait basculer les matchs en lecture seule dès leur coup d'envoi.
    const tick = setInterval(() => this._now.set(this.clock.now()), CLOCK_TICK_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(tick));
  }

  /** Un match est en lecture seule s'il a un résultat officiel OU si son coup d'envoi est passé. */
  isEditable(id: MatchId): boolean {
    return this.access.isEditable(id, this._official(), kickoffMsOf(id), this._now());
  }

  /** Charge les résultats officiels (serveur) — à appeler au démarrage. */
  async loadOfficial(): Promise<void> {
    this._official.set(await this.officialSrc.fetch());
  }

  /** Saisit/efface un côté d'un score. `value === null` efface ce côté. */
  setScore(id: MatchId, side: Side, value: number | null): void {
    if (!this.isEditable(id)) return; // verrouillage officiel
    if (value !== null && (!Number.isInteger(value) || value < 0)) return;
    this._predictions.update((map) => this.applyScore(map, id, side, value));
  }

  /** Désigne le vainqueur aux tirs au but d'un match KO nul. */
  pickPenaltyWinner(id: MatchId, side: Side): void {
    if (!this.isEditable(id)) return;
    this._predictions.update((map) => {
      const cur = map[id];
      if (!cur || cur.home !== cur.away) return map;
      return { ...map, [id]: { ...cur, winner: side } };
    });
  }

  importPredictions(json: unknown): Result<void> {
    const res = this.validator.validatePredictions(json);
    if (!res.ok) return res;
    this._predictions.set(res.value);
    return ok(undefined);
  }

  exportPredictions(): string {
    return JSON.stringify({ version: 1, scores: this._predictions() }, null, 2);
  }

  downloadPredictions(): void {
    this.fileIo.download('world-cup-2026-predictions.json', this.exportPredictions());
  }

  reset(): void {
    this._predictions.set({});
  }

  /** Mise à jour immuable d'un score ; tolère un côté manquant (match non saisi). */
  private applyScore(
    map: DraftScoreMap,
    id: MatchId,
    side: Side,
    value: number | null,
  ): DraftScoreMap {
    const cur: DraftScore = { ...map[id] };
    const home = side === 'home' ? value : (cur.home ?? null);
    const away = side === 'away' ? value : (cur.away ?? null);
    const isDraw = home !== null && away !== null && home === away;
    const next: Record<MatchId, DraftScore> = { ...map };

    if (home === null && away === null) {
      delete next[id];
      return next;
    }
    next[id] = {
      ...(home !== null ? { home } : {}),
      ...(away !== null ? { away } : {}),
      // « winner » conservé seulement si le match reste un nul saisi des deux côtés.
      ...(isDraw && cur.winner ? { winner: cur.winner } : {}),
    };
    return next;
  }
}
