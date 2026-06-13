import { Injectable, inject, signal } from '@angular/core';
import { DraftScoreMap } from '../domain/models';
import { AuthUser } from '../domain/ports/auth.port';
import { Result } from '../domain/validation/result';
import { TournamentStore } from './tournament.store';
import { AUTH, PROFILE, REMOTE_PREDICTIONS, SYNC_PROMPTS } from './tokens';

/**
 * Orchestration de la synchronisation de compte (couche application).
 *
 * À la connexion : garantit un pseudo, charge les pronostics distants, puis
 * décide entre import du local, hydratation depuis le cloud, ou résolution de
 * conflit. Idempotent par compte (ne rejoue pas le flux pour un même userId).
 * Tolérant aux pannes : tout échec réseau laisse l'app en mode local.
 */
@Injectable({ providedIn: 'root' })
export class AccountSyncService {
  private readonly auth = inject(AUTH);
  private readonly remote = inject(REMOTE_PREDICTIONS);
  private readonly profile = inject(PROFILE);
  private readonly prompts = inject(SYNC_PROMPTS);
  private readonly store = inject(TournamentStore);

  private readonly _user = signal<AuthUser | null>(null);
  private readonly _pseudo = signal<string | null>(null);
  /** Compte dont le flux de connexion a déjà été traité (anti-rejeu). */
  private handledUserId: string | null = null;

  readonly user = this._user.asReadonly();
  readonly pseudo = this._pseudo.asReadonly();

  /** Démarre l'écoute des changements de session (appelé à l'initialisation de l'app). */
  start(): void {
    this.auth.onChange((user) => void this.onAuthChange(user));
  }

  async signIn(): Promise<void> {
    try {
      await this.auth.signInWithGoogle();
    } catch (error) {
      this.prompts.notify(error instanceof Error ? error.message : 'Connexion impossible.');
    }
  }

  /** Connexion par e-mail : envoie un code OTP (aucune redirection). */
  requestEmailCode(email: string): Promise<Result<void>> {
    return this.auth.requestEmailCode(email);
  }

  /** Vérifie le code OTP ; la session ouverte déclenche le flux pseudo/sync habituel. */
  verifyEmailCode(email: string, code: string): Promise<Result<void>> {
    return this.auth.verifyEmailCode(email, code);
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
  }

  private async onAuthChange(user: AuthUser | null): Promise<void> {
    this._user.set(user);
    if (!user) {
      this.handledUserId = null;
      this._pseudo.set(null);
      return;
    }
    if (this.handledUserId === user.id) return; // déjà traité
    this.handledUserId = user.id;
    try {
      await this.handleLogin(user);
    } catch {
      this.prompts.notify('Synchronisation indisponible — vos pronostics restent sur cet appareil.');
    }
  }

  private async handleLogin(user: AuthUser): Promise<void> {
    if (!(await this.ensurePseudo(user))) return; // pseudo annulé → on ne synchronise pas

    const local = this.store.predictions();
    const remote = (await this.remote.load(user.id)) ?? {};
    const localEmpty = isEmpty(local);
    const remoteEmpty = isEmpty(remote);

    if (localEmpty && remoteEmpty) return;

    if (remoteEmpty) {
      // Migration : rien dans le compte, des pronostics sur cet appareil.
      if (await this.prompts.confirmImport(count(local))) {
        await this.remote.save(user.id, local);
        this.prompts.notify('Pronostics importés dans votre compte.');
      }
      return;
    }

    if (localEmpty || sameMap(local, remote)) {
      this.hydrate(remote);
      return;
    }

    // Conflit : pronostics différents des deux côtés.
    const choice = await this.prompts.resolveConflict(count(local), count(remote));
    if (choice === 'remote') {
      this.hydrate(remote);
    } else if (choice === 'local') {
      await this.remote.save(user.id, local);
      this.prompts.notify('Pronostics de cet appareil enregistrés dans votre compte.');
    }
  }

  /** Garantit un pseudo enregistré ; renvoie `false` si l'utilisateur annule. */
  private async ensurePseudo(user: AuthUser): Promise<boolean> {
    const existing = await this.profile.get(user.id);
    if (existing) {
      this._pseudo.set(existing.pseudo);
      return true;
    }
    let error: string | undefined;
    const suggested = user.email.split('@')[0] ?? '';
    for (;;) {
      const choice = await this.prompts.choosePseudo({ suggested, error });
      if (choice === null) return false;
      const res = await this.profile.setPseudo(user.id, choice);
      if (res.ok) {
        this._pseudo.set(choice);
        return true;
      }
      error = res.error;
    }
  }

  private hydrate(map: DraftScoreMap): void {
    const res = this.store.hydrateFromRemote(map);
    this.prompts.notify(res.ok ? 'Pronostics chargés depuis votre compte.' : `Données du compte invalides : ${res.error}`);
  }
}

function isEmpty(map: DraftScoreMap): boolean {
  return Object.keys(map).length === 0;
}

function count(map: DraftScoreMap): number {
  return Object.keys(map).length;
}

/** Égalité structurelle indépendante de l'ordre des clés. */
function sameMap(a: DraftScoreMap, b: DraftScoreMap): boolean {
  return canonical(a) === canonical(b);
}

function canonical(map: DraftScoreMap): string {
  const ids = Object.keys(map).sort();
  return JSON.stringify(ids.map((id) => [id, map[id]]));
}
