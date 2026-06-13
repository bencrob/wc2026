import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AccountSyncService } from './application/account-sync.service';
import { TournamentStore } from './application/tournament.store';
import { FILE_IO } from './application/tokens';
import { ThemeService } from './presentation/theming/theme.service';

@Component({
  selector: 'wc-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterOutlet,
    RouterLink,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly store = inject(TournamentStore);
  protected readonly theme = inject(ThemeService);
  protected readonly account = inject(AccountSyncService);
  private readonly fileIo = inject(FILE_IO);
  private readonly snack = inject(MatSnackBar);

  /** Session de compte (cloud) pour la barre d'outils. */
  protected readonly user = this.account.user;
  protected readonly accountLabel = computed(() => {
    const current = this.user();
    if (!current) return 'Se connecter';
    return this.account.pseudo() ?? current.email;
  });

  /** Vues dérivées (zéro logique dans le template). */
  protected readonly darkIcon = computed(() => (this.theme.dark() ? 'light_mode' : 'dark_mode'));
  protected readonly darkLabel = computed(() => (this.theme.dark() ? 'Mode clair' : 'Mode sombre'));
  protected readonly themeItems = computed(() =>
    this.theme.themes.map((t) => ({
      id: t.id,
      label: t.label,
      icon: this.theme.current() === t.id ? 'check' : 'circle',
    })),
  );

  protected signIn(): void {
    void this.account.signIn();
  }

  protected signOut(): void {
    void this.account.signOut();
  }

  protected onExport(): void {
    this.store.downloadPredictions();
    this.toast('Pronostics exportés.');
  }

  protected async onImport(event: Event): Promise<void> {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const text = await this.fileIo.readText(file);
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      this.toast('JSON illisible.');
      return;
    }
    const res = this.store.importPredictions(data);
    this.toast(res.ok ? 'Pronostics importés.' : 'Import refusé : ' + res.error);
  }

  protected onReset(): void {
    if (!confirm('Réinitialiser tous vos pronostics ? Action irréversible.')) return;
    this.store.reset();
    this.toast('Pronostics réinitialisés.');
  }

  private toast(message: string): void {
    this.snack.open(message, 'OK', { duration: 4000 });
  }
}
