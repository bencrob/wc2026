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

## Principes directeurs
- **Une seule source de vérité saisissable** : les pronostics. Tout le reste (classements, qualifiés, bracket, comparaison) est **recalculé** → voir [[Règles techniques#État & réactivité]].
- **Résultats officiels = données serveur saisies à la main**, prioritaires et **verrouillantes** → voir [[Règles métier#Résultats officiels & verrouillage]].
- **Domaine pur, testé** : la logique métier vit dans `domain/`, sans dépendance Angular → [[Règles techniques#Architecture hexagonale]].
