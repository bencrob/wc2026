import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AccountSyncService } from '../../../application/account-sync.service';
import { PROFILE } from '../../../application/tokens';
import { LeaderboardRow } from '../../../domain/ports/profile.port';

@Component({
  selector: 'wc-leaderboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent {
  private readonly profile = inject(PROFILE);
  private readonly account = inject(AccountSyncService);

  protected readonly loading = signal(true);
  private readonly rows = signal<readonly LeaderboardRow[]>([]);

  /** Lignes prêtes à afficher (rang + surlignage du joueur courant) — zéro logique en template. */
  protected readonly vm = computed(() => {
    const me = this.account.pseudo();
    return this.rows().map((r, i) => ({
      rank: i + 1,
      pseudo: r.pseudo,
      points: r.points,
      exact: r.exact,
      outcome: r.outcome,
      me: me !== null && r.pseudo === me,
    }));
  });
  protected readonly empty = computed(() => !this.loading() && this.vm().length === 0);

  constructor() {
    void this.load();
  }

  protected refresh(): void {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.rows.set(await this.profile.leaderboard());
    this.loading.set(false);
  }
}
