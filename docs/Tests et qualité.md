---
tags: [pronoscup, technique, tests]
---

# Tests et qualité

Stratégie de tests et garde-fous qualité. Cf. [[Règles techniques]].

## Pyramide
- **Domaine (Vitest, sans Angular)** — le gros du volume :
  - comparateur, classements, classement des 3es ;
  - **matcher des 3es : les 495 combinaisons** → affectation toujours valide (invariant clé) ;
  - propagation KO + **tirs au but** + perdants → petite finale ;
  - matrice des **verdicts** (exact / bon résultat / raté) ;
  - **précédence officiel→prono**, progression, résumé ;
  - **invariants de données** (104 matchs, 8 créneaux, bracket = DAG → M104, calendrier complet, rang FIFA > 0).
- **Store (TestBed + doubles)** — recalcul, **garde de verrouillage (no-op)**, substitution des ports, persistance, import rejeté/accepté, reset.
- **Composants (TestBed + harness)** — `ScoreInput` désactivé si officiel, `VerdictBadge`, lock UI, **arbre du bracket** (ordre, champion).
- **E2E (Playwright)** — saisie→classement, **officiel→verrouillage**, persistance après rechargement.

## Doubles de test (`src/app/testing/test-doubles.ts`)
`InMemoryPersistence`, `StaticOfficialResultsProvider`, `NoopFileIo` — pour piloter l'état sans I/O réelle.

## Couverture
- Cible : **domaine ~100 %** (la logique critique). Global ~**81 % stmts / 85 % lignes** actuellement.
- Trous connus : `thirds.component`, `app.ts` (import/export/reset/dark) peu couverts.

## Commandes
```bash
npm test        # unitaires (Vitest)
npm run e2e     # E2E (Playwright)
npm run lint    # ESLint (« All files pass linting »)
npm run build   # build de prod
```

## Règle d'or
La logique métier ([[Règles métier]]) est **testée dans le domaine pur** avant tout branchement UI. Aucune règle métier dans les composants.
