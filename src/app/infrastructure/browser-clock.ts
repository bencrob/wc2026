import { Injectable } from '@angular/core';
import { ClockPort } from '../domain/ports/clock.port';

/**
 * Horloge navigateur. Supporte un paramètre d'URL `?now=<ISO>` (ex.
 * `?now=2026-06-20T18:00:00Z`) pour figer le temps — utile pour prévisualiser
 * les verrous au coup d'envoi et rendre les tests e2e déterministes.
 */
@Injectable({ providedIn: 'root' })
export class BrowserClock implements ClockPort {
  private readonly override = readNowOverride();

  now(): number {
    return this.override ?? Date.now();
  }
}

function readNowOverride(): number | undefined {
  if (typeof location === 'undefined') return undefined;
  const raw = new URLSearchParams(location.search).get('now');
  if (raw === null) return undefined;
  const ms = Date.parse(raw);
  return Number.isNaN(ms) ? undefined : ms;
}
