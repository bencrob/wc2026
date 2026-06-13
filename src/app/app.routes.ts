import { Routes } from '@angular/router';
import { HomeComponent } from './presentation/features/home/home.component';

/** Page d'accueil (pronostics) + page classement (chargée paresseusement). */
export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Pronoscup 2026' },
  {
    path: 'classement',
    title: 'Classement — Pronoscup 2026',
    loadComponent: () =>
      import('./presentation/features/leaderboard/leaderboard.component').then(
        (m) => m.LeaderboardComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
