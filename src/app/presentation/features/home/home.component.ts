import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { TournamentStore } from '../../../application/tournament.store';
import { GroupsComponent } from '../groups/groups.component';
import { KnockoutComponent } from '../knockout/knockout.component';
import { ThirdsComponent } from '../thirds/thirds.component';
import { CelebrationService } from '../../ui/celebration.service';
import { SwipeDirective } from '../../ui/swipe.directive';

@Component({
  selector: 'wc-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressBarModule, MatTabsModule, SwipeDirective, GroupsComponent, ThirdsComponent, KnockoutComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly store = inject(TournamentStore);
  private readonly celebrate = inject(CelebrationService);

  /** Onglet actif — ne monte QUE le contenu visible (perf : pas de re-render des tables masquées). */
  protected readonly selected = signal(0);

  protected readonly progressAria = computed(
    () => `${this.store.progress().total} sur 104 matchs renseignés`,
  );
  protected readonly hasOfficial = computed(() => this.store.comparisonSummary().official > 0);

  constructor() {
    // 🎉 Confettis sur transition — pas sur l'état initial (pas de spam au chargement).
    let prevTotal: number | null = null;
    effect(() => {
      const total = this.store.progress().total;
      if (prevTotal !== null && prevTotal < 104 && total >= 104) void this.celebrate.rain();
      prevTotal = total;
    });
    let prevExact: number | null = null;
    effect(() => {
      const exact = this.store.comparisonSummary().exact;
      if (prevExact !== null && exact > prevExact) void this.celebrate.burst();
      prevExact = exact;
    });
  }

  /** Change d'onglet relativement (swipe) en restant dans [0, 2]. */
  protected goRelative(delta: number): void {
    this.selected.set(Math.min(2, Math.max(0, this.selected() + delta)));
  }
}
