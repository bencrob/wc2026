import { Injectable } from '@angular/core';
import { MatchId } from '../domain/models';
import { NotificationsStatePort } from '../domain/ports/notifications-state.port';

/** État des notifications in-app en LocalStorage. Échec silencieux (quota / indispo). */
@Injectable({ providedIn: 'root' })
export class LocalStorageNotifications implements NotificationsStatePort {
  private static readonly KEY = 'wc-seen-official';

  loadSeenOfficial(): readonly MatchId[] | null {
    try {
      const raw = localStorage.getItem(LocalStorageNotifications.KEY);
      if (!raw) return null;
      const data: unknown = JSON.parse(raw);
      return Array.isArray(data) ? data.filter((v): v is string => typeof v === 'string') : null;
    } catch {
      return null;
    }
  }

  saveSeenOfficial(ids: readonly MatchId[]): void {
    try {
      localStorage.setItem(LocalStorageNotifications.KEY, JSON.stringify(ids));
    } catch {
      /* quota / indispo : ignoré */
    }
  }
}
