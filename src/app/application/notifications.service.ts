import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SCHEDULE, kickoffMsOf } from '../domain/data/schedule';
import { Verdict } from '../domain/models';
import { CLOCK, NOTIFICATIONS_STATE } from './tokens';
import { TournamentStore } from './tournament.store';

/** Barème (identique au moteur) pour annoncer les points gagnés. */
const POINTS: Readonly<Record<Verdict, number>> = { exact: 3, outcome: 1, wrong: 0 };
/** Fenêtre « se verrouille bientôt ». */
const LOCK_WINDOW_MS = 60 * 60 * 1000;

/**
 * Notifications in-app (toasts), affichées une fois au démarrage :
 * 1. nouveaux résultats officiels depuis la dernière visite + points gagnés ;
 * 2. sinon, rappel des matchs à pronostiquer qui se verrouillent dans l'heure.
 */
@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly store = inject(TournamentStore);
  private readonly clock = inject(CLOCK);
  private readonly state = inject(NOTIFICATIONS_STATE);
  private readonly snack = inject(MatSnackBar);

  /** À appeler une fois au démarrage (après le chargement des résultats officiels). */
  checkOnStartup(): void {
    if (this.notifyNewOfficial()) return; // une seule notif au démarrage
    this.notifyUpcomingLocks();
  }

  /** Nouveaux résultats officiels depuis la dernière visite. @returns true si notifié. */
  private notifyNewOfficial(): boolean {
    const currentIds = Object.keys(this.store.officialResults());
    const seen = this.state.loadSeenOfficial();
    this.state.saveSeenOfficial(currentIds);
    if (seen === null) return false; // 1re visite : on pose la référence, sans notifier

    const seenSet = new Set(seen);
    const fresh = currentIds.filter((id) => !seenSet.has(id));
    if (fresh.length === 0) return false;

    const comparison = this.store.comparison();
    let points = 0;
    for (const id of fresh) {
      const verdict = comparison[id]?.verdict;
      if (verdict) points += POINTS[verdict];
    }
    const gain = points > 0 ? ` — tu as marqué +${points} pt(s) !` : '.';
    this.toast(`🎯 ${fresh.length} nouveau(x) résultat(s) officiel(s)${gain}`);
    return true;
  }

  /** Matchs non pronostiqués qui se verrouillent dans l'heure. @returns true si notifié. */
  private notifyUpcomingLocks(): boolean {
    const now = this.clock.now();
    const predictions = this.store.predictions();
    let count = 0;
    for (const id of Object.keys(SCHEDULE)) {
      const ko = kickoffMsOf(id);
      if (ko === undefined || ko <= now || ko > now + LOCK_WINDOW_MS) continue;
      if (!this.store.isEditable(id)) continue;
      const p = predictions[id];
      const complete = typeof p?.home === 'number' && typeof p?.away === 'number';
      if (!complete) count++;
    }
    if (count === 0) return false;
    this.toast(`⏳ ${count} match(s) à pronostiquer se verrouillent dans moins d'1 h.`);
    return true;
  }

  private toast(message: string): void {
    this.snack.open(message, 'OK', { duration: 6000 });
  }
}
