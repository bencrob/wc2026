---
tags: [pronoscup, technique, déploiement]
---

# Déploiement

Hébergement **Vercel** (statique + CDN, aucun backend). Repo `bencrob/wc2026`.

## Configuration
- `vercel.json` : `framework: angular`, `buildCommand: npm run build`, `outputDirectory: dist/wcng2026/browser`.
- ⚠️ L'**output dir** doit pointer sur `.../browser` (sortie du builder `@angular/build:application`), sinon page blanche.

## Cycle de déploiement
- **`git push` sur `main` → Vercel redéploie automatiquement.** Pas de commande manuelle.
- Redéploiement sans changement : dashboard Vercel → *Deployments* → *Redeploy*.

## Mettre à jour les résultats officiels
Cf. [[Règles métier#Résultats officiels & verrouillage]].
1. Éditer `public/official-results.json` (ajouter les scores réels ; `winner` obligatoire sur un KO nul).
2. `git commit` + `git push`.
3. Vercel redéploie → au prochain chargement, les matchs concernés passent **verrouillés** + comparaison affichée.

Format :
```json
{ "version": 1, "results": { "M1": { "home": 3, "away": 1 },
                             "M73": { "home": 1, "away": 1, "winner": "home" } } }
```

## PWA / hors-ligne
- Service worker (`ngsw-config.json`) actif **en prod uniquement**. Cache : app-shell + JS/CSS + **polices auto-hébergées** ; `official-results.json` en stratégie **freshness** (réseau d'abord, repli cache → verrouillage maintenu hors-ligne).
- Installable (manifest « Pronoscup 2026 »).

## SEO
- `public/robots.txt` + `public/sitemap.xml` + `<meta name="description">` (corrige l'erreur SPA « robots.txt invalide »).

## Conventions Git
- Auteur : `bencrob <benjapi@free.fr>`. **Jamais** de mention Claude/Anthropic dans les commits.
