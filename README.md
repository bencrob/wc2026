# Coupe du Monde FIFA 2026 — Pronostics

![Angular](https://img.shields.io/badge/Angular-22-red)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-22%2B-green)
![PWA](https://img.shields.io/badge/PWA-offline-blueviolet)
![ESLint](https://img.shields.io/badge/code%20style-ESLint-4B32C3?logo=eslint&logoColor=white)
![Tests](https://img.shields.io/badge/tests-64%20unit%20%2B%203%20e2e-success)
![License](https://img.shields.io/badge/license-MIT-green)
![Last Commit](https://img.shields.io/github/last-commit/bencrob/wc2026)

Application de pronostics pour la Coupe du Monde FIFA 2026 (48 équipes, 12 groupes,
104 matchs) : saisie des scores, classements et qualification automatiques (2 premiers
+ 8 meilleurs 3es), tableau final à 32 avec propagation des vainqueurs, comparaison des
pronostics aux résultats officiels. Application **statique, hors-ligne (PWA)**, sans backend.

## Architecture (SOLID, hexagonale)

```
src/app/
  domain/          # TypeScript pur (0 dépendance Angular) : modèles, données,
                   # moteurs (poules, KO, 3es par backtracking), policies, validation, ports
  application/     # TournamentStore : signals + computed (état dérivé) + garde de verrouillage
  infrastructure/  # adapters : LocalStorage, résultats officiels serveur, I/O fichier
  presentation/    # Angular Material (poules, 3es, tableau final, composants UI)
```

- **Signals** (zoneless, OnPush) : 2 sources de vérité (pronostics + officiels) → tout le reste `computed`.
- **Résultats officiels** = fichier serveur `public/official-results.json` **saisi à la main**
  (aucune API externe). Tout match ayant un résultat officiel est **en lecture seule**
  (verrouillage : garde dans le store + `disabled` UI) ; l'officiel pilote classements et
  bracket, le pronostic reste affiché en comparaison (✓ exact / ≈ bon résultat / ✗ raté).
- **PWA offline** : service worker, polices auto-hébergées, `official-results.json` en cache *freshness*.

## Démarrage

```bash
npm install
npm start            # http://localhost:4200
```

## Tests

```bash
npm test             # tests unitaires (Vitest) — 55
npm run e2e          # tests end-to-end (Playwright) — 3
```

## Build de production (PWA)

```bash
npm run build        # sortie : dist/wcng2026/browser
```

> Le service worker n'est actif qu'en build de production. Pour tester l'offline,
> servez `dist/wcng2026/browser` (ex. `npx http-server dist/wcng2026/browser`).

## Mettre à jour les résultats officiels

Éditer `public/official-results.json` au fil des vrais matchs, puis redéployer :

```json
{
  "version": 1,
  "results": {
    "M73": { "home": 1, "away": 1, "winner": "home" }
  }
}
```

Les matchs concernés passent automatiquement en lecture seule au prochain chargement.
