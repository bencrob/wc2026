---
tags: [pronoscup, moc]
---

# 🏆 Pronoscup 2026 — Documentation

Coffre Obsidian des **règles** du projet (ouvre ce dossier `docs/` comme *vault* Obsidian).
Pronostics de la Coupe du Monde FIFA 2026 — application Angular statique, hors-ligne (PWA), sans backend. Repo : `bencrob/wc2026`.

## Carte du coffre
- [[Règles métier]] — format du tournoi, classements, qualification, tableau final, tirs au but, résultats officiels.
- [[Règles techniques]] — stack Angular 22, architecture hexagonale, SOLID, signals, conventions, perf.
- [[Tests et qualité]] — pyramide de tests, couverture, lint, doubles.
- [[Déploiement]] — Vercel, PWA, mise à jour des résultats officiels.

## Guidelines (en anglais)
Règles de développement détaillées dans [guidelines/](guidelines/) :
- [Unit testing](guidelines/01-unit-testing.guidelines.md) — Vitest, TestBed, doubles, signal inputs, logs propres.
- [Refactoring](guidelines/02-refactoring.guidelines.md) — interfaces vs classes, ports & adapters, DI par tokens.
- [Reusable UI](guidelines/03-reusable-ui.guidelines.md) — règles des composants `presentation/ui/`.
- [Performance](guidelines/04-performance.guidelines.md) — pipes purs et optimisations.
- [Signals](guidelines/05-signals.guidelines.md) — readonly, generics, computed, effects.
- [Organization](guidelines/06-organization.guidelines.md) — couches hexagonales, règles de placement, exports.

Voir aussi [CLAUDE.md](../CLAUDE.md) (guide pour les agents IA et résumé des conventions).

## Principes directeurs
- **Une seule source de vérité saisissable** : les pronostics. Tout le reste (classements, qualifiés, bracket, comparaison) est **recalculé** → voir [[Règles techniques#État & réactivité]].
- **Résultats officiels = données serveur saisies à la main**, prioritaires et **verrouillantes** → voir [[Règles métier#Résultats officiels & verrouillage]].
- **Domaine pur, testé** : la logique métier vit dans `domain/`, sans dépendance Angular → [[Règles techniques#Architecture hexagonale]].
