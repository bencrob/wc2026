---
tags: [pronoscup, technique, architecture]
---

# Règles techniques

Le « comment ». La logique métier décrite dans [[Règles métier]] est implémentée ici.

## Stack
- **Angular 22** standalone, **zoneless** (`provideZonelessChangeDetection`), **signals**.
- **Angular Material** (M3, thème via variables `--mat-sys-*`).
- **Vitest** (unitaire) + **Playwright** (E2E) → [[Tests et qualité]].
- **PWA** (`@angular/service-worker`) → [[Déploiement]].
- **ESLint** (angular-eslint, flat config), **Prettier**, **TypeScript strict** (`strict`, `noUncheckedIndexedAccess`).

## Architecture hexagonale
Dépendances dirigées vers le **domaine** (qui ne connaît ni Angular ni le navigateur) :
```
presentation/   composants Material (OnPush)
application/    TournamentStore (signals) + tokens DI
infrastructure/ adapters (LocalStorage, résultats serveur, fichier)
domain/         modèles + moteurs PURS + policies + données
```
- `domain/` : **aucun import Angular**. Moteurs : `GroupStageEngine`, `KnockoutStageEngine`, `TournamentEngine`, `PredictionComparator`, `RankingComparator`. Données figées dans `domain/data/`.
- `application/` : `TournamentStore`, jetons `PERSISTENCE` / `OFFICIAL_RESULTS` / `FILE_IO`.
- `infrastructure/` : `LocalStoragePersistence`, `RemoteOfficialResultsProvider`, `BrowserFileIo`.

## SOLID
- **S** : un moteur = une responsabilité.
- **O** : `RankingComparator` est une **Strategy** (ajouter une règle de départage sans toucher au moteur).
- **L** : ports substituables (`InMemoryPersistence`, `StaticOfficialResultsProvider` en test).
- **I** : ports étroits (`OfficialResultsPort` = lecture seule `fetch()`).
- **D** : dépendances sur des `InjectionToken`, concrets câblés dans `app.config.ts`.

## État & réactivité
- **Source de vérité = 2 signals** : pronostics utilisateur + résultats officiels (serveur).
- **Tout le reste est `computed`** via `TournamentEngine.recompute(predictions, official)` (pur) → zéro état dérivé périmé.
- Score **effectif** = officiel ?? prono (cf. [[Règles métier#Résultats officiels & verrouillage]]).

## Persistance
- `effect()` dans le store → sauvegarde **réactive** des pronostics (clé LocalStorage `world-cup-2026-predictions`).
- Les **officiels ne sont pas persistés localement** : rechargés du serveur à chaque démarrage.

## Verrouillage
- `MatchAccessPolicy.isEditable(id, official)` (pur). **Défense en profondeur** : `disabled` côté UI **et** garde dans `setScore` / `pickPenaltyWinner` (mutation ignorée si officiel).

## Conventions UI
- Préfixe sélecteurs **`wc`**, **OnPush** partout, nouveau control-flow `@if`/`@for`/`@switch`.
- Onglets `mat-tab-group` non routés ; **`@defer (on idle)`** sur 3es/Tableau (chargement initial allégé) ; **swipe tactile** (`SwipeDirective`).
- **Thèmes** : classe `theme-<id>` sur `<body>` surchargeant `--mat-sys-*` + variables maison (`--wc-toolbar`, `--wc-stripe`, `--wc-qualified/third/winner`). Mode sombre = `body.wc-dark` (`color-scheme: dark`).
- **Tableau final** = arbre : colonnes ordonnées par parcours infixe de `BRACKET_LINKS`, centrage `space-around`.

## Performance (décisions)
- Polices **auto-hébergées**, **latin only** (Roboto) + variante **filled** des Material Icons.
- **App-shell** inline dans `index.html` (peint avant le JS) → FCP/LCP.
- `orderedIds` du bracket **précalculé** (pas de tri à chaque détection).
- Bundle ~**120 ko** transfert.

Voir aussi : [[Tests et qualité]] · [[Déploiement]].
