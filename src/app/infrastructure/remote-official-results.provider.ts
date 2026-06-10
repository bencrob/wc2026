import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ScoreMap } from '../domain/models';
import { OfficialResultsPort } from '../domain/ports/official-results.port';
import { ScoreMapValidator } from '../domain/validation/score-map.validator';

/**
 * Récupère les résultats officiels depuis un fichier statique déployé (serveur).
 * Saisie MANUELLE côté équipe — aucune source/API officielle externe interrogée.
 * Tolérant aux pannes : renvoie {} si absent / illisible / invalide.
 */
@Injectable({ providedIn: 'root' })
export class RemoteOfficialResultsProvider implements OfficialResultsPort {
  private readonly http = inject(HttpClient);
  private readonly validator = new ScoreMapValidator();
  private static readonly URL = 'official-results.json';

  async fetch(): Promise<ScoreMap> {
    try {
      const data = await firstValueFrom(
        this.http.get<unknown>(RemoteOfficialResultsProvider.URL),
      );
      const res = this.validator.validateOfficial(data);
      return res.ok ? res.value : {};
    } catch {
      return {};
    }
  }
}
