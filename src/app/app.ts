import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TournamentStore } from './application/tournament.store';
import { FILE_IO } from './application/tokens';
import { GroupsComponent } from './presentation/features/groups/groups.component';
import { KnockoutComponent } from './presentation/features/knockout/knockout.component';
import { ThirdsComponent } from './presentation/features/thirds/thirds.component';

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
    GroupsComponent,
    ThirdsComponent,
    KnockoutComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly store = inject(TournamentStore);
  private readonly fileIo = inject(FILE_IO);
  private readonly snack = inject(MatSnackBar);

  protected onExport(): void {
    this.store.downloadPredictions();
    this.toast('Pronostics exportés.');
  }

  protected async onImport(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
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
