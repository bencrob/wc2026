import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TournamentStore } from './application/tournament.store';
import { FILE_IO } from './application/tokens';
import { ThemeService } from './presentation/theming/theme.service';
import { GroupsComponent } from './presentation/features/groups/groups.component';
import { KnockoutComponent } from './presentation/features/knockout/knockout.component';
import { ThirdsComponent } from './presentation/features/thirds/thirds.component';
import { SwipeDirective } from './presentation/ui/swipe.directive';

@Component({
  selector: 'wc-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatTabsModule,
    SwipeDirective,
    GroupsComponent,
    ThirdsComponent,
    KnockoutComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  /** Onglet actif — sert à ne monter QUE le contenu visible (perf : pas de re-render des tables masquées). */
  protected readonly selected = signal(0);
  protected readonly store = inject(TournamentStore);
  protected readonly theme = inject(ThemeService);
  private readonly fileIo = inject(FILE_IO);
  private readonly snack = inject(MatSnackBar);

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
  protected readonly progressAria = computed(
    () => `${this.store.progress().total} sur 104 matchs renseignés`,
  );
  protected readonly hasOfficial = computed(() => this.store.comparisonSummary().official > 0);

  /** Change d'onglet relativement (swipe) en restant dans [0, 2]. */
  protected goRelative(delta: number): void {
    this.selected.set(Math.min(2, Math.max(0, this.selected() + delta)));
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
