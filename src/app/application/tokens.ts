import { InjectionToken } from '@angular/core';
import { AuthPort } from '../domain/ports/auth.port';
import { ClockPort } from '../domain/ports/clock.port';
import { FileIoPort } from '../domain/ports/file-io.port';
import { OfficialResultsPort } from '../domain/ports/official-results.port';
import { PersistencePort } from '../domain/ports/persistence.port';
import { NotificationsStatePort } from '../domain/ports/notifications-state.port';
import { ProfilePort } from '../domain/ports/profile.port';
import { RemotePredictionsPort } from '../domain/ports/remote-predictions.port';
import { SyncPromptsPort } from '../domain/ports/sync-prompts.port';

/** Jetons DI pour brancher les implémentations concrètes sur les abstractions (DIP). */
export const PERSISTENCE = new InjectionToken<PersistencePort>('PersistencePort');
export const OFFICIAL_RESULTS = new InjectionToken<OfficialResultsPort>('OfficialResultsPort');
export const FILE_IO = new InjectionToken<FileIoPort>('FileIoPort');

/** Auth Google + persistance distante + profil/classement (cloud, optionnel). */
export const AUTH = new InjectionToken<AuthPort>('AuthPort');
export const REMOTE_PREDICTIONS = new InjectionToken<RemotePredictionsPort>('RemotePredictionsPort');
export const PROFILE = new InjectionToken<ProfilePort>('ProfilePort');
export const SYNC_PROMPTS = new InjectionToken<SyncPromptsPort>('SyncPromptsPort');
export const NOTIFICATIONS_STATE = new InjectionToken<NotificationsStatePort>('NotificationsStatePort');

/** Horloge système par défaut (surchargée par un stub déterministe dans les tests). */
export const CLOCK = new InjectionToken<ClockPort>('ClockPort', {
  providedIn: 'root',
  factory: () => ({ now: () => Date.now() }),
});
