import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AccountSyncService } from '../../../application/account-sync.service';
import { PROFILE } from '../../../application/tokens';
import { LeaderboardRow } from '../../../domain/ports/profile.port';
import { CountUpDirective } from '../../ui/count-up.directive';

@Component({
  selector: 'wc-leaderboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, RouterLink, CountUpDirective],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent {
  private readonly profile = inject(PROFILE);
  private readonly account = inject(AccountSyncService);

  protected readonly loading = signal(true);
  private readonly rows = signal<readonly LeaderboardRow[]>([]);

  /** Lignes prêtes à afficher (rang/médaille + surlignage joueur) — zéro logique en template. */
  protected readonly vm = computed(() => {
    const me = this.account.pseudo();
    return this.rows().map((r, i) => {
      const medal = ['🏆', '🥈', '🥉'][i] ?? '';
      return {
        badge: medal !== '' ? medal : String(i + 1),
        top: i === 0,
        delayMs: i * 40,
        pseudo: r.pseudo,
        points: r.points,
        exact: r.exact,
        outcome: r.outcome,
        me: me !== null && r.pseudo === me,
      };
    });
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
